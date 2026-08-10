"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type NotificationsErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function NotificationsError({
  error: _error,
  reset,
}: NotificationsErrorProps) {
  void _error;
  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="个人消息"
        title="通知暂时无法加载"
        description="请稍后重试。已经送达的通知仍保存在服务器中。"
        actions={
          <Button type="button" variant="secondary" onClick={reset}>
            重新加载
          </Button>
        }
      />
    </PageContainer>
  );
}
