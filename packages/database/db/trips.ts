/** biome-ignore-all assist/source/useSortedKeys: Tables keys should not be sorted */
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { person } from './people';

export const trip = pgTable('trip', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  locationName: text('location_name'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  coverPhotoUrl: text('cover_photo_url'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const tripPerson = pgTable(
  'trip_person',
  {
    personId: text('person_id')
      .notNull()
      .references(() => person.id, { onDelete: 'cascade' }),
    tripId: text('trip_id')
      .notNull()
      .references(() => trip.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.tripId, t.personId] })]
);

export type SelectTrip = InferSelectModel<typeof trip>;
export type InsertTrip = InferInsertModel<typeof trip>;
export type SelectTripPerson = InferSelectModel<typeof tripPerson>;
