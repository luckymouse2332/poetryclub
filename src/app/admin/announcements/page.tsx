import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { AnnouncementCard } from "@/features/notifications/components/announcement-card";
import { listAnnouncements } from "@/server/services/notifications";
import { announcementListInputSchema } from "@/server/validation/notifications";

export const metadata: Metadata = { title: "系统公告" };

type AnnouncementsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AnnouncementsPage({
  searchParams,
}: AnnouncementsPageProps) {
  const parsed = announcementListInputSchema.safeParse(await searchParams);
  if (!parsed.success) notFound();
  const result = await listAnnouncements(parsed.data);
  if (result.total > 0 && parsed.data.page > result.pageCount) notFound();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="系统公告"
        description="创建公告草稿、选择发布受众，并发布不可变的站内公告。"
        actions={
          <Button asChild>
            <Link href="/admin/announcements/new">新建公告草稿</Link>
          </Button>
        }
      />
      <nav aria-label="公告筛选" className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant={!parsed.data.status ? "primary" : "secondary"}>
          <Link href="/admin/announcements">全部</Link>
        </Button>
        <Button asChild variant={parsed.data.status === "draft" ? "primary" : "secondary"}>
          <Link href="/admin/announcements?status=draft">草稿</Link>
        </Button>
        <Button asChild variant={parsed.data.status === "published" ? "primary" : "secondary"}>
          <Link href="/admin/announcements?status=published">已发布</Link>
        </Button>
      </nav>
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="divide-y divide-border-subtle border-y border-border-subtle [&>[data-slot=card]]:rounded-none [&>[data-slot=card]]:border-0 [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:shadow-none">
            {result.items.map((item) => (
              <AnnouncementCard key={item.id} announcement={item} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有公告</EmptyTitle>
              <EmptyDescription>创建第一份草稿后，会显示在这里。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination
        basePath="/admin/announcements"
        page={result.page}
        pageCount={result.pageCount}
        query={{ status: parsed.data.status }}
      />
    </PageContainer>
  );
}
