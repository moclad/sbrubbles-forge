import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      ANTHROPIC_API_KEY: process.env['ANTHROPIC_API_KEY'],
      OPENAI_API_KEY: process.env['OPENAI_API_KEY'],
    },
    server: {
      ANTHROPIC_API_KEY: z.string().min(1).startsWith('sk-ant-').optional(),
      OPENAI_API_KEY: z.string().min(1).startsWith('sk-').optional(),
    },
  });
