# 📝 回中诗社 - 青春诗歌创作平台

**其他语言版本：[English](./README.md) | [简体中文](./README_zh.md)**

> 🌟 **为初中同学打造的现代化诗歌创作与分享平台**

回中诗社是一个专为初中生群体设计的在线诗歌创作平台，旨在为年轻的诗歌爱好者提供一个展示才华、交流创作的温馨社区。平台采用现代化的技术架构，提供简洁优雅的用户体验，让诗歌创作变得更加有趣和便捷。

## 📚 完整文档

- 📋 [技术架构文档](./docs/技术架构文档.md) - 系统设计和技术选型详解
- 📚 [API 接口文档](./docs/API文档.md) - 完整的 API 规范和使用方法

## ✨ 平台特色

- 🎯 **专为初中生设计** - 简洁友好的界面，符合年轻用户的使用习惯
- 📝 **自由创作** - 支持现代诗、古体诗、打油诗等多种诗歌形式
- 🌙 **护眼模式** - 内置深色主题，保护视力健康
- 📱 **移动优先** - 完美适配手机、平板等移动设备
- 🔒 **安全可靠** - 完善的用户认证和内容审核机制
- 🎨 **现代设计** - 基于 Skeleton UI 的优雅界面设计

## 🏗️ 项目架构

```
poetryclub/
├── apps/
│   ├── api/                    # NestJS 后端服务
│   │   ├── src/
│   │   │   ├── auth/          # 用户认证模块
│   │   │   ├── users/         # 用户管理模块
│   │   │   ├── poems/         # 诗歌管理模块
│   │   │   └── admin/         # 管理员功能模块
│   │   └── prisma/            # 数据库模型和迁移
│   └── web/                   # SvelteKit 前端应用
│       ├── src/
│       │   ├── routes/        # 页面路由
│       │   ├── lib/           # 组件库和工具
│       │   └── app.html       # 应用模板
│       └── static/            # 静态资源
├── packages/
│   ├── shared/                # 共享工具函数
│   └── types/                 # TypeScript 类型定义
├── docker/                    # Docker 配置文件
├── package.json               # 项目依赖配置
├── turbo.json                 # Turborepo 构建配置
└── pnpm-workspace.yaml        # pnpm 工作区配置
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

### 环境配置

1. **复制环境配置文件**
```bash
# 进入后端目录
cd apps/api

# 复制环境配置模板
cp .env.example .env
```

2. **配置数据库连接**
编辑 `apps/api/.env` 文件，设置数据库连接信息：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/poetryclub"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

3. **初始化数据库**
```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库架构
pnpm db:push

# （可选）打开数据库管理界面
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

## 🛠️ 技术栈

### 前端应用 (Web)
- **框架**: SvelteKit 2.x + Svelte 5.x
- **UI 组件**: DaisyUI v5.0 + Bits UI
- **样式**: Tailwind CSS v4.0
- **富文本编辑器**: Tiptap v2.x
- **图标**: Iconify (MDI)
- **构建工具**: Vite 6.x
- **开发端口**: http://localhost:5173

### 后端服务 (API)
- **框架**: NestJS 10.x + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **安全**: Helmet + CORS + bcrypt
- **开发端口**: http://localhost:3000
- **API 文档**: http://localhost:3000/api/docs

### 开发工具
- **包管理**: pnpm 10.x
- **构建系统**: Turborepo 2.x
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript 5.x
- **容器化**: Docker + Docker Compose

## 🎯 核心功能

### 👥 用户系统
- ✅ 用户注册与登录（邮箱 + 密码）
- ✅ 个人资料管理（头像、昵称、简介）
- ✅ 角色权限控制（学生、管理员）
- ✅ 安全认证（JWT + 密码加密）

### 📝 诗歌创作
- ✅ 现代化富文本编辑器（Tiptap）
- ✅ 自动保存和手动保存草稿
- ✅ 多种文本格式和样式支持
- ✅ 图片插入和链接管理
- ✅ 标签系统和作品分类
- ✅ 作品发布和管理功能

### 🌐 社区互动
- ✅ 诗歌浏览与搜索
- ✅ 点赞与评论系统
- ✅ 用户关注功能
- ✅ 热门作品推荐

### 🎨 用户体验
- ✅ 响应式设计（完美适配移动端）
- ✅ 深色/浅色主题切换
- ✅ 优雅的动画过渡效果
- ✅ 无障碍访问支持

## 👨‍💻 开发指南

### 项目结构说明

- **apps/web**: 前端 SvelteKit 应用，包含所有用户界面
- **apps/api**: 后端 NestJS 服务，提供 RESTful API
- **packages/shared**: 前后端共享的工具函数
- **packages/types**: TypeScript 类型定义

### 添加新功能

1. **前端组件开发**
```bash
# 在 web 应用中添加新依赖
pnpm add <package-name> --filter web

# 创建新页面
# 在 apps/web/src/routes/ 下创建新的 +page.svelte 文件
```

2. **后端 API 开发**
```bash
# 在 api 应用中添加新依赖
pnpm add <package-name> --filter api

# 生成新模块
cd apps/api
npx nest generate module <module-name>
npx nest generate controller <controller-name>
npx nest generate service <service-name>
```

3. **数据库模型更新**
```bash
# 修改 apps/api/prisma/schema.prisma 后
cd apps/api
pnpm db:generate  # 生成客户端
pnpm db:push      # 推送到数据库
```

### 共享代码使用

```typescript
// 在前端或后端中使用共享工具
import { formatDate, validateEmail } from '@poetryclub/shared';
import type { User, Poem } from '@poetryclub/types';
```

## 🛠️ 常用命令

### 开发命令
| 命令                | 描述                     |
| ------------------- | ------------------------ |
| `pnpm dev`          | 启动所有应用开发服务器   |
| `pnpm web:dev`      | 仅启动前端开发服务器     |
| `pnpm api:dev`      | 仅启动后端开发服务器     |

### 构建命令
| 命令                | 描述                     |
| ------------------- | ------------------------ |
| `pnpm build`        | 构建所有应用             |
| `pnpm web:build`    | 仅构建前端应用           |
| `pnpm api:build`    | 仅构建后端应用           |

### 代码质量
| 命令                | 描述                     |
| ------------------- | ------------------------ |
| `pnpm lint`         | 运行 ESLint 代码检查     |
| `pnpm type-check`   | 运行 TypeScript 类型检查 |
| `pnpm test`         | 运行单元测试             |
| `pnpm clean`        | 清理构建文件             |

### 数据库命令
| 命令                | 描述                     |
| ------------------- | ------------------------ |
| `pnpm db:up`        | 启动数据库容器           |
| `pnpm db:down`      | 停止数据库容器           |
| `pnpm db:reset`     | 重置数据库（清空数据）   |
| `pnpm db:generate`  | 生成 Prisma 客户端       |
| `pnpm db:push`      | 推送数据库架构变更       |
| `pnpm db:studio`    | 打开数据库管理界面       |

## 🚀 部署指南

### 生产环境部署

1. **构建应用**
```bash
pnpm build
```

2. **Docker 部署**
```bash
# 构建并启动所有服务
docker-compose up -d
```

3. **环境变量配置**
确保生产环境中正确配置以下环境变量：
- `DATABASE_URL`: 生产数据库连接字符串
- `JWT_SECRET`: JWT 密钥（建议使用强随机字符串）
- `NODE_ENV=production`

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📞 联系我们

如果您在使用过程中遇到任何问题，或有任何建议，欢迎通过以下方式联系我们：

- 📧 邮箱：[联系邮箱]
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-repo/issues)
- 💬 讨论交流：[GitHub Discussions](https://github.com/your-repo/discussions)

## 📄 开源协议

本项目采用 [ISC](LICENSE) 开源协议。

---

**🌟 让我们一起为年轻的诗人们创造一个更美好的创作平台！**
