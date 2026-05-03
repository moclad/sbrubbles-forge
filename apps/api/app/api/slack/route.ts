import { generateText, Output } from '@repo/ai';
import { models } from '@repo/ai/lib/models';
import { and, database, desc, gte, lte } from '@repo/database';
import { category, expense, failedMessage, trip } from '@repo/database/db/schema';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { after } from 'next/server';
import { z } from 'zod';
import { env } from '@/env';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Track recently processed events to prevent duplicates
const processedEvents = new Set<string>();
const MAX_TRACKED_EVENTS = 1000;

function isEventProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) {
    return true;
  }
  processedEvents.add(eventId);

  // Prevent memory leak by limiting size
  if (processedEvents.size > MAX_TRACKED_EVENTS) {
    const firstItem = processedEvents.values().next().value as string;
    processedEvents.delete(firstItem);
  }

  return false;
}

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
    const aVal = a[i];
    const bVal = b[i];
    if (aVal === undefined || bVal === undefined) {
      return false;
    }
    // biome-ignore lint/suspicious/noBitwiseOperators: required for constant-time comparison to prevent timing attacks
    diff |= aVal ^ bVal;
  }
  return diff === 0;
}

// Slack payload types
type SlackUrlVerification = {
  challenge: string;
  type: 'url_verification';
};

type SlackEventCallback = {
  event: {
    type: string;
    text?: string;
    channel?: string;
    bot_id?: string;
    subtype?: string;
    ts?: string;
    user?: string;
  };
  event_id: string;
  type: 'event_callback';
};

type SlackPayload = SlackUrlVerification | SlackEventCallback | { type: string };

const parsedExpenseSchema = z.object({
  amount: z.number().describe('The expense amount as a positive number'),
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

  const { output: parsed } = await generateText({
    model: models.chat,
    output: Output.object({ schema: parsedExpenseSchema }),
    prompt: `Parse the following expense message and extract the amount, description, and best matching category.
Available categories: ${categoryNames}
Message: "${text}"`,
  });
  console.log(parsed);

  if (parsed.amount <= 0) {
    throw new Error('Expense amount must be positive');
  }

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

  const defaultCategory = categories[0];
  if (!defaultCategory) {
    throw new Error('No categories available');
  }

  const matchedCategory =
    categories.find((c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase()) ?? defaultCategory;

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

  console.log('Received Slack request with body:', rawBody);

  const isValid = await verifySlackSignature(request, rawBody);
  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';

  // Slash command: application/x-www-form-urlencoded
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(rawBody);
    const triggerId = params.get('trigger_id');

    // Prevent duplicate slash command processing
    if (triggerId && isEventProcessed(triggerId)) {
      return Response.json({ ok: true });
    }

    const text = params.get('text')?.trim();

    if (!text) {
      return Response.json({ response_type: 'ephemeral', text: 'Usage: /expense <amount> <description>' });
    }

    const channel = params.get('channel_id') ?? '';

    // Respond immediately to Slack to prevent retries
    after(async () => {
      try {
        const summary = await parseAndCreateExpense(text);
        await postToSlack(channel, `✅ ${summary}`);
      } catch (error) {
        const message = parseError(error);
        log.error(message);

        // Log failed message to database
        await database.insert(failedMessage).values({
          errorMessage: message,
          messageText: text,
          metadata: JSON.stringify({
            channelId: params.get('channel_id'),
            userId: params.get('user_id'),
            userName: params.get('user_name'),
          }),
          source: 'slack_slash_command',
        });

        await postToSlack(channel, `❌ Could not log expense: ${message}`);
      }
    });

    return Response.json({ response_type: 'ephemeral', text: '⏳ Processing your expense...' });
  }

  // JSON payload: event callbacks and URL verification
  let payload: SlackPayload;
  try {
    payload = JSON.parse(rawBody) as SlackPayload;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Slack URL verification challenge
  if (payload.type === 'url_verification') {
    const verification = payload as SlackUrlVerification;
    return Response.json({ challenge: verification.challenge });
  }

  if (payload.type !== 'event_callback') {
    return Response.json({ ok: true });
  }

  // Type narrowing: payload is now SlackEventCallback
  const eventCallback = payload as SlackEventCallback;

  // Prevent duplicate event processing
  const eventId = eventCallback.event_id;
  if (eventId && isEventProcessed(eventId)) {
    return Response.json({ ok: true });
  }

  const event = eventCallback.event;

  if (!event || event.type !== 'message' || event.bot_id || event.subtype || event.channel !== env.SLACK_CHANNEL_ID) {
    return Response.json({ ok: true });
  }

  const messageText = typeof event.text === 'string' ? event.text.trim() : '';
  const channel = typeof event.channel === 'string' ? event.channel : env.SLACK_CHANNEL_ID;

  // Ignore empty messages or slash commands (already handled separately)
  if (!messageText || messageText.startsWith('/')) {
    return Response.json({ ok: true });
  }

  after(async () => {
    try {
      const summary = await parseAndCreateExpense(messageText);
      await postToSlack(channel, `✅ ${summary}`);
    } catch (error) {
      const message = parseError(error);
      log.error(message);

      // Log failed message to database
      await database.insert(failedMessage).values({
        errorMessage: message,
        messageText,
        metadata: JSON.stringify({
          channel,
          timestamp: event.ts,
          userId: event.user,
        }),
        source: 'slack_message',
      });

      await postToSlack(channel, `❌ Could not log expense: ${message}`);
    }
  });

  return Response.json({ ok: true });
};
