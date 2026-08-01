# M0：工程基线

## 背景

来源：`temp.md`。M0 的目标是搭建**可运行、可测试、可持续扩展**的 MVP 工程基线，不包含任何业务功能（帖子、评论、点赞等）。技术栈与架构原则由 `temp.md` 固定，见 `docs/architecture.md`。

## 范围

M0 共 18 项清单（见下方「清单与状态」）。低风险的文档、页面骨架与测试配置由 deepseek-builder 协助，认证、安全边界、数据库设计、migration、部署和最终整合由首席架构师完成并复核。

## 非目标

- 不实现复杂认证 / 授权；M0 仅提供 Better Auth 邮箱密码框架和认证核心表。
- 不实现任何业务功能：帖子发布、评论、点赞 / 收藏、私信、推荐算法、实时聊天、Redis、搜索引擎、对象存储、复杂后台管理、AI 功能。

## 架构边界

- `src/app` 保持薄层；默认 Server Components，错误边界因 Next 要求使用 `"use client"`。
- 数据库访问仅位于 `src/server/db`；认证配置仅位于 `src/server/auth`；客户端不得导入这些服务端模块。
- 依赖方向 `app → features → server`、`components → lib`，本任务不引入任何跨层依赖。
- 敏感信息与不可信文本规则见 `docs/architecture.md`，本任务不涉及用户输入。

## 清单与状态

| # | temp.md 内容 | 状态 | 说明 |
| --- | --- | --- | --- |
| 1 | 检查并整理当前 Next.js 项目 | ✅ 已完成 | `app/` 迁移至 `src/app/`，清理模板页面；保留 favicon |
| 2 | 创建并完善 `AGENTS.md` | ✅ 已完成 | 保留 Next.js 特殊规则，补充模块边界、安全检查、DB / migration、分页、质量命令、任务工作流 |
| 3 | 创建 `docs/product.md` | ✅ 已完成 | 用户群体、MVP 流程 / 范围、非目标、成功标准 |
| 4 | 创建 `docs/architecture.md` | ✅ 已完成 | 模块结构、请求流程、认证边界（原则）、DB / migration、测试、部署结构 |
| 5 | 创建 `docs/tasks/` 目录和任务模板 | ✅ 已完成 | README + template + 本文件 |
| 6 | 配置 TypeScript strict | ✅ 已完成 | `strict: true` 保持，`@/*` 指向 `./src/*`，新增 `noUncheckedIndexedAccess` |
| 7 | 配置环境变量校验，创建 `.env.example` | ✅ 已完成 | Zod 校验数据库 URL、认证 secret 与 URL；示例不含真实密钥 |
| 8 | 配置 PostgreSQL 和 Drizzle | ✅ 已完成 | PostgreSQL.js 连接池、Drizzle Schema 与 CLI 配置 |
| 9 | 创建第一份可审查的数据库 migration | ✅ 已完成 | `0000_harsh_echo.sql` 创建认证表；审查修正由 `0001_young_nightmare.sql` 前向追加；均已应用成功 |
| 10 | 集成 Better Auth 基本结构（最小登录框架） | ✅ 已完成 | 邮箱密码注册 / 登录、官方 Drizzle Schema、HttpOnly Cookie、响应 token 清理 |
| 11 | 基础页面布局、导航、主页占位和错误页面 | ✅ 已完成 | `layout` / `site-header` / 主页占位 / `error` / `global-error` / `not-found`；均为 Server Components，错误边界除外 |
| 12 | 创建 `/api/health` 健康检查 | ✅ 已完成 | 无敏感信息、`no-store` 的进程存活检查 |
| 13 | 配置 Vitest 和 Playwright 最小可运行示例 | ✅ 已完成 | `vitest.config.ts` + `tests/unit/utils.test.ts`；`playwright.config.ts` + `tests/e2e/home.spec.ts`（浏览器安装不属本任务） |
| 14 | 添加统一 `typecheck` / `lint` / `test` / `build` 脚本 | ✅ 已完成 | 另含 `test:watch`、`test:e2e`；依赖版本未改动 |
| 15 | 创建开发用 Docker Compose | ✅ 已完成 | 根 `compose.yaml` 提供带健康检查和持久卷的 PostgreSQL |
| 16 | 创建生产 Dockerfile 和生产部署说明 | ✅ 已完成 | standalone 多阶段镜像、一次性 migrator、`docs/deployment.md` |
| 17 | 生产使用持久化数据卷和反向代理 | ✅ 已完成 | PostgreSQL/Caddy 命名卷，应用仅由 Caddy 暴露 |
| 18 | 运行完整类型检查、lint、测试和生产构建 | ✅ 已完成 | 审查修正后四项命令全部通过；另完成 E2E、migration 与容器验证 |

## 验收条件

- `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 全部通过。
- `pnpm db:check` 通过，首份 migration 可在空 PostgreSQL 上应用。
- 生产 runner 镜像可在无构建期密钥时构建，运行时健康检查与认证注册可用。
- 页面骨架可启动（`pnpm dev`），错误边界符合 Next 16 约定（`error` / `unstable_retry`、`global-error` 自带 `<html>` / `<body>`）。
- 清单中没有把未完成项标记为已完成。

## 测试

- 单元测试：环境变量、认证响应敏感字段清理、健康状态和 `cn`，共 12 个用例。
- E2E：主页、导航、登录页和健康接口，共 4 个用例（Chromium）。
- `pnpm db:check` 通过；0000/0001 migration 已在 PostgreSQL 17 应用。
- runner 与 migrator 镜像均构建成功；运行态验证了 health、注册 / 登录、HttpOnly Cookie 和 JSON 无 token。
- 最终验证：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 全部通过。

## DeepSeek 只读审查

- 首轮提出 `session/account.updated_at` 无数据库默认值：未改写已执行的 0000，而是补充 Schema 并新增 0001 migration。
- 要求验证 migrator：实际构建后发现非 root Corepack 会尝试联网，已改为直接执行镜像内 Drizzle Kit；在 PostgreSQL 上重新验证成功。
- 采纳 Caddy HSTS / 防 iframe、开发 DB 仅绑定 localhost、容器 `no-new-privileges` 和数据库环境测试。
- 复审结论：无剩余阻断级或严重问题，M0 可以关闭。

## 风险 / 回滚

- 邮箱验证与密码找回尚未配置，不适合开放注册到公网；M1 前需明确校园身份验证策略。
- 健康检查仅验证应用进程，不验证数据库就绪；生产启动顺序由 migration 和容器健康条件保证。
- 项目最低 Node.js 版本跟随 Next.js 16 要求（20.9）；生产镜像使用 Node.js 22。
- 数据库 migration 默认只向前；回滚必须恢复备份并使用兼容应用版本，禁止临时 schema push。

## 状态

- 状态：`已完成`
- 负责人：首席架构师（deepseek-builder 协助低风险子项）
- 完成日期：2026-08-01
