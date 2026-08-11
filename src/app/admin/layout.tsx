import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ADMIN_NAV_ITEMS } from "@/features/moderation/components/admin-nav";
import { requireAdminOrForbidden } from "@/features/moderation/require-admin";

/**
 * 管理后台布局：每次服务端渲染都调用 requireAdmin('/admin')。
 * 匿名访客由 guard 内部 redirect 到登录页并带回 returnTo；已登录但
 * 非 admin 或已被禁用的账号，捕获 AccessControlError 后调用 forbidden()
 * 渲染 admin/forbidden 的 403 边界。布局不承担唯一防线：每个 Server
 * Action 都独立完成认证 / 授权。
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrForbidden();

  return (
    <WorkspaceShell
      title="管理工作区"
      eyebrow="EDITORIAL DESK"
      ariaLabel="管理后台导航"
      items={ADMIN_NAV_ITEMS}
    >
      {children}
    </WorkspaceShell>
  );
}
