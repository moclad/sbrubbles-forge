import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      S3_ACCESS_KEY: process.env['S3_ACCESS_KEY'],
      S3_SECRET_KEY: process.env['S3_SECRET_KEY'],
      S3_STORAGE_URL: process.env['S3_STORAGE_URL'],
    },
    server: {
      S3_ACCESS_KEY: z.string().min(1).optional(),
      S3_SECRET_KEY: z.string().min(1).optional(),
      S3_STORAGE_URL: z.string().url().optional(),
    },
  });
