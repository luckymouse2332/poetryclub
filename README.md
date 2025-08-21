# 📝 Poetry Club - Youth Poetry Creation Platform

**Read this in other languages: [English](./README.md) | [简体中文](./README_zh.md)**

> 🌟 **A Modern Poetry Creation and Sharing Platform for Middle School Students**

Poetry Club is an online poetry creation platform specifically designed for middle school students, aiming to provide young poetry enthusiasts with a warm community to showcase their talents and exchange creative works. The platform adopts a modern technical architecture and provides a simple and elegant user experience, making poetry creation more interesting and convenient.

## 📚 Complete Documentation

- 📋 [Technical Architecture](./docs/技术架构文档.md) - System design and technology stack details
- 📚 [API Documentation](./docs/API文档.md) - Complete API specifications and usage

## ✨ Platform Features

- 🎯 **Designed for Middle School Students** - Clean and friendly interface that matches young users' habits
- 📝 **Free Creation** - Supports various poetry forms including modern poetry, classical poetry, and humorous verses
- 🌙 **Eye Protection Mode** - Built-in dark theme to protect vision health
- 📱 **Mobile First** - Perfect adaptation for mobile phones, tablets and other mobile devices
- 🔒 **Safe and Reliable** - Complete user authentication and content moderation mechanisms
- 🎨 **Modern Design** - Elegant interface design based on Daisy UI

## 🏗️ Project Architecture

```
poetryclub/
├── apps/
│   ├── api/                    # NestJS backend service
│   │   ├── src/
│   │   │   ├── auth/          # User authentication module
│   │   │   ├── users/         # User management module
│   │   │   ├── poems/         # Poetry management module
│   │   │   └── admin/         # Admin functionality module
│   │   └── prisma/            # Database models and migrations
│   └── web/                   # SvelteKit frontend application
│       ├── src/
│       │   ├── routes/        # Page routes
│       │   ├── lib/           # Component library and utilities
│       │   └── app.html       # Application template
│       └── static/            # Static assets
├── packages/
│   ├── shared/                # Shared utility functions
│   └── types/                 # TypeScript type definitions
├── docker/                    # Docker configuration files
├── package.json               # Project dependency configuration
├── turbo.json                 # Turborepo build configuration
└── pnpm-workspace.yaml        # pnpm workspace configuration
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

### Environment Configuration

1. **Copy Environment Configuration File**
```bash
# Navigate to the backend directory
cd apps/api

# Copy environment configuration template
cp .env.example .env
```

2. **Configure Database Connection**
Edit the `apps/api/.env` file and set the database connection information:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/poetryclub"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

3. **Initialize Database**
```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# (Optional) Open database management interface
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

## 🛠️ Tech Stack

### Frontend Application (Web)
- **Framework**: SvelteKit 2.x + Svelte 5.x
- **UI Components**: DaisyUI v5.0 + Bits UI
- **Styling**: Tailwind CSS v4.0
- **Rich Text Editor**: Tiptap v2.x
- **Icons**: Iconify (MDI)
- **Build Tool**: Vite 6.x
- **Development Port**: http://localhost:5173

### Backend Service (API)
- **Framework**: NestJS 10.x + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet + CORS + bcrypt
- **Development Port**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

### Development Tools
- **Package Manager**: pnpm 10.x
- **Build System**: Turborepo 2.x
- **Code Standards**: ESLint + Prettier
- **Type Checking**: TypeScript 5.x
- **Containerization**: Docker + Docker Compose

## 🎯 Core Features

### 👥 User System
- ✅ User registration and login (email + password)
- ✅ Personal profile management (avatar, nickname, bio)
- ✅ Role-based access control (student, admin)
- ✅ Secure authentication (JWT + password encryption)

### 📝 Poetry Creation
- ✅ Modern rich text editor (Tiptap)
- ✅ Auto-save and manual draft saving
- ✅ Multiple text formats and styling support
- ✅ Image insertion and link management
- ✅ Tag system and work categorization
- ✅ Work publishing and management features

### 🌐 Community Interaction
- ✅ Poetry browsing and search
- ✅ Like and comment system
- ✅ User following functionality
- ✅ Popular work recommendations

### 🎨 User Experience
- ✅ Responsive design (perfect mobile adaptation)
- ✅ Dark/light theme switching
- ✅ Elegant animation transitions
- ✅ Accessibility support

## 👨‍💻 Development Guide

### Project Structure Overview

- **apps/web**: Frontend SvelteKit application containing all user interfaces
- **apps/api**: Backend NestJS service providing RESTful APIs
- **packages/shared**: Shared utility functions for frontend and backend
- **packages/types**: TypeScript type definitions

### Adding New Features

1. **Frontend Component Development**
```bash
# Add new dependency to web application
pnpm add <package-name> --filter web

# Create new page
# Create new +page.svelte file in apps/web/src/routes/
```

2. **Backend API Development**
```bash
# Add new dependency to api application
pnpm add <package-name> --filter api

# Generate new module
cd apps/api
npx nest generate module <module-name>
npx nest generate controller <controller-name>
npx nest generate service <service-name>
```

3. **Database Model Updates**
```bash
# After modifying apps/api/prisma/schema.prisma
cd apps/api
pnpm db:generate  # Generate client
pnpm db:push      # Push to database
```

### Using Shared Code

```typescript
// Use shared utilities in frontend or backend
import { formatDate, validateEmail } from '@poetryclub/shared';
import type { User, Poem } from '@poetryclub/types';
```

## 🛠️ Available Commands

### Development Commands
| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Start all application dev servers  |
| `pnpm web:dev`      | Start frontend dev server only     |
| `pnpm api:dev`      | Start backend dev server only      |

### Build Commands
| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm build`        | Build all applications             |
| `pnpm web:build`    | Build frontend application only    |
| `pnpm api:build`    | Build backend application only     |

### Code Quality
| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm lint`         | Run ESLint code checks             |
| `pnpm type-check`   | Run TypeScript type checks         |
| `pnpm test`         | Run unit tests                     |
| `pnpm clean`        | Clean build files                  |

### Database Commands
| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm db:up`        | Start database containers          |
| `pnpm db:down`      | Stop database containers           |
| `pnpm db:reset`     | Reset database (clear all data)    |
| `pnpm db:generate`  | Generate Prisma client             |
| `pnpm db:push`      | Push database schema changes       |
| `pnpm db:studio`    | Open database management interface |

## 🚀 Deployment Guide

### Production Deployment

1. **Build Applications**
```bash
pnpm build
```

2. **Docker Deployment**
```bash
# Build and start all services
docker-compose up -d
```

3. **Environment Variables Configuration**
Ensure the following environment variables are properly configured in production:
- `DATABASE_URL`: Production database connection string
- `JWT_SECRET`: JWT secret key (recommend using strong random string)
- `NODE_ENV=production`

## 🤝 Contributing

We welcome all forms of contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code fixes

### Development Workflow

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📞 Contact Us

If you encounter any issues during use or have any suggestions, please feel free to contact us through:

- 📧 Email: [Contact Email]
- 🐛 Issue Reports: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

## 📄 License

This project is licensed under the [ISC](LICENSE) license.

---

**🌟 Let's create a better creative platform for young poets together!**
