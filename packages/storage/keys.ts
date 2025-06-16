import { z } from 'zod';

import { createEnv } from '@t3-oss/env-nextjs';

export const keys = () =>
  createEnv({
    server: {
      STORAGE_URL: z.string().min(1).optional(),
    },
    runtimeEnv: {
      STORAGE_URL: process.env.STORAGE_URL,
    },
  });
