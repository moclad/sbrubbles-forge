import { keys as ai } from '@repo/ai/keys';
import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {},
  extends: [ai(), auth(), analytics(), core(), database(), email(), observability(), payments()],
  runtimeEnv: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  },
  server: {
    SLACK_BOT_TOKEN: z.string().min(1).startsWith('xoxb-'),
    SLACK_CHANNEL_ID: z.string().min(1),
    SLACK_SIGNING_SECRET: z.string().min(1),
  },
});
