import { z } from 'zod';

import { createEnv } from '@t3-oss/env-nextjs';

export const keys = () =>
  createEnv({
    server: {
      ARCJET_KEY: z.string().optional(),
    },
    runtimeEnv: {
      ARCJET_KEY: process.env.ARCJET_KEY,
    },
  });
