import { generateText, Output } from '@repo/ai';
import { models } from '@repo/ai/lib/models';
import { and, database, desc, eq, gte, lte } from '@repo/database';
import { category, expense, failedMessage, trip } from '@repo/database/db/schema';
import { parseError } from '@repo/observability/error';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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

export const POST = async (request: Request): Promise<Response> => {
  try {
    const { messageId } = (await request.json()) as { messageId: string };

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    // Get the failed message
    const [message] = await database.select().from(failedMessage).where(eq(failedMessage.id, messageId)).limit(1);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.resolvedAt) {
      return NextResponse.json({ error: 'Message already resolved' }, { status: 400 });
    }

    // Try to parse and create expense again
    try {
      const summary = await parseAndCreateExpense(message.messageText);

      // Mark as resolved
      await database
        .update(failedMessage)
        .set({ resolvedAt: /* @__PURE__ */ new Date() })
        .where(eq(failedMessage.id, messageId));

      return NextResponse.json({ success: true, summary });
    } catch (error) {
      const errorMessage = parseError(error);
      return NextResponse.json({ error: errorMessage, success: false }, { status: 422 });
    }
  } catch (error) {
    const errorMessage = parseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
