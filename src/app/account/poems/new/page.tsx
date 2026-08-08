import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { createPoemAction } from "@/features/posts/actions";
import { PoemForm } from "@/features/posts/components/poem-form";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";

export const metadata: Metadata = {
  title: "新建诗作",
};

export default async function NewPoemPage() {
  const sessionUser = await requireCurrentUser("/account/poems");
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  const suspended = currentUser?.status === "suspended";

  // suspended（或无法确认状态）时不渲染表单，只展示说明与只读入口。
  if (suspended || !currentUser) {
    return (
      <PageContainer width="narrow">
        <PageHeader
          eyebrow="我的作品"
          title="新建诗作"
          description="选择访问范围并保存为草稿，确认后再发布。"
        />
        <div className="mt-8 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger">
          <p role="alert">
            你的账号已被禁用，目前只能浏览内容，不能新建诗作。
            {currentUser?.suspensionReason
              ? `原因：${currentUser.suspensionReason}`
              : null}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/account/poems">返回我的诗作</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/account">查看账户</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // 幂等键：同一张表单的重复提交只对应一个草稿，仅存在于 hidden 字段。
  const creationToken = randomUUID();

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="我的作品"
        title="新建诗作"
        description="选择访问范围并保存为草稿，确认后再发布。"
      />
      <div className="mt-8">
        <PoemForm
          action={createPoemAction}
          submitLabel="保存草稿"
          creationToken={creationToken}
        />
      </div>
    </PageContainer>
  );
}
