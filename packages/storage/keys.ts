import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      STORAGE_URL: process.env.STORAGE_URL,
    },
    server: {
      BETTER_AUTH_URL: z.string().min(1).optional(),
      STORAGE_URL: z.string().min(1).optional(),
    },
  });
