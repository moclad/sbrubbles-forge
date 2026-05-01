import { z } from 'zod';

import { createEnv } from '@t3-oss/env-nextjs';

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_API_URL: z.string().min(1).url().optional(),
      NEXT_PUBLIC_APP_URL: z.string().min(1).url(),
      NEXT_PUBLIC_DOCS_URL: z.string().min(1).url().optional(),
    },
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      SENTRY: process.env.SENTRY,
    },
    server: {
      ANALYZE: z.string().optional(),
      SENTRY: z.string().optional(),
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    },
  });
