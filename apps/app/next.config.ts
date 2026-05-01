import { createNextConfig } from '@repo/next-config';
import { applyAnalyzer, applyLogging, applySentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
import { env } from '@/env';

/**
 * Next.js configuration for the main app
 *
 * Configuration flow:
 * 1. Start with base config from @repo/next-config (images, rewrites, etc.)
 * 2. Apply logging (always enabled)
 * 3. Conditionally apply Sentry (when env.SENTRY is true)
 * 4. Conditionally apply analyzer (when env.ANALYZE is 'true')
 * 5. Override transpilePackages with app-specific packages
 */
const nextConfig: NextConfig = createNextConfig()
  .extend(applyLogging)
  .extendIf(!!env.SENTRY, applySentry)
  .extendIf(env.ANALYZE === 'true', applyAnalyzer)
  .transpile(['@repo/design-system', '@repo/auth'])
  .build();

export default nextConfig;
