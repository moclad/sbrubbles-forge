import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const pageTable = pgTable('Page', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  street: varchar({ length: 255 }).notNull(),
});

export * from './auth';
