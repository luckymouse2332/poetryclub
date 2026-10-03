import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, isNull, lt, lte, or, sql, type SQL } from "drizzle-orm";
import { canReadMembersOnlyPoems } from "@/lib/poem-access";
import { CommentCursorError, decodeCommentCursor as decodeCursor, encodeCommentCursor } from "@/lib/comment-cursor";
import { db } from "@/server/db";
import { poem, poemComment, user } from "@/server/db/schema";
import type { ContentViewer } from "@/server/policies/access";
import { toCommentDto, type CommentDto, type CommentPresentationRow } from "./presentation";
import { CommentError, type CommentRootDto, type CursorPage, type CommentThreadResult, type AdminCommentPage } from "./types";
import { COMMENT_REPLY_PAGE_SIZE, COMMENT_REPLY_PREVIEW_SIZE, COMMENT_ROOT_PAGE_SIZE, type ModerationCommentListInput } from "@/server/validation/comments";
import { MODERATION_PAGE_SIZE } from "@/server/validation/moderation";

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

async function listReplyPreviews(rootIds: string[], viewer: ContentViewer) {
  const grouped = new Map<string, CommentDto[]>();
  if (!rootIds.length) return grouped;
  const ranked = db.select({
    ...rowSelection(),
    replyCount: sql<number>`0`.as("reply_count"),
    rank: sql<number>`row_number() over (partition by ${poemComment.rootId} order by ${poemComment.createdAt} desc, ${poemComment.id} desc)`.as("reply_rank"),
  }).from(poemComment).innerJoin(user, eq(poemComment.authorId, user.id))
    .where(and(inArray(poemComment.rootId, rootIds), sql`${poemComment.depth} > 0`)).as("ranked_replies");
  const rows = await db.select().from(ranked).where(lte(ranked.rank, COMMENT_REPLY_PREVIEW_SIZE))
    .orderBy(asc(ranked.createdAt), asc(ranked.id));
  for (const row of rows) {
    const replies = grouped.get(row.rootId) ?? [];
    replies.push(toCommentDto(row, viewer));
    grouped.set(row.rootId, replies);
  }
  return grouped;
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
  const previews = await listReplyPreviews(pageRows.map((row) => row.id), viewer);
  const items = pageRows.map((row) => ({
    ...toCommentDto(row, viewer), replies: previews.get(row.id) ?? [],
  }));
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

