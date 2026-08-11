import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { AccountSectionNavigation } from "@/features/auth/components/account-secondary-navigation";
import { OwnPoemCard } from "@/features/posts/components/own-poem-card";
import { Pagination } from "@/features/posts/components/pagination";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import { listOwnPoems } from "@/server/services/poems";
import { pageSchema } from "@/server/validation/poems";

export const metadata: Metadata = {
  title: "我的诗作",
};

type AccountPoemsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AccountPoemsPage({
  searchParams,
}: AccountPoemsPageProps) {
  const sessionUser = await requireCurrentUser("/account/poems");
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  const suspended = currentUser?.status === "suspended";

  const query = await searchParams;
  const parsedPage = pageSchema.safeParse(query.page);
  if (!parsedPage.success) {
    notFound();
  }

  const result = await listOwnPoems(sessionUser.id, parsedPage.data);
  if (result.total > 0 && parsedPage.data > result.pageCount) {
    notFound();
  }

  const notice = query.deleted === "1" ? "草稿已删除。" : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="我的作品"
        title="我的诗作"
        description={
          suspended
            ? "你的账号已被管理员禁用，目前只能浏览自己的诗作，不能新建、编辑、发布或删除。"
            : "管理你的草稿、发布状态和作品访问范围。"
        }
        actions={
          !suspended ? (
            <Button asChild>
              <Link href="/account/poems/new">新建诗作</Link>
            </Button>
          ) : undefined
        }
      />
      <AccountSectionNavigation />

      {suspended ? (
        <Alert variant="danger" className="mt-6 p-4">
          <AlertDescription>
            你的账号已被禁用，写操作已关闭。
            {currentUser?.suspensionReason
              ? `原因：${currentUser.suspensionReason}`
              : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {notice ? (
        <Alert variant="success" role="status" className="mt-6">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div>
            <div aria-hidden="true" className="hidden grid-cols-[minmax(12rem,1.5fr)_8rem_9rem_11rem_minmax(13rem,auto)] gap-5 border-b border-border-strong pb-3 text-caption font-medium tracking-wide text-subtle xl:grid">
              <span>标题</span><span>状态</span><span>访问范围</span><span>更新时间</span><span className="text-right">操作</span>
            </div>
            {result.items.map((poem) => (
              <OwnPoemCard key={poem.id} poem={poem} suspended={suspended} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{suspended ? "暂无诗作" : "还没有诗作"}</EmptyTitle>
              <EmptyDescription>
                {suspended
                  ? "账号被禁用期间只能浏览已有内容。"
                  : "新建一首草稿，写好后可以随时发布。"}
              </EmptyDescription>
            </EmptyHeader>
            {!suspended ? (
              <EmptyContent>
                <Button asChild>
                  <Link href="/account/poems/new">新建诗作</Link>
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        )}
      </Section>
      <Pagination
        basePath="/account/poems"
        page={result.page}
        pageCount={result.pageCount}
      />
    </PageContainer>
  );
}
