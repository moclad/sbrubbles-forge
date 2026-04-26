/** biome-ignore-all assist/source/useSortedKeys: Tables keys should not be sorted */
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const failedMessage = pgTable('failed_message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageText: text('message_text').notNull(),
  source: text('source').notNull(), // 'slack', 'api', etc.
  errorMessage: text('error_message').notNull(),
  metadata: text('metadata'), // JSON string for additional context (channel, user, etc.)
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type SelectFailedMessage = InferSelectModel<typeof failedMessage>;
export type InsertFailedMessage = InferInsertModel<typeof failedMessage>;
