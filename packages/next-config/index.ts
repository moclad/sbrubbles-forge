import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  webpack(config, { isServer }) {
    config.ignoreWarnings = [{ module: otelRegex }];

    return config;
  },
  experimental: {
    turbo: {},
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
