# Turborepo Remote Cache - Self-Hosted Setup

> Documentation for setting up self-hosted remote caching for faster builds

## Overview

Remote caching allows Turborepo to share build artifacts across machines and team members, dramatically reducing build times (90%+ for unchanged code).

## Option 1: turborepo-remote-cache (Recommended)

Open-source implementation with multiple storage backend support.

### Installation

```bash
# Global installation
pnpm add -g turborepo-remote-cache

# Or use npx
npx turborepo-remote-cache
```

### Storage Backends

#### Local Filesystem
```bash
turborepo-remote-cache \
  --storage-provider=local \
  --storage-path=./cache
```

#### AWS S3
```bash
turborepo-remote-cache \
  --storage-provider=s3 \
  --s3-access-key-id=YOUR_KEY \
  --s3-secret-access-key=YOUR_SECRET \
  --s3-bucket=your-turbo-cache \
  --s3-region=us-east-1
```

#### Cloudflare R2
```bash
turborepo-remote-cache \
  --storage-provider=s3 \
  --s3-access-key-id=YOUR_R2_ACCESS_KEY \
  --s3-secret-access-key=YOUR_R2_SECRET_KEY \
  --s3-bucket=turbo-cache \
  --s3-endpoint=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

#### Google Cloud Storage
```bash
turborepo-remote-cache \
  --storage-provider=google-cloud-storage \
  --gcs-bucket=your-turbo-cache
```

#### Azure Blob Storage
```bash
turborepo-remote-cache \
  --storage-provider=azure \
  --azure-storage-account=youraccountname \
  --azure-storage-access-key=YOUR_KEY \
  --azure-container=turbo-cache
```

## Option 2: Docker Compose Integration

Add to `docker/docker-compose.yml`:

```yaml
services:
  turbo-cache:
    image: fox1t/turborepo-remote-cache
    container_name: turbo-cache
    ports:
      - "3001:3000"
    environment:
      TURBO_TOKEN: ${TURBO_TOKEN:-my-secret-token}
      STORAGE_PROVIDER: local  # or s3, gcs, azure
      STORAGE_PATH: /cache
    volumes:
      - turbo-cache:/cache
    restart: unless-stopped

volumes:
  turbo-cache:
    driver: local
```

Start the service:
```bash
docker compose -f docker/docker-compose.yml up -d turbo-cache
```

## Option 3: Configuration

### Via turbo.json

Add to `turbo.json`:

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "remoteCache": {
    "enabled": true,
    "url": "http://localhost:3001",
    "token": "your-secret-token"
  },
  "globalDependencies": ["**/.env.*local"],
  "ui": "tui",
  "envMode": "loose",
  "concurrency": "100%",
  "tasks": {
    // ... existing tasks
  }
}
```

### Via Environment Variables (Recommended)

Create `.env.turbo.local` (gitignored):

```bash
# Turbo Remote Cache Configuration
TURBO_API=http://localhost:3001
TURBO_TOKEN=my-secret-token
TURBO_TEAM=sbrubbles-forge

# For CI/CD, use your production cache URL
# TURBO_API=https://turbo-cache.yourdomain.com
```

Add to `.gitignore`:
```
.env.turbo.local
```

### Via CLI

```bash
# Set for current shell session
export TURBO_API=http://localhost:3001
export TURBO_TOKEN=my-secret-token

# Then run build
pnpm build
```

## Quick Start: Local Development

1. **Start the cache server:**
   ```bash
   TURBO_TOKEN=dev-secret turborepo-remote-cache --port 3001
   ```

2. **Configure your project:**
   ```bash
   export TURBO_API=http://localhost:3001
   export TURBO_TOKEN=dev-secret
   ```

3. **Build with caching:**
   ```bash
   pnpm build
   ```

4. **Verify caching:**
   ```bash
   # Clean and rebuild - should be much faster
   pnpm clean
   pnpm build
   ```

## Production Setup Recommendations

### For CI/CD (GitHub Actions, GitLab CI, etc.)

1. **Use S3-compatible storage** (AWS S3, Cloudflare R2, Minio)
2. **Set secrets in your CI/CD platform:**
   ```bash
   TURBO_API=https://your-cache-server.com
   TURBO_TOKEN=your-production-token
   ```

3. **No code changes needed** - environment variables are automatically used

### Security

- **Rotate tokens regularly**
- **Use different tokens per environment** (dev, staging, prod)
- **Restrict S3 bucket access** with IAM policies
- **Use HTTPS in production**

### Cache Retention

Configure TTL based on your needs:

```bash
turborepo-remote-cache \
  --storage-provider=s3 \
  --cache-ttl=604800  # 7 days in seconds
```

## Monitoring

Check cache hits in build output:
```bash
pnpm build
# Look for:
# ✓ app:build (FULL) or (CACHE)
```

## Troubleshooting

### Cache not being used

1. **Verify connection:**
   ```bash
   curl $TURBO_API/v8/artifacts/status
   ```

2. **Check token:**
   ```bash
   echo $TURBO_TOKEN
   ```

3. **Force remote caching:**
   ```bash
   turbo run build --force
   ```

### Clear cache

```bash
# Local cache
rm -rf .turbo

# Remote cache (if using local storage)
rm -rf ./cache/*
```

## Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "cache:start": "turborepo-remote-cache --port 3001",
    "cache:clean": "rm -rf .turbo",
    "build:no-cache": "turbo run build --force"
  }
}
```

## Resources

- [Turborepo Remote Cache Docs](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [turborepo-remote-cache GitHub](https://github.com/ducktors/turborepo-remote-cache)
- [Self-Hosting Guide](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting)

## Next Steps

1. Choose your storage backend (local for dev, S3 for production)
2. Set up the cache server (Docker Compose or standalone)
3. Configure environment variables
4. Test with `pnpm build`
5. Monitor cache hit rates
6. Deploy to CI/CD
