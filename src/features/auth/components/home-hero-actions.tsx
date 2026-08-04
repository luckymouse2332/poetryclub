import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/features/auth/user-display";
import { getCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";

/**
 * 首页首屏主操作（Server Component）：在服务端读取当前用户，只按认证态切换入口，
 * 不向任何 Client Component 传递会话或用户对象，也不改变认证 / 授权 / 跳转行为。
 * 首页的主要入口始终是页面提供的公开阅读链接；匿名访客不再重复显示登录按钮，
 * 已登录且 active 用户才在旁边看到写作与作品入口。
 * suspended 用户只保留只读入口并显示禁用原因（写入口由服务端再次强制校验）。
 * 显示名走 getUserDisplayName，昵称为空时回退为掩码邮箱，不暴露完整邮箱。
 */
export async function HomeHeroActions() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return null;
  }

  const currentUser = await getAuthoritativeUser(sessionUser.id);
  const suspended = currentUser?.status === "suspended";

  if (suspended || !currentUser) {
    return (
      <div className="basis-full">
        <p
          role="alert"
          className="max-w-reading rounded-sm border border-danger bg-danger-surface p-4 text-label text-danger"
        >
          你的账号已被管理员禁用，目前只能浏览内容，不能新建或修改诗作。
          {currentUser?.suspensionReason
            ? `原因：${currentUser.suspensionReason}`
            : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/account/poems">我的诗作</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account">查看账户</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="basis-full text-label text-subtle">
        欢迎回来，{getUserDisplayName(currentUser)}。
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/account/poems/new">写一首</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/poems">我的诗作</Link>
        </Button>
      </div>
    </div>
  );
}
