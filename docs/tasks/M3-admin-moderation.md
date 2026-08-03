# M3.0：管理、准入与内容治理

## 背景

M1 已建立权威服务端会话，M2 已完成诗作发布闭环。本任务在网站开放给固定同学群体前增加最小管理体系：受控注册、管理员鉴权、诗作治理、账号禁用、角色管理与不可编辑审计日志。

## 范围

- [x] 为用户增加 `member | admin` 角色和 `active | suspended` 状态。
- [x] 增加权威 `requireActiveUser()` / `requireAdmin()`，保护全部写入口和 `/admin/**`。
- [x] 为诗作增加独立于作者发布状态的 `visible | hidden` 管理状态。
- [x] 实现管理员诗作、用户、邀请码和审计日志分页管理。
- [x] 实现邀请码注册，邀请码仅保存哈希且在注册事务内原子消费。
- [x] 使用数据库事务串行锁保护最后一个 active admin。
- [x] 提供幂等首管理员初始化脚本及本地、测试、生产文档。
- [x] 增加权限、状态转换、审计一致性、缓存可见性和关键并发测试。

## 非目标

- 不实现评论、点赞、标签、举报、班史、时间线、全文搜索或富文本。
- 不实现多级权限组、管理员代登录、密码重置后台、批量操作、IP/设备封禁。
- 不实现管理员代替作者编辑或发布诗作，不提供已发布诗作永久删除。
- 不实现审计日志编辑、删除、导出、全文搜索或自动清理。

## 架构边界

- 页面保持薄层；管理 UI 位于 `src/features/moderation`，服务端规则与事务位于 `src/server`，数据库只由服务端模块访问。
- Server Action 均独立认证、检查 active/admin、校验输入、执行目标级规则并返回稳定错误；不信任客户端角色、状态、作者或操作人。
- `requireAdmin()` 根据当前会话用户 ID 重新读取数据库角色和状态；仅向客户端传递最小 DTO。
- 普通成员访问 `/admin/**` 统一返回 403；匿名用户沿用项目规则跳转登录。
- suspended 用户保留会话和只读访问，账户页显示原因；全部当前及后续身份写入口必须服务端重检 active。
- 管理更新与审计写入同一数据库事务。改变 active-admin 集合前锁定 `admin_guard(id=1)`，锁内复查目标与数量。
- Better Auth Drizzle adapter 开启真实事务；邀请码最终消费在注册的同一事务中原子执行。无效、过期、停用、用尽对外使用同一错误。
- 当前无跨请求数据库查询缓存；管理写入后精确失效首页、公开诗作、作者及对应管理路径。

## 数据模型

- `user.role`: `member | admin`，默认 `member`。
- `user.status`: `active | suspended`，默认 `active`；禁用原因、时间和操作人保存在服务端字段。
- `poem.status`: 保留 `draft | published` 作者状态。
- `poem.moderationStatus`: `visible | hidden`，默认 `visible`；隐藏保存纯文本原因、时间和操作人。
- `invitation`: 仅保存 `codeHash`、创建人、最大/已用次数、过期/停用时间；明文邀请码只在创建成功响应显示一次。
- `admin_audit_log`: 记录八类规定动作、管理员、目标、原因、必要 metadata 与时间；无更新和删除入口。
- `admin_guard`: 固定单行事务锁，串行化所有可能移除 active admin 的操作。

公开诗作必须同时满足 `status = published AND moderationStatus = visible AND publishedAt IS NOT NULL`。作者编辑、撤回或再次发布不会清除 hidden；管理员恢复后是否公开只由作者状态决定。禁用用户的既有诗作不自动隐藏。

## 邀请码规则

- 使用高熵 URL-safe 随机码，数据库只保存 SHA-256 哈希。
- 可设置 1–100 次使用及不超过 365 天的有效期，可由管理员停用。
- 注册请求先统一预检；真正的 `usedCount + 1` 使用带状态/过期/次数条件的原子更新，并与 user/account 创建共享 Better Auth 数据库事务。
- 注册失败整体回滚，不消耗次数；并发注册不能超过 `maxUses`；邀请码明文不进入审计 metadata。

## 首个管理员与 migration

- 新 migration 只增加枚举、字段、表、约束和索引；现有用户回填为 active member，现有诗作回填为 visible；禁止 schema push。
- migration 后，通过 `INITIAL_ADMIN_EMAIL` 调用幂等 CLI 提升已注册且 active 的指定账号；不硬编码邮箱、不开放自助提升接口。
- 本地：先 `pnpm db:migrate`，设置 `INITIAL_ADMIN_EMAIL`；目标账号不存在时再设置名称和 8–128 字符密码，然后执行 `pnpm admin:bootstrap`。脚本可创建或提升账号且幂等。
- 测试：测试设施创建独立邀请码和账号，不依赖人工数据库修改。
- 生产：部署先运行已提交 migration，再通过 `bootstrap-admin` tools profile 传入一次性邮箱、名称和密码执行 CLI；确认 active admin 后删除临时变量再开放站点。

## 验收条件

- [x] 匿名和 member 不能访问或调用管理能力；suspended admin 立即失去管理能力。
- [x] suspended 用户不能创建、编辑、发布、撤回或删除诗作，并看到明确提示。
- [x] 隐藏诗作立即从首页、列表和详情消失，作者仍能查看原因；恢复遵守作者状态。
- [x] 用户禁用/恢复、角色变更满足自操作和最后管理员约束，含并发验证。
- [x] 邀请码注册满足哈希存储、原子次数、失败回滚和并发上限。
- [x] 八类管理动作均产生同事务审计；失败操作不留下成功日志。
- [x] 管理界面支持桌面及约 390px，危险操作确认、防重复提交、字段和整体错误清晰。
- [x] M1/M2 回归以及 typecheck、lint、unit、E2E、build、db:check、db:migrate 全部通过。

## 测试

- 单元：校验、权限结果映射、DTO 与纯函数。
- 数据库/服务：管理事务、最后管理员并发、邀请码并发和失败回滚、审计一致性。
- Playwright：真实 Better Auth/PostgreSQL 下的注册准入、管理页面权限、诗作隐藏恢复、用户禁用与 390px 布局。
- 最终命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build`、`pnpm db:check`；在本地测试库执行 `pnpm db:migrate`。

### 实际验证

- migration：`drizzle/0003_plain_serpent_society.sql` 已在本地 PostgreSQL 通过 `pnpm db:migrate`；`pnpm db:check` 通过，未使用 schema push。
- 单元：11 个文件、185 个用例通过，其中治理校验覆盖原生 GET 表单空筛选值规范化。
- Playwright：39 个真实浏览器用例通过；使用真实 Better Auth 与 PostgreSQL，覆盖 member 伪造管理 Action、suspended admin、筛选空参数回归、hidden 全公开读取、作者状态切换、用户禁用后的旧页面写入、邀请失败回滚/并发超用、最后管理员并发与自操作。
- 初始化：`pnpm admin:bootstrap` 已验证首次创建/提升及重复执行幂等；生产 Compose tools profile 配置校验通过。
- 最终：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build`、`pnpm db:check` 全部通过。

## DeepSeek 只读审查

- 首轮逐项确认邀请码原子事务、管理入口鉴权、最后管理员锁、hidden 公开谓词、审计事务和 migration 无权限绕过或数据一致性阻断问题。
- 首轮将 `registerWithInvitation` 误判为返回结构阻断；Lead 对照调用方确认仅消费 `error`，并补充 same-origin Origin/Host CSRF 与统一错误设计说明。第二轮复核撤销该问题。
- 未采纳“未知 role/status 回退 active”的建议：权威字段异常必须 fail-closed；migration 与数据库默认保证合法值。
- 接受邀请码预检与最终消费之间可能被其他请求抢完的竞态：最终原子条件更新是权威结果，对外统一为无效且不会超用或错误计数。
- 补充管理诗作详情、隐藏操作人/时间、只停用尚可用邀请码、共享数据库单 worker E2E 及最后管理员并发清理后，第二轮确认 0 Blocking、0 Critical、0 未处理 Major，可完成 M3。

## 风险 / 回滚

- 风险：注册 hook 未共享 Better Auth 事务会错误消耗邀请码；通过 adapter transaction 和并发/回滚测试验证。
- 风险：普通计数无法防止两个管理员并发移除最后管理员；通过固定 guard 行 `FOR UPDATE` 串行化。
- 风险：遗漏公开查询会泄露 hidden 诗作；统一公开谓词并覆盖首页、列表和详情。
- 风险：角色/状态进入长效会话造成旧权限；每次管理请求重新查库，全部写入口重检 active。
- 回滚优先回退应用；数据库 migration 为兼容性新增，生产仅向前修复，不在未备份情况下删除新列或表。

## 状态

- 状态：`已完成`
- 负责人：首席架构师（DeepSeek 协助范围明确的基础实现与前端）
- 完成日期：2026-08-03
