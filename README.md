# 回中诗社

回中诗社是一个面向校园的诗歌兴趣社区，也是对 2021—2024 级共同记忆的线上整理。项目当前已经完成认证、邀请注册、账户密码管理与找回、诗作发布和管理治理闭环，并完成了以暖米纸色和诗集合照为核心的首页视觉改造。

## 当前功能

- 游客可以浏览分页诗作列表、诗作详情和公开首页内容。
- 用户通过邀请码注册，登录后可以发布、编辑和管理自己的草稿或已发布诗作。
- 用户可以在账户安全页验证当前密码后修改密码，也可以通过统一响应的忘记密码页面和一小时有效的邮件链接重置密码。
- 账号具有成员、管理员角色以及正常、停用状态，服务端入口会独立执行身份、权限、输入和业务规则校验。
- 管理员可以管理用户与邀请码、调整诗作可见性和发布状态，并查看分页审计记录。
- 首页、诗作列表和导航已经采用统一的暖纸配色、文字链接反馈与响应式布局。

评论、点赞、收藏、通知、私信、搜索和实时聊天仍属于后续范围，当前尚未实现。准确的任务状态以 [`docs/tasks/README.md`](docs/tasks/README.md) 为准。

## 技术与架构

项目使用 Next.js 16 App Router、React 19、TypeScript strict、pnpm、PostgreSQL、Drizzle ORM、Better Auth、Zod、Tailwind CSS、shadcn/ui、Vitest 和 Playwright。

整体采用模块化单体结构。`src/app` 只负责路由和页面组合，业务按功能放在 `src/features`，服务端认证、数据库、策略、服务和校验集中在 `src/server`。页面默认使用 Server Components，数据库只能由服务端模块访问。

## 本地开发

需要 Node.js 20.9 或更高版本、pnpm 10.33 或更高版本，以及 Docker Compose v2。

先安装依赖并复制环境变量文件：

```powershell
pnpm install
Copy-Item .env.example .env.local
```

复制后至少需要调整以下三项。开发服务器固定使用 `4000` 端口；仓库中的开发数据库 Compose 默认映射到本机 `5432` 端口，因此 `DATABASE_URL` 必须与该端口保持一致。

```dotenv
DATABASE_URL=postgresql://poetryclub:poetryclub_dev@localhost:5432/poetryclub
BETTER_AUTH_SECRET=请替换为至少32字符的随机值
BETTER_AUTH_URL=http://localhost:4000
```

本地默认使用 `EMAIL_TRANSPORT=development`。忘记密码请求会在服务端终端输出带有明确开发标记的重置邮件和链接，不会连接真实邮件供应商。该策略只允许用于开发环境；Playwright 使用独立的测试 outbox，生产环境强制使用 Resend，不能退化为日志发送。

随后启动 PostgreSQL、执行已经提交的 migration，并启动应用：

```powershell
docker compose up -d db
pnpm db:migrate
pnpm dev
```

应用地址为 <http://localhost:4000>。`/api/health` 只用于确认应用进程存活，不代表数据库已经就绪。

## 初始化管理员

首次使用管理后台时，在 `.env.local` 中设置以下临时变量：

```dotenv
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_NAME=初始管理员
INITIAL_ADMIN_PASSWORD=请替换为8至128字符的密码
```

完成 migration 后运行：

```powershell
pnpm admin:bootstrap
```

该命令可以创建首个管理员，也可以把已有的正常账号提升为管理员，并会写入审计记录。命令可重复执行；它不会自动恢复已经停用的账号。生产环境完成初始化后应移除这些临时变量。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 在 `4000` 端口启动开发服务器 |
| `pnpm build` | 生成生产构建 |
| `pnpm start` | 在 `4000` 端口启动生产构建 |
| `pnpm typecheck` | 执行 TypeScript 类型检查 |
| `pnpm lint` | 执行 ESLint 检查 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:integration` | 使用真实 PostgreSQL 运行服务端集成测试 |
| `pnpm test:watch` | 以监听模式运行单元测试 |
| `pnpm test:e2e` | 运行 Playwright E2E 测试 |
| `pnpm db:generate` | 根据 Schema 生成版本化 migration |
| `pnpm db:migrate` | 应用已经提交的 migration |
| `pnpm db:check` | 检查 migration 一致性 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm admin:bootstrap` | 初始化或提升首个管理员 |
| `pnpm account:reset-password` | 在服务器终端执行一次性紧急密码恢复 |

第一次运行 E2E 测试前需要安装 Chromium：

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

E2E 测试要求数据库已经启动并完成 migration，测试的全局初始化会建立专用管理员账号。

账户密码相关能力分为四条独立路径。已登录用户在 `/account/security` 修改自己的密码；忘记密码用户在 `/forgot-password` 提交邮箱；邮件中的一次性链接进入 `/reset-password`；`pnpm account:reset-password` 只供服务器运维人员处理紧急恢复，不属于网页用户功能，也不能替代正式邮件流程。紧急恢复的具体操作和风险见 [`docs/deployment.md`](docs/deployment.md)。

## 目录结构

```text
src/
├── app/          # 路由、布局、页面组合和请求入口
├── components/   # 通用 UI 组件，ui/ 为 shadcn 组件
├── features/     # auth、posts、moderation 等业务模块
├── server/       # 认证、数据库、策略、服务与校验
└── lib/          # 通用小工具
docs/             # 产品、架构、设计系统、部署与任务文档
drizzle/          # 版本化 SQL migration 与快照
tests/            # Vitest 单元测试和 Playwright E2E 测试
deploy/           # 生产 Compose 与环境变量示例
scripts/          # 管理员初始化等维护脚本
```

## 生产部署

生产拓扑为 `宿主机 Caddy → 127.0.0.1:4000 → Next.js app → PostgreSQL`。Compose 会先等待数据库健康并执行版本化 migration，再启动应用；Caddy 与证书由宿主机独立管理。完整配置、首次管理员初始化、备份和回滚说明见 [`docs/deployment.md`](docs/deployment.md)。

产品范围、架构边界和视觉规范分别记录在 [`docs/product.md`](docs/product.md)、[`docs/architecture.md`](docs/architecture.md) 和 [`docs/design-system.md`](docs/design-system.md)。
