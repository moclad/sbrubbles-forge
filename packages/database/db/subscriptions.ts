/** biome-ignore-all assist/source/useSortedKeys: Tables keys should not be sorted */
import type { InferSelectModel } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const subscription = pgTable(
  'subscription',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }),
    customerId: text('customerId').notNull(),
    priceId: text('priceId').notNull(),
    status: text('status').notNull(),
    subscriptionId: text('subscriptionId').notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  },
  (table) => [index('customerId_idx').on(table.customerId)]
);

export type SelectSubscription = InferSelectModel<typeof subscription>;
