import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      SVIX_TOKEN: process.env.SVIX_TOKEN,
    },
    server: {
      SVIX_TOKEN: z.union([z.string(), z.string()]).optional(),
    },
  });
