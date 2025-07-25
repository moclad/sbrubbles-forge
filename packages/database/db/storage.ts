/** biome-ignore-all assist/source/useSortedKeys: Tables keys should not be sorted */
import type { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const s3_objects = pgTable('s3_objects', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bucket: text('bucket').notNull(),
  fileName: text('fileName').notNull().unique(),
  originalFileName: text('originalFileName').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  fileSize: integer('fileSize'),

  created_by: text('created_by')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
  updated_by: text('updated_by')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
});

export type SelectS3Object = InferSelectModel<typeof s3_objects>;
