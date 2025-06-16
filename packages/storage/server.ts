import { NextResponse } from 'next/server';

import { StorageApiError, StorageClient } from '@supabase/storage-js';

import { PUBLIC_ASSETS_BUCKET } from './buckets';
import { keys } from './keys';

const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const storageClient = new StorageClient(keys().STORAGE_URL ?? '', {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

export async function getFiles(userId: string) {
  const { data: list, error: listError } =
    await storageClient.getBucket(PUBLIC_ASSETS_BUCKET);

  const { data } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .createSignedUrl(`${userId}/avatar`, 60 * 60 * 24 * 7); // 7 days

  console.log(data);

  if (listError && (listError as StorageApiError)?.status === 400) {
    const { data, error } = await storageClient.createBucket(
      PUBLIC_ASSETS_BUCKET,
      {
        public: true,
        fileSizeLimit: 100 * 1024 * 1024, // 100 MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ],
      }
    );

    return NextResponse.json(data ?? []);
  }

  return NextResponse.json(data ?? []);
}

export async function uploadAvatar(userId: string, fileStream: File | Blob) {
  const { data, error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .upload(`${userId}/avatar`, fileStream, { upsert: true });

  if (error) {
    return NextResponse.json(error);
  }

  return NextResponse.json(data?.id ?? '');
}
