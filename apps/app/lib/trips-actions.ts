'use server';

import { auth } from '@repo/auth/server';
import { database, desc, eq, inArray, sum } from '@repo/database';
import { expense, person, trip, tripPerson } from '@repo/database/db/schema';
import { PUBLIC_ASSETS_BUCKET } from '@repo/storage/buckets';
import { createBucketIfNotExists, s3Client } from '@repo/storage/s3-file-management';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const TRAILING_SLASH_RE = /\/$/;

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export type TripData = {
  name: string;
  startDate: Date;
  endDate: Date;
  locationName?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  personIds: string[];
};

export type TripWithPeople = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  locationName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  coverPhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  people: { id: string; name: string; avatarUrl: string | null }[];
  totalCost: number;
};

export async function getTrips(): Promise<TripWithPeople[]> {
  await requireSession();

  const trips = await database.select().from(trip).orderBy(desc(trip.startDate));

  if (trips.length === 0) {
    return [];
  }

  const tripIds = trips.map((t) => t.id);

  const rows = await database
    .select({
      avatarUrl: person.avatarUrl,
      personId: person.id,
      personName: person.name,
      tripId: tripPerson.tripId,
    })
    .from(tripPerson)
    .innerJoin(person, eq(tripPerson.personId, person.id))
    .where(tripIds.length === 1 ? eq(tripPerson.tripId, tripIds[0]) : inArray(tripPerson.tripId, tripIds));

  const costRows = await database
    .select({
      total: sum(expense.amount),
      tripId: expense.tripId,
    })
    .from(expense)
    .where(tripIds.length === 1 ? eq(expense.tripId, tripIds[0]) : inArray(expense.tripId, tripIds))
    .groupBy(expense.tripId);

  const costByTrip = new Map<string, number>();
  for (const row of costRows) {
    costByTrip.set(row.tripId, Number.parseFloat(row.total ?? '0'));
  }

  const peopleByTrip = new Map<string, { id: string; name: string; avatarUrl: string | null }[]>();
  for (const row of rows) {
    const list = peopleByTrip.get(row.tripId) ?? [];
    list.push({
      avatarUrl: row.avatarUrl,
      id: row.personId,
      name: row.personName,
    });
    peopleByTrip.set(row.tripId, list);
  }

  return trips.map((t) => ({
    ...t,
    people: peopleByTrip.get(t.id) ?? [],
    totalCost: costByTrip.get(t.id) ?? 0,
  }));
}

export async function getTripById(id: string): Promise<TripWithPeople | null> {
  await requireSession();

  const [tripRow] = await database.select().from(trip).where(eq(trip.id, id));

  if (!tripRow) {
    return null;
  }

  const rows = await database
    .select({
      avatarUrl: person.avatarUrl,
      personId: person.id,
      personName: person.name,
    })
    .from(tripPerson)
    .innerJoin(person, eq(tripPerson.personId, person.id))
    .where(eq(tripPerson.tripId, id));

  const [costRow] = await database
    .select({ total: sum(expense.amount) })
    .from(expense)
    .where(eq(expense.tripId, id));

  return {
    ...tripRow,
    people: rows.map((row) => ({
      avatarUrl: row.avatarUrl,
      id: row.personId,
      name: row.personName,
    })),
    totalCost: Number.parseFloat(costRow?.total ?? '0'),
  };
}

export async function createTrip(data: TripData) {
  await requireSession();

  const [created] = await database
    .insert(trip)
    .values({
      endDate: data.endDate,
      locationLat: data.locationLat ?? null,
      locationLng: data.locationLng ?? null,
      locationName: data.locationName ?? null,
      name: data.name,
      startDate: data.startDate,
    })
    .returning();

  if (data.personIds.length > 0) {
    await database.insert(tripPerson).values(data.personIds.map((personId) => ({ personId, tripId: created.id })));
  }

  revalidatePath('/trips');
  return created;
}

export async function updateTrip(id: string, data: TripData) {
  await requireSession();

  await database
    .update(trip)
    .set({
      endDate: data.endDate,
      locationLat: data.locationLat ?? null,
      locationLng: data.locationLng ?? null,
      locationName: data.locationName ?? null,
      name: data.name,
      startDate: data.startDate,
      updatedAt: new Date(),
    })
    .where(eq(trip.id, id));

  await database.delete(tripPerson).where(eq(tripPerson.tripId, id));

  if (data.personIds.length > 0) {
    await database.insert(tripPerson).values(data.personIds.map((personId) => ({ personId, tripId: id })));
  }

  revalidatePath('/trips');
}

export async function deleteTrip(id: string) {
  await requireSession();
  await database.delete(trip).where(eq(trip.id, id));
  revalidatePath('/trips');
}

export async function uploadTripCoverPhoto(tripId: string, formData: FormData): Promise<string> {
  await requireSession();

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file provided');
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg';
  const key = `trip/${tripId}/cover.${ext ?? 'jpg'}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await createBucketIfNotExists(PUBLIC_ASSETS_BUCKET);
  await s3Client.putObject(PUBLIC_ASSETS_BUCKET, key, buffer, buffer.length, {
    'Content-Type': file.type || 'image/jpeg',
  });

  const storageUrl = process.env.S3_STORAGE_URL ?? 'http://localhost';
  const url = `${storageUrl.replace(TRAILING_SLASH_RE, '')}/${PUBLIC_ASSETS_BUCKET}/${key}`;

  await database.update(trip).set({ coverPhotoUrl: url, updatedAt: new Date() }).where(eq(trip.id, tripId));

  revalidatePath('/trips');
  return url;
}
