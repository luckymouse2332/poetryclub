import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Surface } from "@/components/ui/surface";
import {
  publishAnnouncementAction,
  updateAnnouncementAction,
} from "@/features/notifications/announcement-actions";
import { AnnouncementForm } from "@/features/notifications/components/announcement-form";
import { AnnouncementPublishForm } from "@/features/notifications/components/announcement-publish-form";
import { getAnnouncement } from "@/server/services/notifications";
import { announcementIdSchema } from "@/server/validation/notifications";

export const metadata: Metadata = { title: "编辑系统公告" };

type EditAnnouncementPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementPageProps) {
  const parsedId = announcementIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const announcement = await getAnnouncement(parsedId.data);
  if (!announcement) notFound();

  const published = announcement.status === "published";
  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="系统公告"
        title={published ? "已发布公告" : "编辑公告草稿"}
        description={
          published
            ? "这份公告已经发布，内容和受众不可修改。"
            : "保存草稿不会通知用户；发布后会立即生成收件人快照。"
        }
      />
      <div className="mt-8">
        {published ? (
          <Surface variant="paper" padding="lg">
            <h2 className="text-heading-3 font-semibold">{announcement.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-body text-subtle">
              {announcement.body}
            </p>
          </Surface>
        ) : (
          <AnnouncementForm
            action={updateAnnouncementAction.bind(null, announcement.id)}
            submitLabel="保存草稿"
            initialValues={{
              title: announcement.title,
              body: announcement.body,
              href: announcement.href ?? "",
              audience: announcement.audience,
            }}
          />
        )}
      </div>
      {!published ? (
        <Section title="发布公告" className="pb-0 pt-10">
          <p className="mb-4 text-body text-subtle">
            发布会按当前受众生成通知，发布后不能修改、撤回或删除。
          </p>
          <AnnouncementPublishForm
            action={publishAnnouncementAction.bind(null, announcement.id)}
          />
        </Section>
      ) : null}
    </PageContainer>
  );
}
