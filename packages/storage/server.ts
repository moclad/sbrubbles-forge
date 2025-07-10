import { StorageApiError, StorageClient } from '@supabase/storage-js';

import { log } from '../observability/log';
import { PRIVATE_ASSETS_BUCKET, PUBLIC_ASSETS_BUCKET } from './buckets';
import { keys } from './keys';

const SERVICE_KEY = 'super-secret-jwt-token-with-at-least-32-characters-long';

export const storageClient = new StorageClient(keys().STORAGE_URL ?? '', {
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
});

const STANDARD_BUCKETS = [
  { config: { public: true }, name: PUBLIC_ASSETS_BUCKET },
  { config: { public: false }, name: PRIVATE_ASSETS_BUCKET },
];

const BUCKET_CONFIG = {
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ], // 100 MB
  fileSizeLimit: 100 * 1024 * 1024,
};

export async function initializeStandardBuckets() {
  log.error('Initializing standard buckets...', keys().STORAGE_URL);
  await Promise.all(
    STANDARD_BUCKETS.map(async (bucket) => {
      try {
        log.info(`Checking bucket: ${bucket.name}`);
        const { error } = await storageClient.getBucket(bucket.name);

        if (error) {
          log.info(`Bucket ${bucket.name} not found, creating...`);
          if ((error as StorageApiError)?.status === 400) {
            await storageClient.createBucket(bucket.name, {
              ...BUCKET_CONFIG,
              ...bucket.config,
            });
          } else {
            log.error(
              `Failed to initialize bucket ${bucket.name}:`,
              error.message
            );
            throw error;
          }
        }
      } catch (error) {
        log.info(`Bucket ${bucket.name} not found, creating...`);
        if ((error as StorageApiError)?.status === 400) {
          await storageClient.createBucket(bucket.name, {
            ...BUCKET_CONFIG,
            ...bucket.config,
          });
        } else {
          log.error(
            `Failed to initialize bucket ${bucket.name}:`,
            error.message
          );
          throw error;
        }
      }
    })
  );
}

// Initialize standard buckets at startup
initializeStandardBuckets();
