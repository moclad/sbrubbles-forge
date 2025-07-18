import { StorageApiError, StorageClient } from '@supabase/storage-js';

import { log } from '../observability/log';
import { PRIVATE_ASSETS_BUCKET, PUBLIC_ASSETS_BUCKET } from './buckets';
import { keys } from './keys';

export const storageClient = (token: string) => {
  return new StorageClient(keys().STORAGE_URL ?? '', {
    Authorization: `Bearer ${token}`,
  });
};

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
  // const result = await fetch(`${keys().BETTER_AUTH_URL}/api/auth/token`);
  // log.error(result);
  const token =
    'eyJhbGciOiJFZERTQSIsImtpZCI6IngzOFpzcDR2Nklhc3d1NnFyZnZGQlZJUGVhd1pmdzFFIn0.eyJuYW1lIjoiU2JydWJsZXMgV29yayIsImVtYWlsIjoic2JydWJibGVzQHNicnViYmxlcy53b3JrIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwiaW1hZ2UiOm51bGwsImNyZWF0ZWRBdCI6IjIwMjUtMDctMTVUMTk6MDg6MjAuOTgzWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDctMTVUMTk6MDg6MjAuOTgzWiIsInR3b0ZhY3RvckVuYWJsZWQiOm51bGwsInJvbGUiOiJ1c2VyIiwiYmFubmVkIjpudWxsLCJiYW5SZWFzb24iOm51bGwsImJhbkV4cGlyZXMiOm51bGwsImlkIjoic0VGUjd4TzlJd2NtU0JncmUwSmlubGlRcnZFbm9yMHciLCJpYXQiOjE3NTI4NTEwOTgsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMiIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMiIsImV4cCI6MTc1Mjg1MTk5OCwic3ViIjoic0VGUjd4TzlJd2NtU0JncmUwSmlubGlRcnZFbm9yMHcifQ.fH5zbRNJUYuXY-0W2ZPddI-EzqqSMCC6y1ACpt-ivoz7-csq0Jf5uNMyafrSRGSPEGeQCO0Czirv2dBkKyLxDg';

  await Promise.all(
    STANDARD_BUCKETS.map(async (bucket) => {
      try {
        log.info(` --> Checking bucket: ${bucket.name}`);
        const { error } = await storageClient(token).getBucket(bucket.name);

        if (error) {
          if ((error as StorageApiError)?.status === 404) {
            const result = await storageClient(token).createBucket(
              bucket.name,
              {
                ...BUCKET_CONFIG,
                ...bucket.config,
              }
            );
            log.info(
              `Bucket ${bucket.name} not found, creating..., result:`,
              result
            );
          } else {
            log.error(`Failed to initialize bucket ${bucket.name}:`, error);
            throw error;
          }
        }
      } catch (error: unknown) {
        log.info(`Bucket ${bucket.name} not found, creating...`);
        if ((error as StorageApiError)?.status === 404) {
          await storageClient(token).createBucket(bucket.name, {
            ...BUCKET_CONFIG,
            ...bucket.config,
          });
        } else {
          log.error(
            `Failed to initialize bucket ${bucket.name}:`,
            (error as Error)?.message
          );
          throw error;
        }
      }
    })
  );
}

// Initialize standard buckets at startup
//initializeStandardBuckets();
