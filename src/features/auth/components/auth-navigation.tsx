import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";
import { getUserDisplayName } from "@/features/auth/user-display";
import { getCurrentUser } from "@/server/auth/session";

/**
 * 认证导航（Server Component）：在服务端读取当前用户，仅向渲染层暴露最小安全视图，
 * 不向任何 Client Component 传递会话或用户对象。
 * 返回的是 SiteHeader 导航列表的 <li> 列表项片段。
 */
export async function AuthNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <li>
          <Link
            href="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            登录
          </Link>
        </li>
        <li>
          <Link
            href="/login?mode=sign-up"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            注册
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li className="text-muted-foreground">{getUserDisplayName(user)}</li>
      <li>
        <Link
          href="/account"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          账号
        </Link>
      </li>
      <li>
        <form action={logoutAction}>
          <button
            type="submit"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            登出
          </button>
        </form>
      </li>
    </>
  );
}
