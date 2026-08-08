import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { updatePoemAction } from "@/features/posts/actions";
import { PoemActions } from "@/features/posts/components/poem-actions";
import { PoemForm } from "@/features/posts/components/poem-form";
import {
  formatPoemDate,
  toDateInputValue,
} from "@/features/posts/formatters";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import { getOwnPoem } from "@/server/services/poems";
import { poemIdSchema } from "@/server/validation/poems";

export const metadata: Metadata = {
  title: "编辑诗作",
};

type EditPoemPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function EditPoemPage({
  params,
  searchParams,
}: EditPoemPageProps) {
  const sessionUser = await requireCurrentUser("/account/poems");
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  const suspended = currentUser?.status === "suspended";

  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  // 私有读取按 id + authorId 查询；不是自己的作品统一 404，不依赖隐藏按钮。
  const poem = await getOwnPoem(parsedId.data, sessionUser.id);
  if (!poem) {
    notFound();
  }

  const query = await searchParams;
  const successNotice =
    query.created === "1"
      ? "草稿已创建。发布后会按所选访问范围展示。"
      : query.saved === "1"
        ? "修改已保存。"
        : query.published === "1"
          ? "作品已发布，但管理员隐藏仍然有效，暂不会公开。"
        : query.withdrawn === "1"
          ? "作品已撤回，回到草稿状态，仅自己可见。"
          : null;

  const isPublished = poem.status === "published";
  const hidden = poem.moderationStatus === "hidden";

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="我的作品"
        title={suspended ? "查看诗作" : "编辑诗作"}
      />

      <dl className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-label">
        <dd>
          <Badge variant={isPublished ? "success" : "warning"}>
            {isPublished ? "已发布" : "草稿"}
          </Badge>
        </dd>
        <dd>
          <Badge variant="neutral">
            {poem.visibility === "public" ? "公开" : "仅成员可见"}
          </Badge>
        </dd>
        {hidden ? (
          <dd>
            <Badge variant="danger">管理员已隐藏</Badge>
          </dd>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-subtle">创建于</dt>
          <dd className="font-medium text-foreground">
            {formatPoemDate(poem.createdAt)}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-subtle">更新于</dt>
          <dd className="font-medium text-foreground">
            {formatPoemDate(poem.updatedAt)}
          </dd>
        </div>
        {poem.publishedAt ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">首次发布</dt>
            <dd className="font-medium text-foreground">
              {formatPoemDate(poem.publishedAt)}
            </dd>
          </div>
        ) : null}
      </dl>

      {hidden && poem.moderationReason ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger"
        >
          这首诗已被管理员隐藏，不会出现在首页、列表与详情中。
          <span className="mt-1 block">原因：{poem.moderationReason}</span>
          {poem.moderatedAt ? (
            <span className="mt-1 block">
              处理时间：{formatPoemDate(poem.moderatedAt)}
            </span>
          ) : null}
        </p>
      ) : null}

      {suspended ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger"
        >
          你的账号已被禁用，当前只能查看内容，不能保存修改或调整状态。
          {currentUser?.suspensionReason
            ? `原因：${currentUser.suspensionReason}`
            : null}
        </p>
      ) : null}

      {successNotice ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-success bg-success-surface p-3 text-label text-success"
        >
          {successNotice}
        </p>
      ) : null}

      {suspended ? (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-section-title font-semibold text-foreground">
              正文
            </h2>
            <article className="mt-3 whitespace-pre-wrap rounded-lg border border-border-subtle bg-paper p-6 font-serif text-body text-foreground shadow-card">
              {poem.body}
            </article>
          </div>
          {poem.context ? (
            <div>
              <h2 className="text-section-title font-semibold text-foreground">
                创作背景
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-body text-subtle">
                {poem.context}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-8">
            <PoemForm
              action={updatePoemAction.bind(null, poem.id)}
              submitLabel="保存修改"
              initialValues={{
                title: poem.title,
                body: poem.body,
                context: poem.context ?? undefined,
                occurredAt: poem.occurredAt
                  ? toDateInputValue(poem.occurredAt)
                  : undefined,
                visibility: poem.visibility,
              }}
            />
          </div>

          <section
            aria-labelledby="poem-status-actions-title"
            className="mt-10 border-t border-border-subtle pt-6"
          >
            <h2
              id="poem-status-actions-title"
              className="text-section-title font-semibold text-foreground"
            >
              状态操作
            </h2>
            <p className="mt-2 text-body text-subtle">
              {isPublished
                ? "已发布的作品只提供撤回，不提供直接删除。"
                : "草稿可以发布，也可以删除。删除只作用于未发布的草稿。"}
              {hidden
                ? " 该作品已被管理员隐藏，保存、撤回或重新发布都不会解除隐藏。"
                : null}
            </p>
            <div className="mt-4">
              <PoemActions
                id={poem.id}
                status={poem.status}
                moderationStatus={poem.moderationStatus}
              />
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
