# 生产部署

生产拓扑固定为：`宿主机 Caddy → 127.0.0.1:4000 → Next.js app → PostgreSQL`。`migrate` 是部署时的一次性容器，不是常驻服务。Compose 只管理 PostgreSQL、migration 和 Next.js 应用；Caddy 与证书由宿主机独立管理。PostgreSQL 与 migration 只连接内部后端网络，应用同时连接后端网络和用于发布宿主机回环端口的入口网络。

## 前置条件

- Linux 服务器已安装 Docker Engine、Docker Compose v2 与宿主机 Caddy。
- 域名 A / AAAA 记录指向服务器，防火墙开放 TCP 80、TCP/UDP 443（UDP 443 用于 HTTP/3，可按网络策略关闭）。
- 服务器上的部署目录只允许可信管理员访问。
- 宿主机 `4000` 端口不需要对公网开放；Compose 只把它绑定到 `127.0.0.1`。

## 配置

```bash
cp deploy/.env.production.example deploy/.env.production
```

修改 `deploy/.env.production`：

- `BETTER_AUTH_URL` 必须使用真实域名和 HTTPS。
- 使用独立高熵值设置 `POSTGRES_PASSWORD` 和至少 32 字符的 `BETTER_AUTH_SECRET`。
- `DATABASE_URL` 中的密码必须与 `POSTGRES_PASSWORD` 一致；特殊字符必须进行 URL 编码。
- 不得提交该文件，也不得把值写入镜像或前端变量。

## 首次部署与更新

在仓库根目录执行：

```bash
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml up -d --build
```

Compose 会等待 PostgreSQL 健康，运行已提交的 Drizzle migration；只有 migration 成功后才启动应用，并把容器的 `3000` 端口发布为宿主机 `127.0.0.1:4000`。禁止用 `drizzle-kit push` 替代 migration。

宿主机 Caddy 的站点配置应把请求代理到该回环地址，例如：

```caddyfile
poetry.example.edu {
  reverse_proxy 127.0.0.1:4000
}
```

实际域名、TLS、响应头和日志策略由宿主机 Caddy 配置负责。修改后先用 `caddy validate` 检查配置，再由宿主机的服务管理器平滑重载 Caddy。

### 首个管理员（首次上线一次）

M3 migration 完成后，使用 `deploy/.env.production` 中临时设置的
`INITIAL_ADMIN_EMAIL`、`INITIAL_ADMIN_NAME`、`INITIAL_ADMIN_PASSWORD` 运行：

```bash
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml --profile tools \
  run --rm bootstrap-admin
```

脚本使用 Better Auth 官方密码哈希创建缺失的邮箱密码账号，或提升已有 active
账号；过程取得管理员事务锁、写入审计，并可重复执行。已是 active admin 时不会
重复写入。不得使用公开接口自我提升。成功后从生产环境文件移除三个临时变量，
再次执行普通 `up -d`。如果目标账号已被禁用，脚本会拒绝自动恢复，须由另一名
管理员处理。

查看状态与日志：

```bash
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml ps
docker compose --env-file deploy/.env.production \
  -f deploy/compose.production.yaml logs --tail=200 app migrate db

curl --fail http://127.0.0.1:4000/api/health
```

## 数据持久化与备份

- 数据库命名卷：`poetryclub_postgres_data`。
- 更新或重建容器不会删除命名卷。
- Caddy 证书和配置的备份由宿主机的 Caddy 安装方式决定，不属于本 Compose 的数据卷。
- 定期用 `pg_dump` 备份，并在独立环境验证恢复；不要把备份存放在同一块磁盘。
- 不要执行 `docker compose down -v`，该命令会删除持久化数据。

## 回滚

应用回滚应恢复上一版镜像或代码并重新构建。数据库 migration 默认只向前执行；涉及破坏性 Schema 变更时，必须在对应任务中单独记录兼容、备份和回滚方案。M0 migration 仅创建认证表。
