import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AccountSectionNavigation } from "@/features/auth/components/account-secondary-navigation";
import { createCollectionAction } from "@/features/collections/actions";
import { CollectionForm } from "@/features/collections/components/collection-form";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";

export const metadata: Metadata = { title: "新建特辑" };

export default async function NewCollectionPage() {
  const session = await requireCurrentUser("/account/collections");
  const currentUser = await getAuthoritativeUser(session.id);
  if (!currentUser || currentUser.status === "suspended") {
    return (
      <PageContainer width="narrow">
        <PageHeader eyebrow="我的作品" title="新建特辑" />
        <AccountSectionNavigation />
        <Alert variant="danger" className="mt-8">
          <AlertDescription>你的账号已被禁用，目前不能新建特辑。</AlertDescription>
          <div className="mt-4">
            <Button asChild variant="secondary"><Link href="/account/collections">返回我的特辑</Link></Button>
          </div>
        </Alert>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <PageHeader
        eyebrow="我的作品"
        title="新建特辑"
        description="先保存标题、简介与访问范围，再整理诗作目录。"
      />
      <AccountSectionNavigation />
      <div className="mt-8">
        <CollectionForm
          action={createCollectionAction}
          submitLabel="保存草稿"
          creationToken={randomUUID()}
        />
      </div>
    </PageContainer>
  );
}
