'use server';

import { auth } from '@repo/auth/server';
import { asc, database, eq } from '@repo/database';
import { person } from '@repo/database/db/schema';
import { PUBLIC_ASSETS_BUCKET } from '@repo/storage/buckets';
import { createBucketIfNotExists, s3Client } from '@repo/storage/s3-file-management';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

type PersonData = {
  name: string;
  avatarUrl?: string | null;
};

export async function getPeople() {
  await requireSession();
  return database.select().from(person).orderBy(asc(person.name));
}

export async function createPerson(data: PersonData) {
  await requireSession();
  const rows = await database
    .insert(person)
    .values({
      avatarUrl: data.avatarUrl ?? null,
      name: data.name,
    })
    .returning();
  revalidatePath('/settings/people');
  return rows[0];
}

export async function updatePerson(id: string, data: PersonData) {
  await requireSession();
  await database
    .update(person)
    .set({
      avatarUrl: data.avatarUrl ?? null,
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(person.id, id));
  revalidatePath('/settings/people');
}

export async function deletePerson(id: string) {
  await requireSession();
  await database.delete(person).where(eq(person.id, id));
  revalidatePath('/settings/people');
}

export async function uploadPersonAvatar(personId: string, formData: FormData): Promise<string> {
  await requireSession();

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file provided');
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg';
  const key = `avatar/${personId}/avatar.${ext ?? 'jpg'}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await createBucketIfNotExists(PUBLIC_ASSETS_BUCKET);
  await s3Client.putObject(PUBLIC_ASSETS_BUCKET, key, buffer, buffer.length, {
    'Content-Type': file.type || 'image/jpeg',
  });

  const storageUrl = process.env.S3_STORAGE_URL ?? 'http://localhost';
  return `${storageUrl.replace(/\/$/, '')}/${PUBLIC_ASSETS_BUCKET}/${key}`;
}
