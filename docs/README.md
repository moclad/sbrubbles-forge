# Documentation

This folder contains setup guides and configuration examples for sbrubbles-forge.

## Available Documentation

### Build Optimization

- **[turborepo-remote-cache-setup.md](./turborepo-remote-cache-setup.md)** - Complete guide for setting up self-hosted Turborepo remote caching to dramatically speed up builds (90%+ faster for unchanged code)

## Quick Start Files

### Turborepo Remote Cache

1. **Docker Compose:** [`docker-compose.turbo-cache.yml`](./docker-compose.turbo-cache.yml)
   - Ready-to-use Docker Compose configuration
   - Usage: `docker compose -f docs/docker-compose.turbo-cache.yml up -d`

2. **Environment Template:** [`.env.turbo.example`](./.env.turbo.example)
   - Copy to root as `.env.turbo.local`
   - Customize tokens and configuration
   - Already gitignored

## Usage

See individual documentation files for detailed setup instructions.
