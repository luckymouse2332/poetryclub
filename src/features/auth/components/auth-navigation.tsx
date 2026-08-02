import Link from "next/link";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
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
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">登录</Link>
          </Button>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/poems">我的诗作</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost" size="sm">
          <Link href="/account">账户</Link>
        </Button>
      </li>
      <li>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            登出
          </Button>
        </form>
      </li>
    </>
  );
}
