'use server';

import { generateText, Output } from '@repo/ai';
import { models } from '@repo/ai/lib/models';
import { auth } from '@repo/auth/server';
import { and, database, desc, eq, gte, isNull, lte } from '@repo/database';
import { category, expense, failedMessage, trip } from '@repo/database/db/schema';
import { parseError } from '@repo/observability/error';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

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

  const matchedCategory =
    categories.find((c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase()) ?? categories[0];

  if (!matchedCategory) {
    throw new Error('No category found');
  }

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

export async function getFailedMessages() {
  await requireSession();
  return database
    .select()
    .from(failedMessage)
    .where(isNull(failedMessage.resolvedAt))
    .orderBy(desc(failedMessage.createdAt));
}

export async function retryFailedMessage(messageId: string) {
  await requireSession();

  const [message] = await database.select().from(failedMessage).where(eq(failedMessage.id, messageId)).limit(1);

  if (!message) {
    throw new Error('Message not found');
  }

  if (message.resolvedAt) {
    throw new Error('Message already resolved');
  }

  try {
    const summary = await parseAndCreateExpense(message.messageText);

    // Mark as resolved
    await database
      .update(failedMessage)
      .set({ resolvedAt: /* @__PURE__ */ new Date() })
      .where(eq(failedMessage.id, messageId));

    revalidatePath('/failed-messages');

    return summary;
  } catch (error) {
    throw new Error(parseError(error));
  }
}
