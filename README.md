# sbrubbles-forge

**Production-grade Turborepo template for Next.js apps.**

<div>
  <img src="https://img.shields.io/npm/dy/next-forge" alt="Downloads" />
  <img src="https://img.shields.io/npm/v/next-forge" alt="Version" />
  <img src="https://img.shields.io/github/license/haydenbleasel/next-forge" alt="License" />
</div>

[sbrubbles-forge](https://github.com/moclad/sbrubbles-forge) is a comprehensive [Next.js](https://nextjs.org/) monorepo boilerplate for building modern, production-ready web applications. It provides a solid, opinionated foundation with enterprise-grade features, tooling, and best practices built-in.

## ✨ Features

- 🚀 **Next.js 15** with App Router, Server Components, and Turbopack
- ⚡ **Turborepo** for high-performance monorepo management
- 🎨 **Design System** with shadcn/ui components and Tailwind CSS
- 🔐 **Authentication** ready with built-in auth package
- 💾 **Database** setup with Drizzle ORM
- 📧 **Email** templates with React Email
- 🌍 **Internationalization** support
- 📊 **Analytics** integration
- 💳 **Payments** infrastructure
- 🔒 **Security** best practices (rate limiting, CSRF protection)
- 🔍 **SEO** optimization utilities
- 📦 **Storage** management
- 🔔 **Notifications** system
- 🔌 **Webhooks** handling
- 🧪 **Testing** setup with Vitest and Playwright
- 📈 **Observability** with Sentry
- 🎯 **Type-safe** with TypeScript
- 🧹 **Code Quality** with Ultracite (Biome)
- 🐳 **Docker** compose for local services

## 🚀 Quick Start

Initialize a new project using:

```sh
npx sbrubbles-forge@latest init
```

Or clone this repository directly:

```sh
git clone https://github.com/moclad/sbrubbles-forge.git
cd sbrubbles-forge
pnpm install
```

## 📋 Prerequisites

- **Node.js** >= 18
- **pnpm** 10.30.1 (or latest)
- **Docker** (optional, for local services)

## 🏗️ Project Structure

```
sbrubbles-forge/
├── apps/
│   ├── api/          # API routes and backend services
│   ├── app/          # Main Next.js application
│   ├── email/        # Email preview and development
│   └── storybook/    # Component documentation
├── packages/
│   ├── ai/           # AI/ML integrations
│   ├── analytics/    # Analytics tracking
│   ├── auth/         # Authentication system
│   ├── database/     # Database schemas and migrations
│   ├── design-system/# UI components library
│   ├── email/        # Email templates
│   ├── localization/ # i18n support
│   ├── next-config/  # Shared Next.js configuration
│   ├── notifications/# Notification system
│   ├── observability/# Monitoring and logging
│   ├── payments/     # Payment processing
│   ├── rate-limit/   # Rate limiting utilities
│   ├── security/     # Security middleware and utilities
│   ├── seo/          # SEO helpers
│   ├── storage/      # File storage management
│   ├── testing/      # Testing utilities
│   ├── typescript-config/ # Shared TypeScript configs
│   └── webhooks/     # Webhook handlers
├── e2e/              # End-to-end tests
├── docker/           # Docker configurations
└── scripts/          # Utility scripts
```

## 📦 Available Scripts

### Development

```sh
pnpm dev           # Start all apps in development mode
pnpm build         # Build all apps and packages
pnpm start         # Start production build
pnpm test          # Run unit tests
pnpm e2e           # Run end-to-end tests
```

### Code Quality

```sh
pnpm check         # Check code with Ultracite (linting + formatting)
pnpm fix           # Auto-fix issues with Ultracite
pnpm lint          # Lint code
```

### Database

```sh
pnpm db:migrate    # Run database migrations
pnpm db:generate   # Generate migrations from schema
pnpm db:pull       # Pull schema from database
pnpm db:push       # Push schema to database
pnpm studio        # Open Drizzle Studio
```

### Docker Services

```sh
pnpm services:start # Start local Docker services
```

### Release

```sh
pnpm release:patch  # Release patch version
pnpm release:minor  # Release minor version
pnpm release:major  # Release major version
```

## 🧰 Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React hooks + Server Components
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js
- **Database ORM**: Drizzle
- **Authentication**: Custom auth package
- **API**: Next.js API Routes

### Development Tools

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Linting/Formatting**: Ultracite (Biome)
- **Testing**: Vitest, Playwright
- **Component Dev**: Storybook
- **Email Dev**: React Email

### DevOps & Monitoring

- **Error Tracking**: Sentry
- **Containerization**: Docker
- **CI/CD**: Release-it

## 🔧 Configuration

Each package and app contains its own configuration:

- **TypeScript**: Extends from `@repo/typescript-config`
- **Tailwind**: Shared configuration via `@repo/design-system`
- **Next.js**: Shared base config in `@repo/next-config`

Environment variables should be placed in `.env.local` files at the root and/or in individual apps.

## 🧪 Testing

The project includes both unit and E2E testing:

- **Unit Tests**: Run `pnpm test` (uses Vitest)
- **E2E Tests**: Run `pnpm e2e` (uses Playwright)

Tests are located in `__tests__` directories and `*.spec.ts` files.

## 🐳 Local Development with Docker

Start local services (database, storage, etc.):

```sh
pnpm services:start
```

This runs Docker Compose services defined in the `docker/` directory.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Beno Dresch** - [@sbrubbles](https://github.com/sbrubbles-work)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using [Next.js](https://nextjs.org/), [Turborepo](https://turbo.build/), and modern web technologies.
