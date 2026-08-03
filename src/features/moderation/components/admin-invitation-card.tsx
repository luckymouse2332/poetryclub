import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { disableInvitationAction } from "@/features/moderation/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import {
  formatModerationDateTime,
} from "@/features/moderation/formatters";
import type { InvitationSummary } from "@/server/services/moderation";

type AdminInvitationCardProps = Readonly<{
  invitation: InvitationSummary;
  /** 服务端取到的当前时间，用于展示过期状态。 */
  now: Date;
}>;

/**
 * 邀请码卡片（Server Component）。只展示创建人、次数、过期时间等元信息，
 * 绝不渲染明文 code 或 hash（DTO 本身也不包含这些字段）。
 */
export function AdminInvitationCard({
  invitation,
  now,
}: AdminInvitationCardProps) {
  const disabled = invitation.disabledAt !== null;
  const expired = !disabled && invitation.expiresAt.getTime() <= now.getTime();
  const usedUp = !disabled && invitation.usedCount >= invitation.maxUses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">邀请码</h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          {disabled ? <Badge variant="danger">已停用</Badge> : null}
          {!disabled && expired ? <Badge variant="warning">已过期</Badge> : null}
          {!disabled && !expired && usedUp ? (
            <Badge variant="warning">已用尽</Badge>
          ) : null}
          {!disabled && !expired && !usedUp ? (
            <Badge variant="success">可用</Badge>
          ) : null}
          <span>创建于 {formatModerationDateTime(invitation.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-label">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">创建人</dt>
            <dd className="font-medium text-foreground">
              {invitation.creatorName}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">使用情况</dt>
            <dd className="font-medium text-foreground">
              已用 {invitation.usedCount} / {invitation.maxUses} 次
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">过期时间</dt>
            <dd className="font-medium text-foreground">
              {formatModerationDateTime(invitation.expiresAt)}
            </dd>
          </div>
          {disabled && invitation.disabledAt ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-subtle">停用时间</dt>
              <dd className="font-medium text-foreground">
                {formatModerationDateTime(invitation.disabledAt)}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        {!disabled && !expired && !usedUp ? (
          <AdminReasonActionDialog
            action={disableInvitationAction.bind(null, invitation.id)}
            triggerLabel="停用邀请码"
            title="停用这个邀请码？"
            description="停用后该邀请码立即失效，剩余次数作废；已使用次数不受影响。此操作会记入审计日志。"
            confirmLabel="确认停用"
            confirmBusyLabel="正在停用…"
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}
