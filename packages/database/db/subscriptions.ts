import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth';

import type { InferSelectModel } from 'drizzle-orm';

export const subscription = pgTable(
  'subscription',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
      }),
    subscriptionId: text('subscriptionId').notNull(),
    customerId: text('customerId').notNull(),
    priceId: text('priceId').notNull(),
    status: text('status').notNull(),
    currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
  },
  (table) => [index('customerId_idx').on(table.customerId)]
);

export type SelectSubscription = InferSelectModel<typeof subscription>;
