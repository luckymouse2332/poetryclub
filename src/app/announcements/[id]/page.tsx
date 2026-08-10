import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatNotificationDate } from "@/features/notifications/formatters";
import { requireExistingUser } from "@/server/policies/access";
import { openUserAnnouncement } from "@/server/services/notifications";
import { announcementIdSchema } from "@/server/validation/notifications";

export const metadata: Metadata = { title: "系统公告" };

type AnnouncementDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementDetailPageProps) {
  const { id } = await params;
  const parsedId = announcementIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const returnTo = `/announcements/${parsedId.data}`;
  const currentUser = await requireExistingUser(returnTo);
  const announcement = await openUserAnnouncement(currentUser.id, parsedId.data);
  if (!announcement) notFound();

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="系统公告"
        title={announcement.title}
        description={`发布于 ${formatNotificationDate(announcement.publishedAt)}`}
      />

      <article
        aria-label={announcement.title}
        className="mt-8 whitespace-pre-wrap rounded-lg border border-border-subtle bg-paper p-6 text-body-lg text-foreground shadow-card md:p-8"
      >
        {announcement.body}
      </article>

      {announcement.href ? (
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href={announcement.href}>前往相关页面</Link>
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
