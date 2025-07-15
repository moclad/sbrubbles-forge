import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    },
    server: {
      UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
      UPSTASH_REDIS_REST_URL: z.string().min(1).url().optional(),
    },
  });
