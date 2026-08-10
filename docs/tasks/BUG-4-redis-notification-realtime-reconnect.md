# BUG-4 Redis 通知实时连接恢复

## 背景

通知 Popover 显示“实时更新暂时不可用”。现有 SSE 订阅在 Redis 短暂断开后只尝试一次重连，且客户端不会在 SSE 恢复时清除旧错误状态；本地同进程回退也不符合通知实时通道由 Redis Pub/Sub 提供的架构约束。

## 范围

- [x] 让 Redis 订阅连接在初次连接成功后持续自动重连并恢复订阅。
- [x] 让 Redis 发布端快速失败，避免通知事务被实时通道阻塞。
- [x] 移除 SSE 的本地轮询回退，断线交由 EventSource 重连并从 PostgreSQL 恢复历史数据。
- [x] 在 SSE 连接重新打开时清除过期的前端错误提示。

## 非目标

- [x] 不改变通知数据库模型、授权规则、通知内容或发布事务。
- [x] 不公开 Redis 宿主机端口，不修改生产 Caddy 边界。

## 架构边界

Redis Pub/Sub 只负责在线用户的实时唤醒，PostgreSQL 仍是通知权威来源。Route Handler 继续只负责认证、建立 SSE 和释放连接；客户端不访问数据库或 Redis。

## 验收条件

- [x] Redis 可用时，认证 SSE 使用用户专属 Redis channel 接收通知事件。
- [x] Redis 初次不可用时，SSE 在有限时间内结束并允许浏览器重连；Redis 恢复后新连接可用。
- [x] 已建立的订阅在 Redis 短暂断开后自动重连并重新订阅。
- [x] 浏览器收到 SSE `open` 事件后不再保留旧的“实时更新不可用”提示。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：无新增 migration；继续使用现有 `REDIS_URL`，部署前确认 Redis 健康。
- 兼容性与回滚边界：可独立回滚实时服务、SSE Route Handler 和客户端错误状态；通知表及已持久化数据不受影响。

## 测试

运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`；通知 E2E 增加 SSE 错误后重新打开时清除提示的检查。

## 风险 / 回滚

Redis 仍不可用时，实时提示会暂时缺失，但通知写入和通知中心读取保持可用。回滚本任务涉及的三个源文件和 E2E 断言即可恢复原行为。

## 状态

- 状态：`已完成`
- 负责人：luckymouse2332
- 分支：`feat/m5-0-in-app-notifications`
- 完成日期：2026-08-09
