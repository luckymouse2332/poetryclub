import { SiteNavLink } from "@/components/site-nav-link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/server/auth/session";

const navigationLinkClassName =
  "inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-body text-foreground no-underline transition-colors hover:text-seal";

/**
 * 认证导航（Server Component）：在服务端读取当前用户，仅向渲染层暴露最小安全视图，
 * 不向任何 Client Component 传递会话或用户对象。
 * 返回的是 SiteHeader 导航列表的 <li> 列表项片段。
 *
 * M3 调整：仅当服务端会话 DTO 为 role=admin 且 status=active 时显示“管理”入口；
 * suspended 用户仍保留账户 / 我的诗作（只读入口）与登出。隐藏导航不作为鉴权，
 * 真正的管理保护由 requireAdmin 与各 Server Action 独立完成。
 */
export async function AuthNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <li>
        <SiteNavLink href="/login" className={navigationLinkClassName}>
          登录
        </SiteNavLink>
      </li>
    );
  }

  const isActiveAdmin = user.role === "admin" && user.status === "active";

  return (
    <>
      <li>
        <SiteNavLink
          href="/account/poems"
          match="prefix"
          className={navigationLinkClassName}
        >
          我的诗作
        </SiteNavLink>
      </li>
      <li>
        <SiteNavLink href="/account" className={navigationLinkClassName}>
          账户
        </SiteNavLink>
      </li>
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
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className={`${navigationLinkClassName} h-auto rounded-none bg-transparent py-0 font-normal shadow-none hover:bg-transparent hover:text-seal active:bg-transparent active:text-seal`}
          >
            登出
          </Button>
        </form>
      </li>
    </>
  );
}
