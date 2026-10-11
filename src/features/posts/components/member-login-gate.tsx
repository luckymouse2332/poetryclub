import { MemberAccessGate } from "@/features/auth/components/member-access-gate";

/** 登录门槛的业务文案；不接收受保护正文。 */
export function MemberLoginGate({ nextPath }: Readonly<{ nextPath: string }>) {
  return (
    <MemberAccessGate
      nextPath={nextPath}
      title="这篇作品仅成员可见"
      description="请登录，登录成功后会回到当前作品。"
      returnHref="/poems"
      returnLabel="返回诗作列表"
    />
  );
}
