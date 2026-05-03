import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    client: {
      // Added by Sentry Integration, Vercel Marketplace
      NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    },
    runtimeEnv: {
      ANALYZE: process.env['ANALYZE'],
      NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
      SENTRY: process.env['SENTRY'],
      SENTRY_ORG: process.env['SENTRY_ORG'],
      SENTRY_PROJECT: process.env['SENTRY_PROJECT'],
    },
    server: {
      ANALYZE: z.string().optional(),
      SENTRY: z.string().optional(),
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
    },
  });
