import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteNavLink } from "@/components/site-nav-link";
import { AccountNavigationMenu } from "@/features/auth/components/account-navigation-menu";
import { MobileGlobalNavigation } from "@/features/auth/components/mobile-global-navigation";
import {
  getUserDisplayName,
  getUserInitial,
} from "@/features/auth/user-display";
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
 * 认证导航（Server Component）：服务端读取最小用户视图和现有通知状态，
 * 再分别组合桌面导航、移动全站菜单与移动账户入口。
 */
export async function AuthNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <SiteHeader
        mobileMenu={
          <MobileGlobalNavigation
            authenticated={false}
            isActiveAdmin={false}
            unreadCount={0}
          />
        }
        mobileAccount={
          <Link
            href="/login"
            className="flex size-12 items-center justify-center text-label font-medium text-foreground no-underline transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            登录
          </Link>
        }
        desktopNavigation={
          <li>
            <SiteNavLink href="/login" className={navigationLinkClassName}>
              登录
            </SiteNavLink>
          </li>
        }
      />
    );
  }

  const isActiveAdmin = user.role === "admin" && user.status === "active";
  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadNotificationCount(user.id),
    listRecentNotifications(user.id),
  ]);

  return (
    <SiteHeader
      mobileMenu={
        <MobileGlobalNavigation
          authenticated
          isActiveAdmin={isActiveAdmin}
          unreadCount={unreadCount}
        />
      }
      mobileAccount={
        <AccountNavigationMenu
          variant="mobile"
          displayName={getUserDisplayName(user)}
          initial={getUserInitial(user)}
          unreadCount={unreadCount}
        />
      }
      desktopNavigation={
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
          <li>
            <AccountNavigationMenu
              variant="desktop"
              className={navigationLinkClassName}
            />
          </li>
        </>
      }
    />
  );
}
