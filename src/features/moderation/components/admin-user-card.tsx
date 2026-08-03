import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  restoreUserAction,
  suspendUserAction,
  updateUserRoleAction,
} from "@/features/moderation/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import {
  ROLE_LABELS,
  USER_STATUS_LABELS,
  formatModerationDate,
} from "@/features/moderation/formatters";
import type { AdminUserSummary } from "@/server/services/moderation";

type AdminUserCardProps = Readonly<{
  user: AdminUserSummary;
  /** 当前登录的管理员自身：禁止对自己执行禁用 / 降级（服务端同样强制）。 */
  isSelf?: boolean;
}>;

/**
 * 管理后台用户卡片（Server Component）：角色 / 账号状态 Badge、作品计数。
 * 禁用 / 恢复 / 提升 / 降级均通过 AdminReasonActionDialog 二次确认并填写原因。
 */
export function AdminUserCard({ user, isSelf = false }: AdminUserCardProps) {
  const suspended = user.status === "suspended";
  const isAdmin = user.role === "admin";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            {user.name}
          </h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          <Badge variant={isAdmin ? "primary" : "neutral"}>
            {ROLE_LABELS[user.role]}
          </Badge>
          <Badge variant={suspended ? "danger" : "success"}>
            {USER_STATUS_LABELS[user.status]}
          </Badge>
          {isSelf ? <Badge variant="neutral">当前账号</Badge> : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-label">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">邮箱</dt>
            <dd className="min-w-0 break-all font-medium text-foreground">
              {user.email}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">注册时间</dt>
            <dd className="font-medium text-foreground">
              {formatModerationDate(user.createdAt)}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">作品</dt>
            <dd className="font-medium text-foreground">
              草稿 {user.draftCount} · 已发布 {user.publishedCount}
            </dd>
          </div>
        </dl>
        {user.suspensionReason ? (
          <p className="mt-3 whitespace-pre-wrap rounded-md border border-danger/30 bg-danger-surface p-3 text-label text-danger">
            禁用原因：{user.suspensionReason}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        {suspended ? (
          <AdminReasonActionDialog
            action={restoreUserAction.bind(null, user.id)}
            triggerLabel="恢复用户"
            title="恢复这个用户？"
            description="恢复后该用户重新获得完整访问权限。此操作属于管理变更，会记入审计日志。"
            confirmLabel="确认恢复"
            confirmBusyLabel="正在恢复…"
          />
        ) : (
          <AdminReasonActionDialog
            action={suspendUserAction.bind(null, user.id)}
            triggerLabel="禁用用户"
            title="禁用这个用户？"
            description="禁用后该用户保留只读访问，不能创建、编辑、发布或删除诗作。系统始终保留至少一名正常管理员。"
            confirmLabel="确认禁用"
            confirmBusyLabel="正在禁用…"
          />
        )}
        {!isSelf && !isAdmin ? (
          <AdminReasonActionDialog
            action={updateUserRoleAction.bind(null, user.id, "admin")}
            triggerLabel="提升为管理员"
            triggerVariant="secondary"
            confirmVariant="primary"
            title="提升为管理员？"
            description="该用户将获得管理后台权限，可以治理诗作、管理用户与邀请码。所有操作都会写入审计日志。"
            confirmLabel="确认提升"
            confirmBusyLabel="正在提升…"
          />
        ) : null}
        {!isSelf && isAdmin ? (
          <AdminReasonActionDialog
            action={updateUserRoleAction.bind(null, user.id, "member")}
            triggerLabel="降级为成员"
            triggerVariant="secondary"
            title="降级为成员？"
            description="该用户将失去管理后台权限。系统始终保留至少一名正常管理员，降级前会校验。"
            confirmLabel="确认降级"
            confirmBusyLabel="正在降级…"
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}
