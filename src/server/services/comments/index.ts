import "server-only";

import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { canReadMembersOnlyPoems } from "@/lib/poem-access";
import {
  CommentCursorError,
  decodeCommentCursor as decodeCursor,
  encodeCommentCursor,
} from "@/lib/comment-cursor";
import { db } from "@/server/db";
import { poem, poemComment, user } from "@/server/db/schema";
import type { ContentViewer } from "@/server/policies/access";
import { writeAdminAudit, type DatabaseTransaction } from "@/server/services/admin-audit";
import {
  toCommentDto,
  type CommentDto,
  type CommentPresentationRow,
} from "@/server/services/comments/presentation";
import { checkCommentPublishRateLimit } from "@/server/services/comments/rate-limit";
import {
  createNotificationInTransaction,
  publishNotificationDispatch,
  type NotificationDispatch,
} from "@/server/services/notifications";
import {
  COMMENT_REPLY_PAGE_SIZE,
  COMMENT_REPLY_PREVIEW_SIZE,
  COMMENT_ROOT_PAGE_SIZE,
  type CreateCommentInput,
  type ModerationCommentListInput,
} from "@/server/validation/comments";
import { MODERATION_PAGE_SIZE } from "@/server/validation/moderation";

type CommentModerationStatus = "visible" | "hidden";

export { toCommentDto } from "@/server/services/comments/presentation";
export type { CommentDto } from "@/server/services/comments/presentation";

export class CommentError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "login_required"
      | "forbidden"
      | "invalid_depth"
      | "invalid_transition"
      | "idempotency_conflict"
      | "rate_limited"
      | "invalid_cursor",
  ) {
    super(code);
    this.name = "CommentError";
  }
}

export type CommentRootDto = CommentDto &
  Readonly<{ replies: ReadonlyArray<CommentDto> }>;

export type CursorPage<T> = Readonly<{
  items: ReadonlyArray<T>;
  nextCursor: string | null;
}>;

export type CommentThreadResult = Readonly<{
  root: CommentDto;
  replies: ReadonlyArray<CommentDto>;
  nextCursor: string | null;
  focusId: string | null;
}>;

export type AdminCommentSummary = Readonly<{
  id: string;
  poemId: string;
  poemTitle: string;
  authorName: string;
  body: string;
  depth: number;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  moderationStatus: CommentModerationStatus;
  moderationReason: string | null;
  moderatedAt: Date | null;
}>;

export type AdminCommentPage = Readonly<{
  items: ReadonlyArray<AdminCommentSummary>;
  page: number;
  pageCount: number;
  total: number;
}>;

export function decodeCommentCursor(
  cursor: string,
  expectedKind: "root" | "reply",
): Readonly<{ at: Date; id: string }> {
  try {
    return decodeCursor(cursor, expectedKind);
  } catch (error) {
    if (!(error instanceof CommentCursorError)) throw error;
    throw new CommentError("invalid_cursor");
  }
}

async function requireReadablePoem(poemId: string, viewer: ContentViewer) {
  const rows = await db
    .select({
      id: poem.id,
      authorId: poem.authorId,
      visibility: poem.visibility,
    })
    .from(poem)
    .where(
      and(
        eq(poem.id, poemId),
        eq(poem.status, "published"),
        eq(poem.moderationStatus, "visible"),
        sql`${poem.publishedAt} is not null`,
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw new CommentError("not_found");
  if (
    row.visibility === "members_only" &&
    !canReadMembersOnlyPoems(viewer.scope)
  ) {
    throw new CommentError(
      viewer.scope === "anonymous" ? "login_required" : "not_found",
    );
  }
  return row;
}

function rowSelection() {
  return {
    id: poemComment.id,
    poemId: poemComment.poemId,
    rootId: poemComment.rootId,
    parentId: poemComment.parentId,
    depth: poemComment.depth,
    authorId: poemComment.authorId,
    authorName: user.name,
    body: poemComment.body,
    createdAt: poemComment.createdAt,
    editedAt: poemComment.editedAt,
    deletedAt: poemComment.deletedAt,
    lastActivityAt: poemComment.lastActivityAt,
    moderationStatus: poemComment.moderationStatus,
    moderationReason: poemComment.moderationReason,
    replyCount: sql<number>`(
      select count(*)::int from ${poemComment} replies
      where replies.root_id = ${poemComment.id} and replies.depth > 0
    )`,
  };
}

async function selectCommentRows(
  where: SQL,
  order: ReadonlyArray<SQL>,
  limit: number,
): Promise<CommentPresentationRow[]> {
  return db
    .select(rowSelection())
    .from(poemComment)
    .innerJoin(user, eq(poemComment.authorId, user.id))
    .where(where)
    .orderBy(...order)
    .limit(limit);
}

async function listReplyPreview(
  rootId: string,
  viewer: ContentViewer,
): Promise<ReadonlyArray<CommentDto>> {
  const rows = await selectCommentRows(
    and(eq(poemComment.rootId, rootId), sql`${poemComment.depth} > 0`)!,
    [desc(poemComment.createdAt), desc(poemComment.id)],
    COMMENT_REPLY_PREVIEW_SIZE,
  );
  return rows.reverse().map((row) => toCommentDto(row, viewer));
}

export async function listCommentRoots(
  poemId: string,
  viewer: ContentViewer,
  cursor?: string,
): Promise<CursorPage<CommentRootDto>> {
  await requireReadablePoem(poemId, viewer);
  const conditions: SQL[] = [
    eq(poemComment.poemId, poemId),
    eq(poemComment.depth, 0),
  ];
  if (cursor) {
    const decoded = decodeCommentCursor(cursor, "root");
    conditions.push(
      or(
        lt(poemComment.lastActivityAt, decoded.at),
        and(
          eq(poemComment.lastActivityAt, decoded.at),
          lt(poemComment.id, decoded.id),
        ),
      )!,
    );
  }
  const rows = await selectCommentRows(
    and(...conditions)!,
    [desc(poemComment.lastActivityAt), desc(poemComment.id)],
    COMMENT_ROOT_PAGE_SIZE + 1,
  );
  const hasMore = rows.length > COMMENT_ROOT_PAGE_SIZE;
  const pageRows = rows.slice(0, COMMENT_ROOT_PAGE_SIZE);
  const items = await Promise.all(
    pageRows.map(async (row) => ({
      ...toCommentDto(row, viewer),
      replies: await listReplyPreview(row.id, viewer),
    })),
  );
  const last = pageRows.at(-1);
  return {
    items,
    nextCursor:
      hasMore && last
        ? encodeCommentCursor("root", last.lastActivityAt, last.id)
        : null,
  };
}

async function getRootRow(
  poemId: string,
  rootId: string,
): Promise<CommentPresentationRow | null> {
  const rows = await selectCommentRows(
    and(
      eq(poemComment.id, rootId),
      eq(poemComment.poemId, poemId),
      eq(poemComment.depth, 0),
    )!,
    [asc(poemComment.id)],
    1,
  );
  return rows[0] ?? null;
}

export async function listThreadReplies(
  poemId: string,
  rootId: string,
  viewer: ContentViewer,
  options: Readonly<{ cursor?: string; focusId?: string }> = {},
): Promise<CommentThreadResult> {
  await requireReadablePoem(poemId, viewer);
  const root = await getRootRow(poemId, rootId);
  if (!root) throw new CommentError("not_found");

  const conditions: SQL[] = [
    eq(poemComment.poemId, poemId),
    eq(poemComment.rootId, rootId),
    sql`${poemComment.depth} > 0`,
  ];
  let focusId: string | null = null;
  if (options.cursor) {
    const decoded = decodeCommentCursor(options.cursor, "reply");
    conditions.push(
      or(
        lt(poemComment.createdAt, decoded.at),
        and(
          eq(poemComment.createdAt, decoded.at),
          lt(poemComment.id, decoded.id),
        ),
      )!,
    );
  } else if (options.focusId && options.focusId !== rootId) {
    const focused = await db
      .select({ id: poemComment.id, createdAt: poemComment.createdAt })
      .from(poemComment)
      .where(
        and(
          eq(poemComment.id, options.focusId),
          eq(poemComment.poemId, poemId),
          eq(poemComment.rootId, rootId),
        ),
      )
      .limit(1);
    if (!focused[0]) throw new CommentError("not_found");
    focusId = focused[0].id;
    conditions.push(
      or(
        lt(poemComment.createdAt, focused[0].createdAt),
        and(
          eq(poemComment.createdAt, focused[0].createdAt),
          sql`${poemComment.id} <= ${focused[0].id}`,
        ),
      )!,
    );
  } else if (options.focusId === rootId) {
    focusId = rootId;
  }

  const rows = await selectCommentRows(
    and(...conditions)!,
    [desc(poemComment.createdAt), desc(poemComment.id)],
    COMMENT_REPLY_PAGE_SIZE + 1,
  );
  const hasMore = rows.length > COMMENT_REPLY_PAGE_SIZE;
  const pageRows = rows.slice(0, COMMENT_REPLY_PAGE_SIZE);
  const oldest = pageRows.at(-1);
  return {
    root: toCommentDto(root, viewer),
    replies: pageRows.reverse().map((row) => toCommentDto(row, viewer)),
    nextCursor:
      hasMore && oldest
        ? encodeCommentCursor("reply", oldest.createdAt, oldest.id)
        : null,
    focusId,
  };
}

export async function countVisibleComments(poemId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(poemComment)
    .where(
      and(
        eq(poemComment.poemId, poemId),
        isNull(poemComment.deletedAt),
        eq(poemComment.moderationStatus, "visible"),
      ),
    );
  return rows[0]?.value ?? 0;
}

async function findIdempotentComment(authorId: string, creationToken: string) {
  const rows = await db
    .select({
      id: poemComment.id,
      poemId: poemComment.poemId,
      parentId: poemComment.parentId,
      body: poemComment.body,
    })
    .from(poemComment)
    .where(
      and(
        eq(poemComment.authorId, authorId),
        eq(poemComment.creationToken, creationToken),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

function assertSameIdempotentPayload(
  existing: Readonly<{
    id: string;
    poemId: string;
    parentId: string | null;
    body: string;
  }>,
  input: CreateCommentInput,
): string {
  if (
    existing.poemId !== input.poemId ||
    existing.parentId !== input.parentId ||
    existing.body !== input.body
  ) {
    throw new CommentError("idempotency_conflict");
  }
  return existing.id;
}

export async function createComment(
  authorId: string,
  input: CreateCommentInput,
): Promise<string> {
  const existing = await findIdempotentComment(authorId, input.creationToken);
  if (existing) return assertSameIdempotentPayload(existing, input);

  const rateLimit = await checkCommentPublishRateLimit(
    authorId,
    input.creationToken,
  );
  if (rateLimit === "limited") throw new CommentError("rate_limited");

  const result = await db.transaction(async (tx) => {
    const writers = await tx
      .select({ status: user.status })
      .from(user)
      .where(eq(user.id, authorId))
      .limit(1);
    if (writers[0]?.status !== "active") throw new CommentError("forbidden");

    const poems = await tx
      .select({
        id: poem.id,
        authorId: poem.authorId,
        visibility: poem.visibility,
      })
      .from(poem)
      .where(
        and(
          eq(poem.id, input.poemId),
          eq(poem.status, "published"),
          eq(poem.moderationStatus, "visible"),
          sql`${poem.publishedAt} is not null`,
        ),
      )
      .limit(1);
    const targetPoem = poems[0];
    if (!targetPoem) throw new CommentError("not_found");

    let parent:
      | Readonly<{
          id: string;
          rootId: string;
          depth: number;
          authorId: string;
          deletedAt: Date | null;
          moderationStatus: CommentModerationStatus;
        }>
      | undefined;
    if (input.parentId) {
      const parents = await tx
        .select({
          id: poemComment.id,
          rootId: poemComment.rootId,
          depth: poemComment.depth,
          authorId: poemComment.authorId,
          deletedAt: poemComment.deletedAt,
          moderationStatus: poemComment.moderationStatus,
        })
        .from(poemComment)
        .where(
          and(
            eq(poemComment.id, input.parentId),
            eq(poemComment.poemId, input.poemId),
          ),
        )
        .limit(1);
      parent = parents[0];
      if (!parent) throw new CommentError("not_found");
      if (parent.depth !== 0) throw new CommentError("invalid_depth");
      if (parent.deletedAt || parent.moderationStatus !== "visible") {
        throw new CommentError("invalid_transition");
      }
    }

    const id = randomUUID();
    const rootId = parent?.rootId ?? id;
    const depth = parent ? parent.depth + 1 : 0;
    if (depth > 1) throw new CommentError("invalid_depth");
    const inserted = await tx
      .insert(poemComment)
      .values({
        id,
        poemId: input.poemId,
        authorId,
        parentId: parent?.id ?? null,
        rootId,
        depth,
        body: input.body,
        creationToken: input.creationToken,
      })
      .onConflictDoNothing({
        target: [poemComment.authorId, poemComment.creationToken],
      })
      .returning({ id: poemComment.id, createdAt: poemComment.createdAt });

    if (!inserted[0]) {
      const duplicate = await tx
        .select({
          id: poemComment.id,
          poemId: poemComment.poemId,
          parentId: poemComment.parentId,
          body: poemComment.body,
        })
        .from(poemComment)
        .where(
          and(
            eq(poemComment.authorId, authorId),
            eq(poemComment.creationToken, input.creationToken),
          ),
        )
        .limit(1);
      if (!duplicate[0]) throw new CommentError("idempotency_conflict");
      return {
        id: assertSameIdempotentPayload(duplicate[0], input),
        dispatch: null,
      };
    }

    if (parent) {
      await tx
        .update(poemComment)
        .set({ lastActivityAt: inserted[0].createdAt })
        .where(eq(poemComment.id, rootId));
    }

    const recipientIds = [targetPoem.authorId, parent?.authorId]
      .filter((id): id is string => Boolean(id) && id !== authorId)
      .filter((id, index, values) => values.indexOf(id) === index);
    const dispatch =
      recipientIds.length === 0
        ? null
        : await createNotificationInTransaction(tx, {
            type: parent ? "comment.replied" : "comment.created",
            title: parent ? "你的评论有了新回复" : "你的作品有了新评论",
            body: parent
              ? "有成员回复了作品下的评论。"
              : "有成员在你的作品下留下了评论。",
            href: `/poems/${input.poemId}/comments/${rootId}?focus=${id}`,
            actorId: authorId,
            targetType: "comment",
            targetId: id,
            payload: { poemId: input.poemId, rootId },
            dedupeKey: `comment-created:${id}`,
            recipientIds,
          });
    return { id, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.id;
}

async function recomputeThreadActivity(
  tx: DatabaseTransaction,
  rootId: string,
): Promise<void> {
  const rows = await tx
    .select({
      value: sql<string>`coalesce(
        max(${poemComment.createdAt}) filter (
          where ${poemComment.deletedAt} is null
          and ${poemComment.moderationStatus} = 'visible'
        ),
        min(${poemComment.createdAt})
      )`,
    })
    .from(poemComment)
    .where(eq(poemComment.rootId, rootId));
  if (!rows[0]?.value) throw new CommentError("not_found");
  const lastActivityAt = poemComment.createdAt.mapFromDriverValue(
    rows[0].value,
  ) as Date;
  if (Number.isNaN(lastActivityAt.getTime())) {
    throw new CommentError("invalid_transition");
  }
  await tx
    .update(poemComment)
    .set({ lastActivityAt })
    .where(eq(poemComment.id, rootId));
}

export async function updateOwnComment(
  authorId: string,
  poemId: string,
  commentId: string,
  body: string,
): Promise<void> {
  const writablePoem = sql`exists (
    select 1 from ${poem}
    where ${poem.id} = ${poemId}
      and ${poem.status} = 'published'
      and ${poem.moderationStatus} = 'visible'
      and ${poem.publishedAt} is not null
  )`;
  const activeAuthor = sql`exists (
    select 1 from ${user}
    where ${user.id} = ${authorId} and ${user.status} = 'active'
  )`;
  const updated = await db
    .update(poemComment)
    .set({ body, editedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(poemComment.id, commentId),
        eq(poemComment.poemId, poemId),
        eq(poemComment.authorId, authorId),
        isNull(poemComment.deletedAt),
        eq(poemComment.moderationStatus, "visible"),
        writablePoem,
        activeAuthor,
      ),
    )
    .returning({ id: poemComment.id });
  if (!updated[0]) throw new CommentError("invalid_transition");
}

export async function deleteOwnComment(
  authorId: string,
  poemId: string,
  commentId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const writablePoem = sql`exists (
      select 1 from ${poem}
      where ${poem.id} = ${poemId}
        and ${poem.status} = 'published'
        and ${poem.moderationStatus} = 'visible'
        and ${poem.publishedAt} is not null
    )`;
    const activeAuthor = sql`exists (
      select 1 from ${user}
      where ${user.id} = ${authorId} and ${user.status} = 'active'
    )`;
    const deleted = await tx
      .update(poemComment)
      .set({ body: "", deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(poemComment.id, commentId),
          eq(poemComment.poemId, poemId),
          eq(poemComment.authorId, authorId),
          isNull(poemComment.deletedAt),
          eq(poemComment.moderationStatus, "visible"),
          writablePoem,
          activeAuthor,
        ),
      )
      .returning({ rootId: poemComment.rootId });
    if (!deleted[0]) throw new CommentError("invalid_transition");
    await recomputeThreadActivity(tx, deleted[0].rootId);
  });
}

export async function listAdminComments(
  input: ModerationCommentListInput,
): Promise<AdminCommentPage> {
  const conditions: SQL[] = [];
  if (input.moderationStatus) {
    conditions.push(eq(poemComment.moderationStatus, input.moderationStatus));
  }
  if (input.q) {
    const pattern = `%${input.q}%`;
    conditions.push(
      or(
        ilike(poemComment.body, pattern),
        ilike(poem.title, pattern),
        ilike(user.name, pattern),
      )!,
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * MODERATION_PAGE_SIZE;
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: poemComment.id,
        poemId: poemComment.poemId,
        poemTitle: poem.title,
        authorName: user.name,
        body: poemComment.body,
        depth: poemComment.depth,
        createdAt: poemComment.createdAt,
        editedAt: poemComment.editedAt,
        deletedAt: poemComment.deletedAt,
        moderationStatus: poemComment.moderationStatus,
        moderationReason: poemComment.moderationReason,
        moderatedAt: poemComment.moderatedAt,
      })
      .from(poemComment)
      .innerJoin(poem, eq(poemComment.poemId, poem.id))
      .innerJoin(user, eq(poemComment.authorId, user.id))
      .where(where)
      .orderBy(desc(poemComment.createdAt), desc(poemComment.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(poemComment)
      .innerJoin(poem, eq(poemComment.poemId, poem.id))
      .innerJoin(user, eq(poemComment.authorId, user.id))
      .where(where),
  ]);
  const total = totals[0]?.value ?? 0;
  return {
    items: rows,
    page: input.page,
    pageCount: Math.max(1, Math.ceil(total / MODERATION_PAGE_SIZE)),
    total,
  };
}

async function moderateComment(
  adminId: string,
  targetId: string,
  reason: string,
  hidden: boolean,
): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    const desired: CommentModerationStatus = hidden ? "hidden" : "visible";
    const previous: CommentModerationStatus = hidden ? "visible" : "hidden";
    const changed = await tx
      .update(poemComment)
      .set(
        hidden
          ? {
              moderationStatus: desired,
              moderationReason: reason,
              moderatedAt: new Date(),
              moderatedBy: adminId,
            }
          : {
              moderationStatus: desired,
              moderationReason: null,
              moderatedAt: null,
              moderatedBy: null,
            },
      )
      .where(
        and(
          eq(poemComment.id, targetId),
          eq(poemComment.moderationStatus, previous),
          isNull(poemComment.deletedAt),
        ),
      )
      .returning({
        id: poemComment.id,
        poemId: poemComment.poemId,
        authorId: poemComment.authorId,
        rootId: poemComment.rootId,
      });
    const row = changed[0];
    if (!row) {
      const current = await tx
        .select({
          deletedAt: poemComment.deletedAt,
          moderationStatus: poemComment.moderationStatus,
        })
        .from(poemComment)
        .where(eq(poemComment.id, targetId))
        .limit(1);
      if (!current[0]) throw new CommentError("not_found");
      if (current[0].deletedAt) throw new CommentError("invalid_transition");
      if (current[0].moderationStatus === desired) {
        return { changed: false, dispatch: null };
      }
      throw new CommentError("invalid_transition");
    }

    await recomputeThreadActivity(tx, row.rootId);
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action: hidden ? "comment_hidden" : "comment_restored",
      targetType: "comment",
      targetId,
      reason,
      metadata: { poemId: row.poemId, rootId: row.rootId },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type: hidden
        ? "moderation.comment_hidden"
        : "moderation.comment_restored",
      title: hidden ? "你的评论已被隐藏" : "你的评论已恢复显示",
      body: hidden
        ? `管理员处理原因：${reason}`
        : `管理员恢复说明：${reason}`,
      href: `/poems/${row.poemId}/comments/${row.rootId}?focus=${targetId}`,
      actorId: adminId,
      targetType: "comment",
      targetId,
      payload: { auditId, poemId: row.poemId, rootId: row.rootId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [row.authorId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch as NotificationDispatch | null);
  return result.changed;
}

export function hideComment(
  adminId: string,
  targetId: string,
  reason: string,
): Promise<boolean> {
  return moderateComment(adminId, targetId, reason, true);
}

export function restoreComment(
  adminId: string,
  targetId: string,
  reason: string,
): Promise<boolean> {
  return moderateComment(adminId, targetId, reason, false);
}
