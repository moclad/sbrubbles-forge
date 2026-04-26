'use server';

import { auth } from '@repo/auth/server';
import { database, eq } from '@repo/database';
import { userPreferences } from '@repo/database/db/schema';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'] as const;

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getUserPreferences() {
  const session = await requireSession();

  // Try to get existing preferences
  const [preferences] = await database
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id))
    .limit(1);

  // Create default preferences if they don't exist (lazy creation)
  if (!preferences) {
    const [newPreferences] = await database
      .insert(userPreferences)
      .values({
        currency: 'EUR',
        userId: session.user.id,
      })
      .returning();

    return newPreferences;
  }

  return preferences;
}

export async function updateCurrency(currency: string) {
  await requireSession();

  // Validate currency
  if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // Get or create preferences
  const preferences = await getUserPreferences();

  // Update currency
  await database
    .update(userPreferences)
    .set({
      currency,
      updatedAt: /* @__PURE__ */ new Date(),
    })
    .where(eq(userPreferences.id, preferences.id));

  revalidatePath('/settings/configuration');
  revalidatePath('/trips');

  return { success: true };
}

export async function getSupportedCurrencies() {
  return await SUPPORTED_CURRENCIES;
}
