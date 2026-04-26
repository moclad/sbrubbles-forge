'use server';

import { auth } from '@repo/auth/server';
import { database, eq } from '@repo/database';
import { s3_objects } from '@repo/database/db/storage';
import { deleteFile, listUserFiles } from '@repo/storage/s3-file-management';
import { headers } from 'next/headers';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Get all files uploaded by the current user
 */
export async function getUserFiles() {
  const session = await requireSession();
  return await listUserFiles(session.user.id);
}

/**
 * Delete a file by ID (with authorization check)
 */
export async function deleteUserFile(fileId: string): Promise<boolean> {
  const session = await requireSession();

  // Verify the file belongs to the current user
  const fileRecord = await database.query.s3_objects.findFirst({
    where: eq(s3_objects.id, fileId),
  });

  if (!fileRecord) {
    throw new Error('File not found');
  }

  if (fileRecord.created_by !== session.user.id) {
    throw new Error('Unauthorized: You can only delete your own files');
  }

  return await deleteFile(fileId);
}
