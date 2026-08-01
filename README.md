# 回中诗社

校园诗歌兴趣社区（Web）。当前处于 **M0 工程基线** 阶段：可运行、可测试、可持续扩展的工程骨架，暂不包含业务功能。

## 技术栈

Next.js App Router / React / TypeScript（strict）/ pnpm / PostgreSQL / Drizzle ORM / Better Auth / Zod / Tailwind CSS / shadcn/ui / Vitest / Playwright。

## 本地启动

要求：Node.js 20.9+、pnpm 10.33+ 与 Docker Compose v2。

```bash
pnpm install
cp .env.example .env.local
docker compose up -d db
pnpm db:migrate
pnpm dev
```

请先把 `.env.local` 中的 `BETTER_AUTH_SECRET` 替换为至少 32 字符的随机值，然后打开 http://127.0.0.1:3000。若本机 5432 已占用，可设置 `POSTGRES_PORT` 并同步修改 `DATABASE_URL`。

## 质量命令

```bash
pnpm typecheck    # TypeScript 类型检查
pnpm lint         # ESLint
pnpm test         # Vitest 单元测试
pnpm test:watch   # Vitest 监听模式
pnpm test:e2e     # Playwright E2E（需要先安装浏览器）
pnpm build        # 生产构建
pnpm db:generate  # 根据 Schema 生成版本化 migration
pnpm db:migrate   # 应用已提交的 migration
pnpm db:check     # 检查 migration 一致性
```

## 目录结构

```text
src/
├── app/          # 路由、布局、页面、错误边界（薄层）
├── components/   # 纯 UI 组件（ui/ 为 shadcn 组件）
├── features/     # 业务模块（M1 起按功能填充）
├── server/       # 仅服务端逻辑（auth / db / policies / services / validation）
└── lib/          # 通用小工具
docs/             # 产品、架构、任务文档
tests/            # 单元测试（unit）与 E2E（e2e）
drizzle/          # 版本化 SQL migration 与快照
deploy/           # 生产 Compose、Caddy 与环境变量示例
```

## M0 认证与数据库

- Better Auth 提供最小邮箱密码注册 / 登录，入口为 `/api/auth/*`，页面为 `/login`。
- Drizzle Schema 仅包含 Better Auth 的四张核心表；任何改动必须生成 migration，禁止生产 schema push。
- `/api/health` 是不访问数据库的进程存活检查，不应当作数据库就绪检查。
- M0 不包含邮箱验证、密码找回、OAuth、角色或复杂授权。

## 生产部署

生产使用一个 Next.js 应用容器、一个 PostgreSQL 实例和 Caddy 反向代理，数据库与 Caddy 证书均使用持久卷。参见 [`docs/deployment.md`](docs/deployment.md)。

## 尚未实现

作品发布、评论、点赞 / 收藏、私信、推荐、搜索、实时聊天、对象存储、Redis、AI 与复杂后台均不属于 M0。
