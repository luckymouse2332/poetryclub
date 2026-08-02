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
  const user = await requireCurrentUser("/account/poems");

  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  // 私有读取按 id + authorId 查询；不是自己的作品统一 404，不依赖隐藏按钮。
  const poem = await getOwnPoem(parsedId.data, user.id);
  if (!poem) {
    notFound();
  }

  const query = await searchParams;
  const successNotice =
    query.created === "1"
      ? "草稿已创建。发布后才会对所有人可见。"
      : query.saved === "1"
        ? "修改已保存。"
        : query.withdrawn === "1"
          ? "作品已撤回，回到草稿状态，仅自己可见。"
          : null;

  const isPublished = poem.status === "published";

  return (
    <PageContainer width="narrow">
      <PageHeader eyebrow="我的作品" title="编辑诗作" />

      <dl className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-label">
        <dd>
          <Badge variant={isPublished ? "success" : "warning"}>
            {isPublished ? "已发布" : "草稿"}
          </Badge>
        </dd>
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

      {successNotice ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-success bg-success-surface p-3 text-label text-success"
        >
          {successNotice}
        </p>
      ) : null}

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
        </p>
        <div className="mt-4">
          <PoemActions id={poem.id} status={poem.status} />
        </div>
      </section>
    </PageContainer>
  );
}
