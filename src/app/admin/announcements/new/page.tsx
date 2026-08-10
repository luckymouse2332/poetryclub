import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { createAnnouncementAction } from "@/features/notifications/announcement-actions";
import { AnnouncementForm } from "@/features/notifications/components/announcement-form";

export const metadata: Metadata = { title: "新建系统公告" };

export default function NewAnnouncementPage() {
  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="系统公告"
        title="新建公告草稿"
        description="草稿可以继续修改；发布后正文、受众和链接都不可变。"
      />
      <div className="mt-8">
        <AnnouncementForm
          action={createAnnouncementAction}
          submitLabel="创建草稿"
        />
      </div>
    </PageContainer>
  );
}
