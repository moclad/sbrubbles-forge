# @repo/next-config

Shared Next.js configuration for all apps in the monorepo.

## Architecture

The configuration is split into three clear layers:

1. **Base Config** (`@repo/next-config`) - Structural settings shared across all apps
2. **Extensions** (`@repo/observability/next-config`) - Optional features that can be conditionally applied
3. **App Config** (`apps/*/next.config.ts`) - App-specific configuration

## Base Configuration

The base config (`baseConfig` in `index.ts`) contains all structural Next.js settings:

- **Image configuration** - Remote patterns for external images
- **Rewrites** - PostHog proxy routes
- **Server external packages** - Packages to exclude from bundling
- **Transpile packages** - Workspace packages to transpile
- **Output settings** - Standalone mode for Docker deployment

### Adding to Base Config

When you need to add configuration that applies to **all apps**, add it to `baseConfig`:

```ts
export const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add new image hosts here
      {
        hostname: 'example.com',
        protocol: 'https',
      },
    ],
  },
  // ... other settings
};
```

## Builder API

The `createNextConfig()` builder provides a fluent API for composing configuration:

```ts
import { createNextConfig } from '@repo/next-config';
import { applyLogging, applySentry } from '@repo/observability/next-config';

const config = createNextConfig()
  .extend(applyLogging)              // Apply an extension
  .extendIf(condition, applySentry)  // Conditionally apply
  .transpile(['@repo/my-package'])   // Override transpile packages
  .merge({ experimental: {} })       // Merge additional config
  .build();                          // Build final config
```

### Builder Methods

- **`extend(fn)`** - Apply a configuration extension function
- **`extendIf(condition, fn)`** - Conditionally apply an extension
- **`transpile(packages[])`** - Override transpilePackages
- **`merge(config)`** - Merge additional configuration
- **`build()`** - Build the final configuration object

## Extensions

Extensions are pure functions that transform a Next.js config:

```ts
type ConfigExtension = (config: NextConfig) => NextConfig;
```

### Creating Extensions

Extensions should be created in their respective packages:

```ts
// packages/observability/next-config.ts
export const applySentry = (config: NextConfig): NextConfig => {
  return withSentryConfig({
    ...config,
    transpilePackages: [...(config.transpilePackages || []), '@sentry/nextjs'],
  }, sentryConfig);
};
```

### Available Extensions

**Observability** (`@repo/observability/next-config`):

- `applyLogging` - Adds Logtail structured logging
- `applySentry` - Adds Sentry error tracking and performance monitoring
- `applyAnalyzer` - Adds webpack bundle analyzer

## Usage in Apps

Each app's `next.config.ts` composes the configuration using the builder:

```ts
// apps/app/next.config.ts
import { createNextConfig } from '@repo/next-config';
import { applyLogging, applySentry, applyAnalyzer } from '@repo/observability/next-config';
import { env } from '@/env';

const nextConfig = createNextConfig()
  .extend(applyLogging)                      // Always apply logging
  .extendIf(env.SENTRY, applySentry)         // Apply Sentry if enabled
  .extendIf(env.ANALYZE === 'true', applyAnalyzer)  // Apply analyzer if enabled
  .transpile(['@repo/design-system', '@repo/auth']) // App-specific packages
  .build();

export default nextConfig;
```

## Benefits

✅ **Single source of truth** - Base config in one place
✅ **Clear composition** - Easy to see what's enabled
✅ **Conditional application** - Features enabled based on env vars
✅ **Type-safe** - Full TypeScript support
✅ **Maintainable** - Each layer has a clear responsibility
✅ **Testable** - Pure functions are easy to test

## Migration from Legacy API

Old pattern:
```ts
let config = withLogging(baseConfig);
config.transpilePackages = ['@repo/auth'];
if (env.SENTRY) {
  config = withSentry(config);
}
```

New pattern:
```ts
const config = createNextConfig()
  .extend(applyLogging)
  .extendIf(env.SENTRY, applySentry)
  .transpile(['@repo/auth'])
  .build();
```

The old `withLogging` and `withSentry` exports are maintained for backwards compatibility.
