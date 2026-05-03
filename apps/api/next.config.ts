import { createNextConfig } from '@repo/next-config';
import { applyAnalyzer, applySentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
import { env } from '@/env';

/**
 * Next.js configuration for the API app
 *
 * Configuration flow:
 * 1. Start with base config from @repo/next-config (images, rewrites, etc.)
 * 2. Apply logging (always enabled)
 * 3. Conditionally apply Sentry (when deployed to Vercel)
 * 4. Conditionally apply analyzer (when env.ANALYZE is 'true')
 */
const nextConfig: NextConfig = createNextConfig()
  .extendIf(env.SENTRY === 'true', applySentry)
  .extendIf(env.ANALYZE === 'true', applyAnalyzer)
  .build();

export default nextConfig;
