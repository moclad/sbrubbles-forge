/** biome-ignore-all assist/source/useSortedKeys: Tables keys should not be sorted */
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { category } from './categories';
import { person } from './people';
import { trip } from './trips';

export const expense = pgTable('expense', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tripId: text('trip_id')
    .notNull()
    .references(() => trip.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => category.id),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  locationName: text('location_name'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const expensePerson = pgTable(
  'expense_person',
  {
    expenseId: text('expense_id')
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => person.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.expenseId, t.personId] })]
);

export type SelectExpense = InferSelectModel<typeof expense>;
export type InsertExpense = InferInsertModel<typeof expense>;
export type SelectExpensePerson = InferSelectModel<typeof expensePerson>;
