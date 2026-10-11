import { MemberAccessGate } from "@/features/auth/components/member-access-gate";

/** 登录门槛的业务文案；不接收受保护正文。 */
export function CollectionLoginGate({
  nextPath,
}: Readonly<{ nextPath: string }>) {
  return (
    <MemberAccessGate
      nextPath={nextPath}
      title="这个特辑仅成员可见"
      description="请登录，登录成功后会回到当前特辑。"
      returnHref="/collections"
      returnLabel="返回特辑列表"
    />
  );
}
