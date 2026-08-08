# 开发、版本与发布工作流

本文定义回中诗社从任务编号、工作分支、提交信息到正式发布的统一规则。规则从 `CHORE-1` 完成后适用于新工作。已有分支、提交、标签和任务文件作为历史记录保留，不要求改名或重写。历史分支只读保留；要继续进行新工作，必须从最新 `master` 创建符合新规则的新分支。

## 1. 四类名称各自解决什么问题

任务编号、分支名、提交信息和发布版本分别服务于不同目的，不能互相推导。

| 名称 | 示例 | 用途 |
| --- | --- | --- |
| 任务编号 | `M4.1`、`BUG-4`、`CHORE-1` | 说明为什么做、范围和验收条件 |
| 分支名 | `feat/m4-1-content-access-control` | 标识一组尚未合入的工作 |
| 提交信息 | `feat(posts): add member-only visibility` | 记录一个可独立理解的代码变化 |
| 发布版本 | `v1.2.0` | 标识一份可部署、不可移动的发布快照 |

`M4.1` 不对应 `v4.1.0`，也不要求发布版本包含数字 `4.1`。一个任务可以不单独触发发布，一次发布也可以包含多个任务。

## 2. 任务编号

### 2.1 路线任务

产品功能、架构能力和较大的工程阶段使用 `M<阶段>.<序号>`。阶段和序号都是十进制整数，点号表示层级，不表示小数，因此 `M3.10` 位于 `M3.9` 之后。

- `M4.0` 表示 M4 阶段的基线任务。
- `M4.1`、`M4.2` 表示 M4 阶段后续按计划推进的独立任务。
- 启用 `M5.0` 前，必须先在任务清单中写明 M5 的整体目标。仅因为上一项是 `M4.9`，不能自动开始 M5。

已有的 `M0`、`M1`、`M2.0` 及部分省略 `.0` 的文件名保留。新建阶段基线时统一写成 `Mx.0`。在创建 `Mx.0` 分支前，必须先在 `docs/tasks/README.md` 的“阶段定义”中写明该阶段的整体目标；阶段定义不存在时，规范检查会拒绝该分支。

### 2.2 非路线任务

| 前缀 | 使用场景 | 示例 |
| --- | --- | --- |
| `BUG-<序号>` | 已实现行为不符合既定要求，或生产、测试出现回归 | `BUG-4` |
| `OPS-<序号>` | 部署、备份、监控、服务器和恢复流程 | `OPS-1` |
| `CHORE-<序号>` | 仓库流程、工具链、依赖、文档治理等不改变产品行为的维护 | `CHORE-1` |
| `SPIKE-<序号>` | 有时间限制的调查或原型，结论可能是不实施 | `SPIKE-1` |

每个前缀独立递增。修复某个任务引入的缺陷时优先建立新的 `BUG-*`，不继续增加 `M3.0-fix-2` 一类后缀。历史 `M3.0-fix` 保留。

### 2.3 任务文件

任务文件使用 `<任务编号>-<英文短名>.md`，短名仅包含小写英文字母、数字和连字符，例如：

```text
docs/tasks/M4.1-content-access-control.md
docs/tasks/BUG-4-member-visibility-leak.md
docs/tasks/CHORE-1-repository-workflow-conventions.md
```

任务开始时状态为“进行中”，完成全部验收和实际验证后才能改为“已完成”。任务清单中的编号、标题、状态和文件链接必须一致。

## 3. 分支命名与生命周期

### 3.1 长期分支

`master` 是唯一长期开发分支，也必须始终保持可构建、可部署。普通功能、修复和维护工作不能直接提交到 `master`，应从最新的 `master` 创建短期分支。

GitHub 的 `origin` 是主远程，CNB 的 `mirror` 是镜像远程。先确认 `origin/master`，发布完成后再同步 `master` 和标签到 `mirror`。不能让两个远程分别产生不同历史。

### 3.2 普通工作分支

普通分支格式为：

```text
<类型>/<小写任务编号>-<英文短名>
```

允许的类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`perf`、`build`、`ci` 和 `chore`。任务编号转换为小写，并把点号改为连字符。

```text
feat/m4-1-content-access-control
fix/bug-4-member-visibility-leak
chore/chore-1-repository-conventions
docs/ops-1-backup-runbook
```

分支名只能使用小写 ASCII 字母、数字和连字符。分支合入后应删除本地和远程副本。已经共享的分支禁止强制推送；需要整理历史时，在首次推送前完成。

### 3.3 发布与热修复分支

每次稳定版或 RC 都创建对应的 `release/vX.Y.Z`。发布分支只能接受版本号、CHANGELOG、发布文档和阻断发布的修复，不能继续加入普通功能。没有 RC 的小型发布也不能跳过发布分支，这样版本准备、检查和最终标签都有唯一位置。

紧急修复从当前稳定标签或最新 `master` 创建：

```text
hotfix/v1.1.1-password-reset-regression
```

热修复完成后合回 `master`，发布对应 PATCH 版本，并同步两个远程。发布分支和热修复分支完成后删除。

## 4. 提交信息

普通提交采用以下格式：

```text
<type>(<scope>)!: <subject>
```

`scope` 和 `!` 可省略。标题使用英文，正文可以使用中文或英文。标题总长度不超过 100 个字符，其中 `subject` 不超过 72 个字符，使用小写开头的动词短语，不以句号、问号或感叹号结尾。

### 4.1 类型

| 类型 | 用途 | 对版本的通常影响 |
| --- | --- | --- |
| `feat` | 新增用户或运维人员可使用的能力 | MINOR |
| `fix` | 修复既定行为、安全问题或回归 | PATCH |
| `perf` | 不改变行为的性能改进 | PATCH |
| `refactor` | 不改变外部行为的代码重构 | 通常不单独发布 |
| `docs` | 仅文档变化 | 通常不单独发布 |
| `test` | 仅测试变化 | 通常不单独发布 |
| `build` | 构建系统、镜像或打包变化 | 按实际兼容性判断 |
| `ci` | 持续集成配置变化 | 通常不单独发布 |
| `chore` | 依赖、仓库维护或发布准备 | 按实际影响判断 |
| `revert` | 撤销已有提交 | 按被撤销内容判断 |

常用 scope 包括 `auth`、`posts`、`moderation`、`notifications`、`users`、`homepage`、`about`、`ui`、`db`、`deploy`、`docs`、`deps`、`release` 和 `test`。允许增加符合模块名称的小写 scope，不维护容易过期的封闭白名单。

```text
feat(posts): add member-only poem visibility
fix(auth): keep reset response independent of account existence
docs(workflow): define release versioning rules
chore(release): prepare v1.2.0
```

一个提交只处理一个可以独立说明和回滚的逻辑变化。正文用于解释原因、约束和风险，不能只重复文件变化。需要关联任务时在 footer 中写 `Task: M4.1`；需要关联 Issue 时写 `Refs: #123`。

破坏性变化在类型或 scope 后加入 `!`，并在 footer 中写明迁移方式：

```text
feat(auth)!: replace legacy session contract

BREAKING CHANGE: existing sessions must be revoked during deployment.
Task: M6.0
```

人工创建的合并提交使用 `chore(merge): merge <分支名>`。GitHub 自动生成的 `Merge pull request ...`、Git 自动生成的 `Merge branch '...'` 和 Git 自动生成的 `Revert "..."` 提交可以保留，不要求重写。

## 5. 发布版本与标签

项目使用 Semantic Versioning，格式为 `MAJOR.MINOR.PATCH`。Git 标签在前面增加 `v`，`package.json` 不增加 `v`。

| 变化 | 版本升级 | 示例 |
| --- | --- | --- |
| 向后兼容的新功能、新页面或可选配置 | MINOR | 内容访问权限使 `1.1.0` 升为 `1.2.0` |
| 向后兼容的缺陷、安全、性能或部署修复 | PATCH | `1.1.0` 升为 `1.1.1` |
| 不兼容的用户流程、配置、数据或运维契约变化 | MAJOR | `1.2.0` 升为 `2.0.0` |

数据库 migration 本身不自动意味着 MAJOR。新增字段并保留旧行为通常属于 MINOR；删除字段、无法兼容回滚的数据变换或必须同步修改外部配置的变化可能属于 MAJOR。版本判断以用户、数据和部署兼容性为准，不能只看提交类型。

候选版本只使用 RC：

```text
v1.2.0-rc.1
v1.2.0-rc.2
v1.2.0
```

RC 序号从 1 开始递增。RC 发现问题后继续发布新的 RC，禁止移动或覆盖旧标签。稳定标签和 RC 标签都必须是 annotated tag。稳定标签只能指向已经合入 `master` 的提交。

`package.json` 的 `version` 必须与正在准备的标签一致。稳定版 `v1.2.0` 对应 `"version": "1.2.0"`，候选版 `v1.2.0-rc.1` 对应 `"version": "1.2.0-rc.1"`。稳定发布必须在 `CHANGELOG.md` 中存在对应版本和日期。

## 6. 发布流程

1. 确认计划发布的任务已经完成，`master` 与 `origin/master` 一致，工作区干净。
2. 查看从上一个稳定标签到 `master` 的实际变化，并按兼容性决定 MAJOR、MINOR 或 PATCH。
3. 创建 `release/vX.Y.Z`，在该分支完成版本和 CHANGELOG 更新；是否发布 RC 由风险和验证需要决定。
4. 更新 `package.json` 和 `CHANGELOG.md`，提交为 `chore(release): prepare vX.Y.Z` 或对应 RC。
5. 运行 typecheck、lint、unit、integration、E2E、build 和 migration 检查；无法运行的项目必须写入发布说明。
6. 把发布准备和阻断修复合入 `master`，再次确认最终提交内容和数据库回滚边界。
7. 创建 annotated tag，例如 `git tag -a v1.2.0 -m "Release v1.2.0"`。
8. 先推送 `master` 和标签到 `origin`，确认 CI 与部署结果后，再同步到 `mirror`。
9. 发布说明引用 `CHANGELOG.md`，记录 migration、环境变量、备份和回滚要求。
10. 删除已完成的普通、release 和 hotfix 分支。已发布标签永不移动；需要修复时发布新版本。

## 7. 自动检查

本地执行：

```powershell
pnpm check:conventions
pnpm hooks:install
```

`check:conventions` 检查当前分支名和最新提交。安装仓库 hook 后，每次提交都会检查提交信息，每次推送都会检查当前分支名。

GitHub Actions 对以下内容执行同一份检查：

- Pull Request 的源分支、标题和全部新提交。
- 推送到 `master` 的全部新提交。
- `v*` 标签的格式、annotated tag 类型、`package.json` 版本和 CHANGELOG 记录。

GitHub 仓库管理员还应为 `v*` 标签配置 ruleset，禁止更新和删除标签，并限制创建标签的权限。工作流可以发现标签被移动或删除，但无法替代远程仓库的保护规则。

自动检查负责验证可机械判断的格式。版本升级级别、scope 是否准确、正文是否解释清楚以及发布是否安全，仍由评审者根据实际变化判断。
