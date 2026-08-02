import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/features/auth/user-display";
import { getCurrentUser } from "@/server/auth/session";

/**
 * 首页首屏主操作（Server Component）：在服务端读取当前用户，只按认证态切换入口，
 * 不向任何 Client Component 传递会话或用户对象，也不改变认证 / 授权 / 跳转行为。
 * 匿名访客看到登录入口；已登录用户改为看到写作与作品入口，不再出现登录按钮。
 * 显示名走 getUserDisplayName，昵称为空时回退为掩码邮箱，不暴露完整邮箱。
 */
export async function HomeHeroActions() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/login?next=/account">登录</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="#about">了解回中诗社</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-body text-subtle">
        欢迎回来，{getUserDisplayName(user)}。
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/account/poems/new">写一首</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/account/poems">我的诗作</Link>
        </Button>
      </div>
    </div>
  );
}
