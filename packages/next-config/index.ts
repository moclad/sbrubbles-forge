import type { NextConfig } from 'next';

/**
 * Base Next.js configuration
 * Contains all structural settings: images, rewrites, transpilation, etc.
 * This should be the single source of truth for common Next.js config across all apps.
 */
export const baseConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        // Allow private IPs for local development (DuckDNS pointing to local network)
        hostname: 'rustfs.speebles.duckdns.org',
        port: '',
        protocol: 'https',
      },
    ],
  },

  // This is required to support PostHog trailing slash API requests
  output: 'standalone',

  // Exclude packages that use Node.js built-ins from bundling
  serverExternalPackages: ['@logtail/next'],
  skipTrailingSlashRedirect: true,

  transpilePackages: ['@repo/design-system', '@repo/auth', '@repo/storage'],
  turbopack: {},
};

type ConfigExtension = (config: NextConfig) => NextConfig;

/**
 * Configuration builder for Next.js apps
 * Provides a fluent API to conditionally apply extensions to the base config
 *
 * @example
 * ```ts
 * const config = createNextConfig()
 *   .withLogging()
 *   .withSentry(env.SENTRY)
 *   .withAnalyzer(env.ANALYZE === 'true')
 *   .build();
 * ```
 */
export class NextConfigBuilder {
  private config: NextConfig;

  constructor(baseConfig: NextConfig) {
    this.config = { ...baseConfig };
  }

  /**
   * Apply a custom extension to the config
   */
  extend(extension: ConfigExtension): this {
    this.config = extension(this.config);
    return this;
  }

  /**
   * Conditionally apply an extension
   */
  extendIf(condition: boolean, extension: ConfigExtension): this {
    if (condition) {
      this.config = extension(this.config);
    }
    return this;
  }

  /**
   * Merge additional config options
   */
  merge(additionalConfig: Partial<NextConfig>): this {
    this.config = { ...this.config, ...additionalConfig };
    return this;
  }

  /**
   * Override transpilePackages (useful for app-specific packages)
   */
  transpile(packages: string[]): this {
    this.config.transpilePackages = packages;
    return this;
  }

  /**
   * Build the final config
   */
  build(): NextConfig {
    return this.config;
  }
}

/**
 * Create a new Next.js configuration builder
 */
export function createNextConfig(): NextConfigBuilder {
  return new NextConfigBuilder(baseConfig);
}

// Legacy exports for backwards compatibility
export const config = baseConfig;
export const withAnalyzer = (sourceConfig: NextConfig): NextConfig => sourceConfig;
