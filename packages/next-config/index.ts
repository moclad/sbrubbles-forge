import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

export const config: NextConfig = {
  // This is required to support PostHog trailing slash API requests
  output: 'standalone',

  // biome-ignore lint/suspicious/useAwait: rewrites is async
  async rewrites() {
    return [
      {
        destination: 'https://us-assets.i.posthog.com/static/:path*',
        source: '/ingest/static/:path*',
      },
      {
        destination: 'https://us.i.posthog.com/:path*',
        source: '/ingest/:path*',
      },
      {
        destination: 'https://us.i.posthog.com/decide',
        source: '/ingest/decide',
      },
    ];
  },

  // Exclude packages that use Node.js built-ins from bundling
  serverExternalPackages: ['@sentry/nextjs', '@logtail/next'],
  skipTrailingSlashRedirect: true,

  transpilePackages: ['@repo/design-system', '@repo/auth', '@repo/storage'],
  turbopack: {},
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig => withBundleAnalyzer()(sourceConfig);
