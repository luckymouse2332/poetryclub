import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_TARGET_LABELS,
  formatModerationDateTime,
} from "@/features/moderation/formatters";
import type { AuditLogSummary } from "@/server/services/moderation";

type AdminAuditCardProps = Readonly<{
  entry: AuditLogSummary;
}>;

/**
 * 审计日志卡片（Server Component）：只读展示动作中文名、管理员、目标与原因。
 * 不提供编辑 / 删除入口；metadata 无需完整展示（按任务规格可不渲染）。
 */
export function AdminAuditCard({ entry }: AdminAuditCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            {AUDIT_ACTION_LABELS[entry.action]}
          </h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">{AUDIT_TARGET_LABELS[entry.targetType]}</Badge>
          <span>管理员：{entry.adminName}</span>
          <span aria-hidden="true"> · </span>
          <span>发生于 {formatModerationDateTime(entry.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-label">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="shrink-0 text-subtle">目标编号</dt>
            <dd className="min-w-0 break-all font-medium text-foreground">
              {entry.targetId}
            </dd>
          </div>
          {entry.reason ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="shrink-0 text-subtle">原因</dt>
              <dd className="whitespace-pre-wrap font-medium text-foreground">
                {entry.reason}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}
