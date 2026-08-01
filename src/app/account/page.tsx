import type { Metadata } from "next";

import {
  formatCreatedAt,
  getUserDisplayName,
} from "@/features/auth/user-display";
import { requireCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "账号",
};

export default async function AccountPage() {
  const user = await requireCurrentUser("/account");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">账号</h1>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">显示名称</dt>
            <dd className="font-medium">{getUserDisplayName(user)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">邮箱</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">注册时间</dt>
            <dd className="font-medium">{formatCreatedAt(user.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">认证状态</dt>
            <dd className="font-medium">已登录</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
