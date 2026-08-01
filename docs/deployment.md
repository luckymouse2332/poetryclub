# 生产部署

生产拓扑固定为：`Caddy → Next.js app → PostgreSQL`。`migrate` 是部署时的一次性容器，不是常驻服务。PostgreSQL 与 Caddy 证书数据均使用命名卷持久化。

## 前置条件

- Linux 服务器已安装 Docker Engine 与 Docker Compose v2。
- 域名 A / AAAA 记录指向服务器，防火墙开放 TCP 80、TCP/UDP 443（UDP 443 用于 HTTP/3，可按网络策略关闭）。
- 服务器上的部署目录只允许可信管理员访问。

## 配置

```bash
cp deploy/.env.production.example deploy/.env.production
```

修改 `deploy/.env.production`：

- `SITE_ADDRESS` 与 `BETTER_AUTH_URL` 必须使用真实域名；生产认证 URL 必须为 HTTPS。
- 使用独立高熵值设置 `POSTGRES_PASSWORD` 和至少 32 字符的 `BETTER_AUTH_SECRET`。
- `DATABASE_URL` 中的密码必须与 `POSTGRES_PASSWORD` 一致；特殊字符必须进行 URL 编码。
- 不得提交该文件，也不得把值写入镜像或前端变量。

## 首次部署与更新

在仓库根目录执行：

```bash
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml up -d --build
```

Compose 会等待 PostgreSQL 健康，运行已提交的 Drizzle migration；只有 migration 成功后才启动应用，应用健康后 Caddy 才开始代理。禁止用 `drizzle-kit push` 替代 migration。

查看状态与日志：

```bash
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml ps
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml logs --tail=200 app migrate caddy db
```

## 数据持久化与备份

- 数据库命名卷：`poetryclub_postgres_data`。
- Caddy 证书卷：`poetryclub_caddy_data` 和 `poetryclub_caddy_config`。
- 更新或重建容器不会删除命名卷。
- 定期用 `pg_dump` 备份，并在独立环境验证恢复；不要把备份存放在同一块磁盘。
- 不要执行 `docker compose down -v`，该命令会删除持久化数据。

## 回滚

应用回滚应恢复上一版镜像或代码并重新构建。数据库 migration 默认只向前执行；涉及破坏性 Schema 变更时，必须在对应任务中单独记录兼容、备份和回滚方案。M0 migration 仅创建认证表。
