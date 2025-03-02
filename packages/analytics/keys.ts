import { z } from 'zod';

import { createEnv } from '@t3-oss/env-nextjs';

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.string().optional(),
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    },
  });
