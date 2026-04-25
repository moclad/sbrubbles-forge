import { after } from 'next/server';
import { z } from 'zod';

import { env } from '@/env';
import { generateObject } from '@repo/ai';
import { models } from '@repo/ai/lib/models';
import { and, database, desc, gte, lte } from '@repo/database';
import { category, expense, trip } from '@repo/database/db/schema';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

async function verifySlackSignature(request: Request, rawBody: string): Promise<boolean> {
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');

  if (!(timestamp && signature)) {
    return false;
  }

  const tsNum = Number.parseInt(timestamp, 10);
  if (Number.isNaN(tsNum) || Math.abs(Date.now() - tsNum * 1000) > FIVE_MINUTES_MS) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SLACK_SIGNING_SECRET),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigBaseString));
  const computed = `v0=${Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  const a = new TextEncoder().encode(computed);
  const b = new TextEncoder().encode(signature);
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: required for constant-time comparison to prevent timing attacks
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

const parsedExpenseSchema = z.object({
  amount: z.number().positive().describe('The expense amount as a positive number'),
  categoryName: z.string().describe('Best matching category name from the provided list'),
  description: z.string().describe('A concise description of the expense'),
  locationName: z.string().nullable().describe('Location or venue name if mentioned, otherwise null'),
});

async function parseAndCreateExpense(text: string): Promise<string> {
  const categories = await database.select({ id: category.id, name: category.name }).from(category);

  if (categories.length === 0) {
    throw new Error('No categories configured');
  }

  const categoryNames = categories.map((c) => c.name).join(', ');

  const { object: parsed } = await generateObject({
    model: models.chat,
    prompt: `Parse the following expense message and extract the amount, description, and best matching category.
Available categories: ${categoryNames}
Message: "${text}"`,
    schema: parsedExpenseSchema,
  });

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const [activeTrip] = await database
    .select({ id: trip.id, name: trip.name })
    .from(trip)
    .where(and(lte(trip.startDate, endOfToday), gte(trip.endDate, startOfToday)))
    .orderBy(desc(trip.startDate))
    .limit(1);

  if (!activeTrip) {
    throw new Error('No active trip found for today');
  }

  const matchedCategory =
    categories.find((c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase()) ?? categories[0];

  await database.insert(expense).values({
    amount: parsed.amount,
    categoryId: matchedCategory.id,
    description: parsed.description.trim(),
    expenseDate: today,
    locationName: parsed.locationName?.trim() ?? null,
    tripId: activeTrip.id,
  });

  return `Logged $${parsed.amount.toFixed(2)} — ${parsed.description} (${matchedCategory.name}) on trip "${activeTrip.name}"`;
}

async function postToSlack(channel: string, text: string): Promise<void> {
  await fetch('https://slack.com/api/chat.postMessage', {
    body: JSON.stringify({ channel, text }),
    headers: {
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
}

export const POST = async (request: Request): Promise<Response> => {
  const rawBody = await request.text();

  const isValid = await verifySlackSignature(request, rawBody);
  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';

  // Slash command: application/x-www-form-urlencoded
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(rawBody);
    const text = params.get('text')?.trim();

    if (!text) {
      return Response.json({ response_type: 'ephemeral', text: 'Usage: /expense <amount> <description>' });
    }

    try {
      const summary = await parseAndCreateExpense(text);
      return Response.json({ response_type: 'in_channel', text: `✅ ${summary}` });
    } catch (error) {
      const message = parseError(error);
      log.error(message);
      return Response.json({ response_type: 'ephemeral', text: `❌ Could not log expense: ${message}` });
    }
  }

  // JSON payload: event callbacks and URL verification
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Slack URL verification challenge
  if (payload.type === 'url_verification') {
    return Response.json({ challenge: payload.challenge });
  }

  if (payload.type !== 'event_callback') {
    return Response.json({ ok: true });
  }

  const event = payload.event as Record<string, unknown> | undefined;

  if (!event || event.type !== 'message' || event.bot_id || event.subtype || event.channel !== env.SLACK_CHANNEL_ID) {
    return Response.json({ ok: true });
  }

  const messageText = typeof event.text === 'string' ? event.text.trim() : '';
  const channel = typeof event.channel === 'string' ? event.channel : env.SLACK_CHANNEL_ID;

  if (!messageText) {
    return Response.json({ ok: true });
  }

  after(async () => {
    try {
      const summary = await parseAndCreateExpense(messageText);
      await postToSlack(channel, `✅ ${summary}`);
    } catch (error) {
      const message = parseError(error);
      log.error(message);
      await postToSlack(channel, `❌ Could not log expense: ${message}`);
    }
  });

  return Response.json({ ok: true });
};
