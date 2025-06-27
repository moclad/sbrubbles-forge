import { StorageApiError, StorageClient } from '@supabase/storage-js';

import { PUBLIC_ASSETS_BUCKET, PRIVATE_ASSETS_BUCKET } from './buckets';
import { keys } from './keys';

const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

export const storageClient = new StorageClient(keys().STORAGE_URL ?? '', {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

const STANDARD_BUCKETS = [
  { name: PUBLIC_ASSETS_BUCKET, config: { public: true } },
  { name: PRIVATE_ASSETS_BUCKET, config: { public: false } },
];

const BUCKET_CONFIG = {
  fileSizeLimit: 100 * 1024 * 1024, // 100 MB
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
};

export async function initializeStandardBuckets() {
  for (const bucket of STANDARD_BUCKETS) {
    try {
      await storageClient.getBucket(bucket.name);
    } catch (error) {
      if ((error as StorageApiError)?.status === 400) {
        await storageClient.createBucket(bucket.name, {
          ...BUCKET_CONFIG,
          ...bucket.config,
        });
      } else {
        throw error;
      }
    }
  }
}

// Initialize standard buckets at startup
initializeStandardBuckets().catch(console.error);
