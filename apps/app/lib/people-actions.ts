'use server';

import { auth } from '@repo/auth/server';
import { asc, database, eq } from '@repo/database';
import { person } from '@repo/database/db/schema';
import { PUBLIC_ASSETS_BUCKET } from '@repo/storage/buckets';
import { deleteFileByPath, uploadFile } from '@repo/storage/s3-file-management';
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
  const session = await requireSession();

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file provided');
  }

  // Get current person to check for existing avatar
  const [currentPerson] = await database.select().from(person).where(eq(person.id, personId));

  // Delete old avatar if it exists
  if (currentPerson?.avatarUrl) {
    try {
      // Extract bucket and filename from URL
      const url = new URL(currentPerson.avatarUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        const bucket = pathParts[0];
        const fileName = pathParts.slice(1).join('/');
        await deleteFileByPath(bucket, fileName);
      }
    } catch (error) {
      // Log but don't fail if old file deletion fails
      console.error('Failed to delete old avatar:', error);
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload new file with database tracking
  const result = await uploadFile({
    bucket: PUBLIC_ASSETS_BUCKET,
    file: buffer,
    originalFileName: file.name,
    pathPrefix: `avatar/${personId}/`,
    userId: session.user.id,
  });

  return result.url;
}
