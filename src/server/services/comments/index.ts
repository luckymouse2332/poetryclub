import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { poem, poemComment, user } from "@/server/db/schema";
import type { DatabaseTransaction } from "@/server/db/types";
import { requireAdminMutation } from "@/server/policies/admin-mutation";
import { writeAdminAudit } from "@/server/services/admin-audit";
import { checkCommentPublishRateLimit } from "./rate-limit";
import { createNotificationInTransaction, publishNotificationDispatch, type NotificationDispatch } from "@/server/services/notifications";
import type { CreateCommentInput } from "@/server/validation/comments";
import { CommentError, type CommentModerationStatus } from "./types";
export * from "./types";
export * from "./queries";

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
        .limit(1)
        .for("update");
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
        .set({ lastActivityAt: sql`greatest(${poemComment.lastActivityAt}, (select created_at from poem_comment where id = ${inserted[0].id}))` })
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

/** Lock the root before any child write or activity aggregate. */
async function lockCommentThread(tx: DatabaseTransaction, commentId: string): Promise<void> {
  const [target] = await tx.select({ rootId: poemComment.rootId }).from(poemComment)
    .where(eq(poemComment.id, commentId)).limit(1);
  if (!target) throw new CommentError("not_found");
  await tx.select({ id: poemComment.id }).from(poemComment)
    .where(eq(poemComment.id, target.rootId)).for("update");
}

async function recomputeThreadActivity(tx: DatabaseTransaction, rootId: string): Promise<void> {
  // Keep timestamp arithmetic in PostgreSQL, without a host-timezone round trip.
  await tx.update(poemComment).set({ lastActivityAt: sql`(
    select coalesce(max(c.created_at) filter (where c.deleted_at is null and c.moderation_status='visible'), min(c.created_at))
    from poem_comment c where c.root_id = ${rootId}
  )` }).where(eq(poemComment.id, rootId));
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
    await lockCommentThread(tx, commentId);
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

async function moderateComment(
  adminId: string,
  targetId: string,
  reason: string,
  hidden: boolean,
): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    await requireAdminMutation(tx, adminId);
    await lockCommentThread(tx, targetId);
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
