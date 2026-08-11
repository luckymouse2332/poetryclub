import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { AdminInvitationCard } from "@/features/moderation/components/admin-invitation-card";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { InvitationCreateForm } from "@/features/moderation/components/invitation-create-form";
import { listInvitations } from "@/server/services/moderation";
import { moderationPageSchema } from "@/server/validation/moderation";

export const metadata: Metadata = {
  title: "邀请码",
};

type AdminInvitationsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AdminInvitationsPage({
  searchParams,
}: AdminInvitationsPageProps) {
  const query = await searchParams;
  const parsedPage = moderationPageSchema.safeParse(query.page);
  if (!parsedPage.success) {
    notFound();
  }

  const result = await listInvitations(parsedPage.data);
  if (result.total > 0 && parsedPage.data > result.pageCount) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="邀请码"
        description="创建受控注册邀请码。明文邀请码只在创建成功时显示一次，列表只展示使用情况与有效期。"
      />

      <Section title="创建邀请码" className="pb-0 pt-8">
        <div className="max-w-narrow">
          <InvitationCreateForm />
        </div>
      </Section>

      <Section title="邀请码列表" className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {result.items.map((invitation) => (
              <div
                key={invitation.id}
                className="[&>[data-slot=card]]:rounded-none [&>[data-slot=card]]:border-0 [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:shadow-none"
              >
                <AdminInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  now={new Date()}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有邀请码</EmptyTitle>
              <EmptyDescription>
                创建第一个邀请码后，会显示在这里。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>

      <AdminPagination
        basePath="/admin/invitations"
        page={result.page}
        pageCount={result.pageCount}
        query={{}}
      />
    </PageContainer>
  );
}
