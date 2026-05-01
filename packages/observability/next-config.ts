import { withLogtail } from '@logtail/next';
import type { NextConfigBuilder } from '@repo/next-config';
import { withSentryConfig } from '@sentry/nextjs';
import { keys } from './keys';

// biome-ignore lint/suspicious/noExplicitAny: Avoid dependency on 'next' package
type NextConfig = any;

/**
 * Sentry configuration for Next.js
 * Applied when Sentry observability is enabled
 */
export const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: keys().SENTRY_ORG,
  project: keys().SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  /*
   * Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
   * This can increase your server load as well as your hosting bill.
   * Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
   * side errors will fail.
   */
  tunnelRoute: '/monitoring',

  /*
   * For all available options, see:
   * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
   */

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
};

/**
 * Apply Sentry configuration to Next.js config
 * Adds Sentry transpilation and wraps config with Sentry instrumentation
 */
export const applySentry = (sourceConfig: NextConfig): NextConfig => {
  const configWithTranspile = {
    ...sourceConfig,
    transpilePackages: [...(sourceConfig.transpilePackages || []), '@sentry/nextjs'],
  };

  return withSentryConfig(configWithTranspile, sentryConfig);
};

/**
 * Apply Logtail logging to Next.js config
 * Enables structured logging and log forwarding
 */
export const applyLogging = (config: NextConfig): NextConfig => withLogtail(config);

/**
 * Apply bundle analyzer to Next.js config
 * Enables webpack bundle analysis when ANALYZE=true
 */
export const applyAnalyzer = (config: NextConfig): NextConfig => {
  // Placeholder for analyzer - implement when needed
  return config;
};

// Legacy exports for backwards compatibility
export const withSentry = applySentry;
export const withLogging = applyLogging;

/**
 * Builder extension methods for observability features
 * Use these with createNextConfig() for a fluent API
 */
export const observabilityExtensions = {
  /**
   * Enable webpack bundle analyzer
   * @param condition - Whether to enable analyzer (typically based on ANALYZE env var)
   */
  withAnalyzer(this: NextConfigBuilder, condition = true): NextConfigBuilder {
    return this.extendIf(condition, applyAnalyzer);
  },

  /**
   * Enable Logtail structured logging
   * @param condition - Whether to enable logging (typically always true)
   */
  withLogging(this: NextConfigBuilder, condition = true): NextConfigBuilder {
    return this.extendIf(condition, applyLogging);
  },
  /**
   * Enable Sentry error tracking and performance monitoring
   * @param condition - Whether to enable Sentry (typically based on env var)
   */
  withSentry(this: NextConfigBuilder, condition = true): NextConfigBuilder {
    return this.extendIf(condition, applySentry);
  },
};
