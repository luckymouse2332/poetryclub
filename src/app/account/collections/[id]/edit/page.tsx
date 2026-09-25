import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationNavigation } from "@/components/pagination-navigation";
import { Section } from "@/components/layout/section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AccountSectionNavigation } from "@/features/auth/components/account-secondary-navigation";
import {
  addCollectionItemAction,
  moveCollectionItemAction,
  removeCollectionItemAction,
  updateCollectionAction,
} from "@/features/collections/actions";
import { CollectionActions } from "@/features/collections/components/collection-actions";
import { CollectionForm } from "@/features/collections/components/collection-form";
import { CollectionItemAction } from "@/features/collections/components/collection-item-actions";
import { CollectionItemMenuAction } from "@/features/collections/components/collection-item-menu-action";
import { formatPoemDate } from "@/features/posts/formatters";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import {
  getOwnCollection,
  listCollectionPickerPoems,
  listOwnCollectionItems,
} from "@/server/services/collections";
import {
  collectionIdSchema,
  collectionPageSchema,
} from "@/server/validation/collections";

export const metadata: Metadata = { title: "编辑特辑" };

function pageHref(id: string, itemsPage: number, pickerPage: number): string {
  const params = new URLSearchParams();
  if (itemsPage > 1) params.set("itemsPage", String(itemsPage));
  if (pickerPage > 1) params.set("pickerPage", String(pickerPage));
  const query = params.toString();
  return `/account/collections/${id}/edit${query ? `?${query}` : ""}`;
}

export default async function EditCollectionPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const session = await requireCurrentUser("/account/collections");
  const currentUser = await getAuthoritativeUser(session.id);
  const suspended = currentUser?.status === "suspended";
  const { id } = await params;
  const parsedId = collectionIdSchema.safeParse(id);
  const query = await searchParams;
  const itemsPage = collectionPageSchema.safeParse(query.itemsPage);
  const pickerPage = collectionPageSchema.safeParse(query.pickerPage);
  if (!parsedId.success || !itemsPage.success || !pickerPage.success) notFound();
  const collection = await getOwnCollection(parsedId.data, session.id);
  if (!collection) notFound();
  const [items, picker] = await Promise.all([
    listOwnCollectionItems(parsedId.data, session.id, itemsPage.data),
    suspended
      ? Promise.resolve(null)
      : listCollectionPickerPoems(parsedId.data, session.id, pickerPage.data),
  ]);
  if (!items) notFound();
  if (
    (items.total > 0 && items.page > items.pageCount) ||
    (picker && picker.total > 0 && picker.page > picker.pageCount)
  ) notFound();
  const notice =
    query.created === "1" ? "特辑草稿已创建，现在可以收录诗作。" :
    query.saved === "1" ? "特辑信息已保存。" :
    query.published === "1" ? "特辑已发布，但管理员隐藏仍然有效。" :
    query.withdrawn === "1" ? "特辑已撤回，回到草稿状态。" : null;

  return (
    <PageContainer>
      <PageHeader eyebrow="我的作品" title={suspended ? "查看特辑" : "编辑特辑"} />
      <AccountSectionNavigation />
      <dl className="mt-6 flex flex-wrap items-center gap-3 text-label">
        <Badge variant={collection.status === "published" ? "success" : "warning"}>
          {collection.status === "published" ? "已发布" : "草稿"}
        </Badge>
        <Badge variant="neutral">{collection.visibility === "public" ? "公开" : "仅成员可见"}</Badge>
        {collection.moderationStatus === "hidden" ? <Badge variant="danger">管理员已隐藏</Badge> : null}
        <span className="text-subtle">更新于 {formatPoemDate(collection.updatedAt)}</span>
      </dl>
      {collection.moderationStatus === "hidden" ? (
        <Alert variant="danger" className="mt-6">
          <AlertDescription>
            该特辑不会出现在公开页面。{collection.moderationReason ? `原因：${collection.moderationReason}` : ""}
          </AlertDescription>
        </Alert>
      ) : null}
      {suspended ? (
        <Alert variant="danger" className="mt-6"><AlertDescription>账号被禁用期间只能查看特辑。</AlertDescription></Alert>
      ) : null}
      {notice ? (
        <Alert variant="success" role="status" className="mt-6"><AlertDescription>{notice}</AlertDescription></Alert>
      ) : null}

      {suspended ? (
        <Section title={collection.title} description={collection.description ?? "暂无简介"} className="pb-0" >
          <p className="text-body text-subtle">当前共保存 {items.total} 条收录记录。</p>
        </Section>
      ) : (
        <div className="mt-8">
          <CollectionForm
            action={updateCollectionAction.bind(null, collection.id)}
            submitLabel="保存修改"
            canPublish={collection.status === "draft"}
            initialValues={{
              title: collection.title,
              description: collection.description ?? undefined,
              visibility: collection.visibility,
            }}
          />
        </div>
      )}

      {!suspended ? (
        <Section
          title="发布状态"
          description="发布至少需要一篇当前可读的作品；撤回后可继续编辑并重新发布。"
          className="pb-0"
        >
          <CollectionActions
            id={collection.id}
            status={collection.status}
            publishedAt={collection.publishedAt}
            moderationStatus={collection.moderationStatus}
            availableItemCount={collection.availableItemCount}
            showPublish={false}
          />
        </Section>
      ) : null}

      <Section
        title="已收录作品"
        description="公开读取会自动跳过撤回、隐藏或访问范围不兼容的作品。"
        className="pb-0"
      >
        {items.items.length ? (
          <div className="divide-y divide-border-subtle border-y border-border-subtle">
            {items.items.map((item) => (
              <article key={item.poemId} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <h3 className="break-words font-serif text-body-lg text-foreground">
                    {item.available ? `《${item.title}》` : "作品当前不可用"}
                  </h3>
                  <p className="mt-1 text-label text-subtle">
                    {item.available ? item.authorName : "标题和作者不会显示在公开目录中"}
                  </p>
                </div>
                {!suspended ? (
                  <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                    <CollectionItemAction action={moveCollectionItemAction.bind(null, collection.id, item.poemId, "up")} label="上移" busyLabel="移动中…" variant="ghost" />
                    <CollectionItemAction action={moveCollectionItemAction.bind(null, collection.id, item.poemId, "down")} label="下移" busyLabel="移动中…" variant="ghost" />
                    <CollectionItemMenuAction action={removeCollectionItemAction.bind(null, collection.id, item.poemId)} title={item.title ?? "不可用作品"} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : <p className="text-body text-subtle">尚未收录作品。</p>}
        <PaginationNavigation
          page={items.page}
          pageCount={items.pageCount}
          previousHref={items.page > 1 ? pageHref(collection.id, items.page - 1, picker?.page ?? 1) : null}
          nextHref={items.page < items.pageCount ? pageHref(collection.id, items.page + 1, picker?.page ?? 1) : null}
          ariaLabel="已收录作品分页"
        />
      </Section>

      {!suspended && picker ? (
        <Section title="添加作品" description="这里只显示当前可以加入此特辑的已发布诗作。" className="pb-0">
          {picker.items.length ? (
            <div className="divide-y divide-border-subtle border-y border-border-subtle">
              {picker.items.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <h3 className="font-serif text-body-lg text-foreground">《{item.title}》</h3>
                    <p className="mt-1 text-label text-subtle">{item.authorName} · {item.visibility === "public" ? "公开" : "仅成员可见"}</p>
                  </div>
                  <CollectionItemAction action={addCollectionItemAction.bind(null, collection.id, item.id)} label="加入特辑" busyLabel="加入中…" />
                </article>
              ))}
            </div>
          ) : <p className="text-body text-subtle">没有更多可添加的诗作。</p>}
          <PaginationNavigation
            page={picker.page}
            pageCount={picker.pageCount}
            previousHref={picker.page > 1 ? pageHref(collection.id, items.page, picker.page - 1) : null}
            nextHref={picker.page < picker.pageCount ? pageHref(collection.id, items.page, picker.page + 1) : null}
            ariaLabel="可添加作品分页"
          />
        </Section>
      ) : null}

      <p className="pb-8 text-label text-subtle">
        <Link href="/account/collections" className="underline underline-offset-4">返回我的特辑</Link>
      </p>
    </PageContainer>
  );
}
