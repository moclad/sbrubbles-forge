import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      STORAGE_URL: process.env.STORAGE_URL,
    },
    server: {
      STORAGE_URL: z.string().min(1).optional(),
    },
  });
