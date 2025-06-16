import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  turbopack: {},

  transpilePackages: ['@repo/design-system', '@repo/auth', '@repo/storage'],

  // This is required to support PostHog trailing slash API requests
  output: 'standalone',
  skipTrailingSlashRedirect: true,
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
