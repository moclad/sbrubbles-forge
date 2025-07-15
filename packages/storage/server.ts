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
    'eyJhbGciOiJFZERTQSIsImtpZCI6InFhUlRURXpQSWQzOGZRTGRPaXpUY2xBdXVOWGJCWTNVIn0.eyJuYW1lIjoiU2JydWJibGVzIFcuIiwiZW1haWwiOiJzYnJ1YmJsZXNAc2JydWJibGVzLndvcmsiLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJpbWFnZSI6bnVsbCwiY3JlYXRlZEF0IjoiMjAyNS0wNi0yN1QxNjowNzoxOC42MzRaIiwidXBkYXRlZEF0IjoiMjAyNS0wNi0yN1QxNjowNzoxOC42MzRaIiwidHdvRmFjdG9yRW5hYmxlZCI6bnVsbCwicm9sZSI6InVzZXIiLCJiYW5uZWQiOm51bGwsImJhblJlYXNvbiI6bnVsbCwiYmFuRXhwaXJlcyI6bnVsbCwiaWQiOiIwUEVaUDJkMUVGVmxOb0FRSzl6THlYeks1TXFFNURoeiIsImlhdCI6MTc1MjUyNTYxNiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAyIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMDAyIiwiZXhwIjoxNzUyNTI2NTE2LCJzdWIiOiIwUEVaUDJkMUVGVmxOb0FRSzl6THlYeks1TXFFNURoeiJ9.gMAljSRkqCwDOwi8kJy5qMAkR_rZl-SJTo7JnCVNaUBhMOyuUsaCiGIGJQRhH-hxhHkvk177aWv_N66bxhr_CQ';

  log.error('Initializing standard buckets...', keys().STORAGE_URL);
  await Promise.all(
    STANDARD_BUCKETS.map(async (bucket) => {
      try {
        log.info(`Checking bucket: ${bucket.name}`);
        const { error } = await storageClient(token).getBucket(bucket.name);

        if (error) {
          log.info(`Bucket ${bucket.name} not found, creating...`);
          if ((error as StorageApiError)?.status === 400) {
            await storageClient(token).createBucket(bucket.name, {
              ...BUCKET_CONFIG,
              ...bucket.config,
            });
          } else {
            log.error(`Failed to initialize bucket ${bucket.name}:`, error);
            throw error;
          }
        }
      } catch (error) {
        log.info(`Bucket ${bucket.name} not found, creating...`);
        if ((error as StorageApiError)?.status === 400) {
          await storageClient(token).createBucket(bucket.name, {
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
