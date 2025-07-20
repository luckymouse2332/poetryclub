# Poetry Club - Monorepo

**Read this in other languages: [English](./README.md), [简体中文](./README_zh.md)**

This is a Turborepo-based monorepo project containing a **NestJS backend** and a **SvelteKit frontend**.

## 🏗️ Project Structure

```
poetryclub/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # SvelteKit frontend application
├── packages/
│   └── shared/       # Shared utilities and types
├── package.json      # Root-level configuration
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── README.md
```

## 🚀 Quick Start

### Install dependencies

```bash
pnpm install
```

### Start the database

```bash
# Start PostgreSQL and Redis
pnpm db:up

# Stop the database
pnpm db:down

# Reset the database (delete all data)
pnpm db:reset
```

### Database setup

```bash
# Navigate to the API directory
cd apps/api

# Copy the example environment file
cp env.example .env

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

### Development mode

Start all apps:

```bash
pnpm dev
```

Start backend only:

```bash
pnpm api:dev
```

Start frontend only:

```bash
pnpm web:dev
```

### Build

Build all apps:

```bash
pnpm build
```

Build specific app:

```bash
pnpm api:build
pnpm web:build
```

### Code quality checks

```bash
pnpm lint
pnpm type-check
```

## 📦 Application Details

### API (Backend)

- **Tech Stack**: NestJS, TypeScript, Prisma
- **Port**: 3000
- **Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Database**: PostgreSQL + Redis

### Web (Frontend)

- **Tech Stack**: SvelteKit, TypeScript
- **Port**: 5173
- **Dev Server**: [http://localhost:5173](http://localhost:5173)

### Database

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)

## 🔧 Features

- ✅ Monorepo architecture (Turborepo)
- ✅ Unified code style (ESLint + Prettier)
- ✅ TypeScript support
- ✅ Frontend-backend integration
- ✅ Database integration (PostgreSQL + Prisma)
- ✅ Caching support (Redis)
- ✅ Modern UI design
- ✅ Hot reload in development
- ✅ Production-ready optimizations

## 📝 Development Guide

### Adding dependencies

Root-level dependency:

```bash
pnpm add -w <package-name>
```

App-specific dependency:

```bash
pnpm add <package-name> --filter api
pnpm add <package-name> --filter web
```

### Using shared packages

Example usage in an app:

```typescript
import { formatDate, API_CONFIG } from '@poetryclub/shared';
```

## 🛠️ Script Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Start all development servers |
| `pnpm build`      | Build all applications        |
| `pnpm lint`       | Run lint checks               |
| `pnpm type-check` | Run TypeScript type checks    |
| `pnpm clean`      | Clean build files             |
| `pnpm test`       | Run tests                     |

## 📄 License

ISC
