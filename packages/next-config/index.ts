import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // This is required to support PostHog trailing slash API requests
  output: 'standalone',
  skipTrailingSlashRedirect: true,

  transpilePackages: ['@repo/design-system', '@repo/auth', '@repo/storage'],
  turbopack: {},

  // biome-ignore lint/suspicious/useAwait: rewrites is async
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
