import { SiteNavLink } from "@/components/site-nav-link";
import { AccountNavigationMenu } from "@/features/auth/components/account-navigation-menu";
import { NotificationNavigation } from "@/features/notifications/components/notification-menu";
import { toNotificationView } from "@/features/notifications/formatters";
import { getCurrentUser } from "@/server/auth/session";
import {
  getUnreadNotificationCount,
  listRecentNotifications,
} from "@/server/services/notifications";

const navigationLinkClassName =
  "inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-label tracking-[0.14em] text-foreground no-underline transition-colors hover:text-seal";

/**
 * 认证导航（Server Component）：在服务端读取当前用户，仅向渲染层暴露最小安全视图，
 * 不向任何 Client Component 传递会话或用户对象。
 * 返回的是 SiteHeader 导航列表的 <li> 列表项片段；登录后的个人入口由“我的”菜单承载。
 *
 * M3 调整：仅当服务端会话 DTO 为 role=admin 且 status=active 时显示“管理”入口；
 * suspended 用户仍保留“我的”菜单中的账户 / 我的诗作（只读入口）与登出。隐藏导航不作为鉴权，
 * 真正的管理保护由 requireAdmin 与各 Server Action 独立完成。
 */
export async function AuthNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <li className="max-[639px]:col-start-2">
        <SiteNavLink href="/login" className={navigationLinkClassName}>
          登录
        </SiteNavLink>
      </li>
    );
  }

  const isActiveAdmin = user.role === "admin" && user.status === "active";
  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadNotificationCount(user.id),
    listRecentNotifications(user.id),
  ]);

  return (
    <>
      <NotificationNavigation
        unreadCount={unreadCount}
        items={recentNotifications.map(toNotificationView)}
        className={navigationLinkClassName}
      />
      {isActiveAdmin ? (
        <li>
          <SiteNavLink
            href="/admin"
            match="prefix"
            className={navigationLinkClassName}
          >
            管理
          </SiteNavLink>
        </li>
      ) : null}
      <li className="max-[639px]:col-start-2">
        <AccountNavigationMenu className={navigationLinkClassName} />
      </li>
    </>
  );
}
