# 生产环境文件 CRLF 构建修复

## 背景

Windows 上从生产环境示例创建的 `deploy/.env.production` 使用 CRLF 换行。Dockerfile 在 Linux 构建阶段直接用 `/bin/sh` source BuildKit secret，导致每个变量值末尾保留 `\r`；严格枚举和邮箱校验因此把正确填写的 `EMAIL_TRANSPORT=resend` 与发件地址判为无效，生产镜像无法构建。

## 范围

- [x] 将当前本地生产环境文件机械转换为 LF，不改变任何变量值。
- [x] 在 Dockerfile source 环境 secret 前移除 CR 字符，兼容 Windows CRLF 文件。
- [x] 验证生产应用镜像能够完成构建。

## 非目标

- [x] 不读取、记录或修改 API Key、密码和认证密钥内容。
- [x] 不修改数据库 Schema、migration 或现有数据。

## 架构边界

生产环境文件继续通过 BuildKit secret 提供，不复制进镜像。规范化临时文件只在同一个构建步骤中存在，并在运行构建命令前删除；生产环境变量仍由服务端 Zod 校验。

## 验收条件

- [x] CRLF 格式的生产环境文件不再给变量值附加 `\r`。
- [x] `EMAIL_TRANSPORT` 与 `EMAIL_FROM_ADDRESS` 通过现有生产环境校验。
- [x] 应用生产镜像构建成功。

## 测试

已检查当前环境文件换行字节（CRLF 为 0，LF 为 17）；使用实际生产 Compose 执行 `docker compose build app` 成功；`git diff --check` 通过。

## 风险 / 回滚

`tr -d '\r'` 只处理环境文件中的回车字符，正常密钥和 URL 不应包含该字符。若需回滚，可恢复 Dockerfile 原来的直接 source，但 Windows CRLF 文件将再次导致构建失败。

## 状态

- 状态：`已完成`
- 负责人：Codex
- 完成日期：2026-08-08
