import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      S3_SECRET_KEY: process.env.S3_SECRET_KEY,
      S3_STORAGE_URL: process.env.STORAGE_URL,
      S3_USE_SSL: process.env.S3_USE_SSL,
    },
    server: {
      S3_ACCESS_KEY: z.string().min(1).optional(),
      S3_BUCKET_NAME: z.string().min(1).optional(),
      S3_SECRET_KEY: z.string().min(1).optional(),
      S3_STORAGE_URL: z.string().min(1).optional(),
      S3_USE_SSL: z.boolean().optional(),
    },
  });
