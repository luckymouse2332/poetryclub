import { randomUUID } from "node:crypto";

import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { createPoemAction } from "@/features/posts/actions";
import { PoemForm } from "@/features/posts/components/poem-form";
import { requireCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "新建诗作",
};

export default async function NewPoemPage() {
  await requireCurrentUser("/account/poems");

  // 幂等键：同一张表单的重复提交只对应一个草稿，仅存在于 hidden 字段。
  const creationToken = randomUUID();

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="我的作品"
        title="新建诗作"
        description="先保存为草稿，确认后再发布。"
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
