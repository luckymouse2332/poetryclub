# CHORE-3：架构边界与一致性重构

## 背景

用户要求全仓库审计后执行实质性、分阶段重构。以现有产品和模块化单体架构为基础，优先正确性、事务一致性和可验证性。

## 范围

- [x] 五个独立只读审计：数据、认证授权、前端、通知实时、测试质量。
- [x] 汇总发现、消除冲突并定义分阶段实施计划。
- [x] 高风险行为先添加回归测试，再重构与验证。
- [x] 每阶段执行类型检查、lint、单元、相关集成及适用 E2E。

## 非目标

- 不更换技术栈、不改变视觉设计、不引入新产品能力。
- 不发布、不创建标签，不覆盖原有未提交的 BUG-13 文档和日志。

## 架构边界

保持 app → features → server，UI → lib。数据库限服务端；入口独立认证、对象授权、校验；PostgreSQL 为通知权威，Redis/SSE 为尽力唤醒。保留分页、敏感信息和纯文本输出边界。

## 验收条件

- [x] 全部审计有可追溯发现、严重性、文件、方案和兼容性风险。
- [x] 实施计划包含测试先行与明确分阶段范围。
- [x] 完成约定阶段，回归修复且验证结果如实记录。
- [x] 保持已有用户行为，必要正确性修复明确说明。

## 发布影响

- 预期版本影响：无需单独发布；正确性修复适用于 PATCH。
- migration / 环境变量 / 部署顺序：无 schema 或生产环境变量改动；数据库测试新增强制 TEST_DATABASE_URL，使用 db:migrate:test 准备独立测试库。
- 兼容性与回滚边界：保持外部契约，每阶段可独立回滚。

## 测试

基线及各阶段运行 pnpm typecheck、pnpm lint、pnpm test、相关 pnpm test:integration 与 pnpm test:e2e；最终执行规范检查与构建。只对本地测试基础设施运行有写入的测试。

## 风险 / 回滚

并发、权限和实时状态是主要风险；先用行为测试锁定边界。环境无法验证的项目明确记录，不以跳过为通过。

## 状态

- 状态：已完成
- 负责人：Codex（主代理集成，五方向子代理只读审计）
- 分支：refactor/chore-3-architecture-refactor
- 完成日期：2026-10-04

## 审计汇总与裁决

五方向均完成只读审计（测试方向由前端审计代理另一个独立轮次承担）。

| 严重性 | 发现 / 路径 | 处理与风险 |
| --- | --- | --- |
| 高 | admin 子页面依赖 layout；services/moderation.ts 锁后未重验操作者 | 每页独立保护；事务统一 guard→actor→target 顺序，防死锁 |
| 中 | auth/index.ts 默认 update-user 与可选撤销其他会话 | 禁用未支持资料修改；服务端强制改密撤销其他会话，保留当前会话 |
| 高 | comments/index.ts 活动时间覆盖、聚合与父节点检查竞态 | 根节点先锁，插入使用 greatest；先加并发测试 |
| 中 | comments/index.ts 每根单独读取预览 | 有界批量查询，保留最新三条、时间/ID顺序及占位 |
| 高 | notification-menu.tsx 丢失断线期间唤醒；stream/route.ts 清理分叉 | 订阅就绪/恢复重读，生命周期独立服务、限时连接、取消清理测试 |
| 中 | notifications/index.ts 无界公告受众、重复已读覆盖 | INSERT SELECT 快照、提交后分页唤醒；保留首次已读时间 |
| 高 | comment-ui.tsx 连续成功 token、局部指纹与未取消分页 | 每次成功处理；显式快照、请求代次、取消、保留加载深度 |
| 高 | 测试默认开发数据库；通知 fixture 清理遗漏 | 显式独立测试库、启动前校验、定向清理 |
| 中 | 孤立 route/rate-limit 测试只随集成执行 | 移入常规 unit，生产 server-only 边界不变 |
| 低 | 巨型服务、重复 UI、编辑器 dirty 疑似未清除 | 按已测试职责拆分；不为行数拆分，不进行无证据视觉改动 |

裁决：现有代码没有数据库泄漏到 UI/route，不增加通用仓储层。SQL 与 DTO 规则保留显式领域语义。暂停用户仍可改密、登出和确认通知。诗作撤回后的删除保持现有行为；特辑从未发布限制不变。通知维持尽力唤醒，不增加 outbox。纯外观和通用登录门槛合并不在本轮关键路径。

## 阶段计划与测试先行

1. 测试隔离与授权：环境拒绝测试、直接管理页拒绝测试、锁等待后撤权回归；随后服务端策略与 auth 端点硬化。
2. 评论数据：多根最新三条、并发同 token、根锁期间删除/回复/活动时间测试；随后查询模块和根锁统一。
3. 通知：SSE 取消/失败/晚到订阅/超时测试，已读幂等与并发发布集成；随后服务拆分、快照和恢复。
4. 评论前端：三次提交、加载旧页后编辑、过期请求测试；随后分页生命周期抽取和组件拆分。
5. 集成复核补修：内容 writer 行 SHARE 锁及停用竞态测试；公告纯读取与挂载确认；跨标签页已读广播；Redis publisher 关闭后恢复测试；并发撤权 action 错误映射。

每阶段执行 typecheck、lint、unit、integration 和相关 Playwright。最终构建、规范检查和完整回归。基线：245 unit、27 integration、typecheck、lint 通过；首次沙箱集成失败为本地端口 EACCES，授权本地连接后通过。后续统一使用 poetryclub_refactor_test 独立库。

## 独立审计记录与兼容性

| 方向 | 具体发现 / 影响 / 原始路径 | 主代理裁决与风险 |
| --- | --- | --- |
| 数据 | 高：评论父节点与活动时间竞态，`src/server/services/comments/index.ts`；中：10 个根产生 10 次预览查询 | 根锁与 SQL 聚合，窗口函数批量查询；保持最新三条、占位和时间/ID排序。已有外键、幂等唯一约束无需 migration |
| 数据 | 中：事务类型依赖 admin-audit，评论与通知巨型服务；`src/server/services/admin-audit.ts`、`notifications/index.ts` | 类型归 db，按契约/读取/写入/投递拆分；保持 barrel 导出。未发现 UI 或 route 直接访问 DB，不新增通用仓储层 |
| 数据 | 中：poems、collections、comments 的读取条件相近但有领域差异 | 暂不合成泛化 SQL 策略，避免成员门槛、特辑范围和治理占位语义被混同；后续可由独立访问矩阵保护再收敛 |
| 授权 | 高：管理页依赖可复用 layout，`src/app/admin/*/page.tsx`；guard 等待期间角色变化，`services/moderation.ts` | 各页取数前独立授权，所有治理事务 guard→actor→target。低频写入串行化，后续扩展需保留最后管理员不变量 |
| 授权 | 高：作者写入只依赖入口 active 快照，`services/poems.ts`、`collections.ts`、`comments/index.ts` | 服务内 writer→content 的 SHARE 锁与重验；暂停在先则写入拒绝，已授权写入在先则先完成再暂停，不强制中断已开始事务 |
| 授权 | 中：默认资料更新端点和可跳过其他会话撤销，`src/server/auth/index.ts` | 禁用未支持 update-user，服务端强制改密撤销其他会话；当前设备仍登录，停用用户改密/登出/通知确认仍允许 |
| 前端 | 高：连续成功提交不旋转 token、自动 reset 覆盖隐藏值、局部指纹未同步旧页和权限；`comment-ui.tsx` | 表单 token 纳入状态，success 按结果处理；显式快照、可取消分页、恢复已请求深度。列表身份保持，避免 remount 丢阅读历史 |
| 前端 | 中：表单、卡片、线程、分页混在一个组件 | 拆 feature 组件和纯控制器，复用既有 shadcn；默认服务端边界和视觉设计保持。dirty 未清除的疑似问题无复现，不盲改 |
| 实时 | 高：ready/reconnect/focus 不重读丢失事件，SSE 取消/晚到订阅资源分叉；`notification-menu.tsx`、`stream/route.ts` | 统一生命周期、有界连接、五分钟重认证、恢复重读与事件合并。仍为尽力唤醒，不引入 outbox或事件重放 |
| 实时 | 中：无界公告受众、已读覆盖、跨标签页陈旧、渲染时确认；`notifications/index.ts` | INSERT SELECT 快照、每100人投递、首次已读幂等广播、GET纯读+挂载确认。JavaScript关闭时直接公告访问仍可读，已读需显式通知操作 |
| 实时复核 | 高：closed publisher.destroy 抛错导致断线后永远无法替换，`notifications/realtime.ts` | 按 isOpen 销毁，连接失败保留原始错误并允许重试；两项模拟断线回归先失败后通过 |
| 测试 | 高：测试默认开发库、治理测试失败后不能恢复账号；`scripts/run-integration-tests.mjs`、`playwright.config.ts`、`admin-moderation.spec.ts` | 显式独立测试库、同一fixture/webServer连接、finally恢复测试账号。库名和本地主机预检；禁用无法确认数据库的服务器复用及远程应用地址。保留Node20.9兼容性，不使用较新loadEnvFile API |
| 测试 | 中：route/rate limit mock测试藏在integration、SSE和客户端竞态缺失 | 移入unit；新增权限等待、已读、取消、迟到结果、分页恢复测试。保留真实PostgreSQL/Redis和Playwright验证 |
| 质量 | 低：相似表单状态/分页工具与多处友好错误 | 优先修复具体权限错误映射，保留领域消息和Next控制流；不引入通用Action框架。strict TS及现有lint保持 |

## 实施与验证记录

- 阶段1：254 unit、22 integration、权限浏览器回归通过；7项纯mock集成测试移至unit，数量变化不表示删除覆盖。
- 阶段2：评论12项集成与5项浏览器回归通过，typecheck/lint/unit通过；时间聚合保留PostgreSQL精度。
- 阶段3：260 unit、通知5项集成、4项通知浏览器回归通过；本地并发套件曾ETIMEDOUT，单独运行通过，最终浏览器不与数据库集成并跑。
- 阶段4：265 unit、评论6项浏览器回归通过；三次提交和旧页编辑先揭示reset/token及在途分页丢失，再修复通过；typecheck/lint通过。
- 阶段5：首次整合30项集成通过；追加写入期间停用/诗作撤回与权限Action/Redis恢复回归后进行最终验证。
- 最终检查：typecheck、lint、279 unit、32 integration、check:conventions、db:check、db:migrate:test、build通过。生产构建使用仅进程内的邮件配置占位值完成校验，没有发送邮件或修改环境文件。
- Playwright整合过程中先发现管理页独立保护后旧权限会话被403替换、实时恢复刷新会重验旧会话页面；更新为明确拒绝与真实请求重放，保留无写入、无审计和管理员数量断言，不放松授权。
- 全量回归随后暴露共享管理员评论冷却、旧页面刷新后按钮消失及移动导航未等待跳转完成的测试时序问题。连续评论改用独立作者，过期写入保存真实请求后重放，导航等待新页面与菜单关闭。相关四组30项全部通过；最终全量80项全部通过（6.2分钟，零跳过）。请求捕获故意中止提交，因此测试日志中的 Failed to fetch 为预期，重放响应和数据库状态均有断言。

## 保留边界与回滚

- 分页是动态数据上的一致性快照，不保证跨请求数据库快照隔离。评论活动重排时按ID去重，刷新会重新恢复页深度。
- 治理guard及writer SHARE锁按短事务使用，不在事务内等待Redis；未来新服务必须保持同一锁序。
- 当前无生产schema变化。可按授权策略、评论查询/锁、通知服务、前端分页分别回滚；测试库隔离建议保留。
- 后续可独立评估特辑服务拆分、共享读取策略、横向扩容和真实Redis中断恢复演练；当前不通过新增泛化层或消息基础设施扩大范围。
