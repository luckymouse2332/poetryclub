# Poetry Club - Monorepo

**其他语言版本：[English](./README.md)、[简体中文](./README_zh.md)**

这是一个基于 Turborepo 的 monorepo 项目，包含 NestJS 后端和 SvelteKit 前端应用。

## 🏗️ 项目结构

```
poetryclub/
├── apps/
│   ├── api/          # NestJS 后端应用
│   └── web/          # SvelteKit 前端应用
├── packages/
│   └── shared/       # 共享工具和类型
├── package.json      # 根目录配置
├── turbo.json        # Turborepo 配置
├── pnpm-workspace.yaml # pnpm 工作区配置
└── README.md
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动数据库

```bash
# 启动 PostgreSQL 和 Redis
pnpm db:up

# 停止数据库
pnpm db:down

# 重置数据库（删除所有数据）
pnpm db:reset
```

### 数据库设置

```bash
# 进入 API 目录
cd apps/api

# 复制环境配置
cp env.example .env

# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库架构
pnpm db:push

# 打开 Prisma Studio
pnpm db:studio
```

### 开发模式

启动所有应用：

```bash
pnpm dev
```

仅启动后端：

```bash
pnpm api:dev
```

仅启动前端：

```bash
pnpm web:dev
```

### 构建

构建所有应用：

```bash
pnpm build
```

构建特定应用：

```bash
pnpm api:build
pnpm web:build
```

### 代码检查

```bash
pnpm lint
pnpm type-check
```

## 📦 应用详情

### API (后端)

- **技术栈**: NestJS, TypeScript, Prisma
- **端口**: 3000
- **文档**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/health
- **数据库**: PostgreSQL + Redis

### Web (前端)

- **技术栈**: SvelteKit, TypeScript
- **端口**: 5173
- **开发服务器**: http://localhost:5173

### 数据库

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Prisma Studio**: http://localhost:5555

## 🔧 技术特性

- ✅ Monorepo 架构 (Turborepo)
- ✅ 统一代码规范 (ESLint + Prettier)
- ✅ TypeScript 支持
- ✅ 前后端通信
- ✅ 数据库集成 (PostgreSQL + Prisma)
- ✅ 缓存支持 (Redis)
- ✅ 现代化 UI 设计
- ✅ 开发环境热重载
- ✅ 生产环境优化

## 📝 开发指南

### 添加新依赖

根目录依赖：

```bash
pnpm add -w <package-name>
```

应用特定依赖：

```bash
pnpm add <package-name> --filter api
pnpm add <package-name> --filter web
```

### 共享包使用

在应用中使用共享包：

```typescript
import { formatDate, API_CONFIG } from '@poetryclub/shared';
```

## 🛠️ 脚本命令

| 命令              | 描述                   |
| ----------------- | ---------------------- |
| `pnpm dev`        | 启动所有应用开发服务器 |
| `pnpm build`      | 构建所有应用           |
| `pnpm lint`       | 运行代码检查           |
| `pnpm type-check` | 运行类型检查           |
| `pnpm clean`      | 清理构建文件           |
| `pnpm test`       | 运行测试               |

## 📄 许可证

ISC
