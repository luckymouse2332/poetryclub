import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const rateLimitMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/services/comments/rate-limit", () => ({
  checkCommentPublishRateLimit: rateLimitMock,
}));

vi.mock("@/server/services/notifications/realtime", () => ({
  publishNotificationRealtime: vi.fn().mockResolvedValue(undefined),
}));

import {
  CommentError,
  countVisibleComments,
  createComment,
  deleteOwnComment,
  hideComment,
  listAdminComments,
  listCommentRoots,
  listThreadReplies,
  restoreComment,
  updateOwnComment,
} from "@/server/services/comments";
import type { ContentViewer } from "@/server/policies/access";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const userIds: string[] = [];
const poemIds: string[] = [];
const commentIds: string[] = [];

function viewer(
  scope: ContentViewer["scope"],
  userId: string | null,
  status: ContentViewer["status"],
  role: ContentViewer["role"] = "member",
): ContentViewer {
  return { scope, userId, status, role: userId ? role : null };
}

async function createUser(
  status: "active" | "suspended" = "active",
  role: "member" | "admin" = "member",
): Promise<string> {
  const id = randomUUID();
  userIds.push(id);
  await sql`
    insert into "user" (
      id, name, email, email_verified, created_at, updated_at, role, status,
      suspension_reason, suspended_at
    ) values (
      ${id}, ${`评论测试-${id.slice(0, 8)}`}, ${`${id}@example.test`}, false,
      now(), now(), ${role}, ${status},
      ${status === "suspended" ? "测试禁用" : null},
      ${status === "suspended" ? new Date() : null}
    )
  `;
  return id;
}

async function createPoem(
  authorId: string,
  visibility: "public" | "members_only" = "public",
): Promise<string> {
  const id = randomUUID();
  poemIds.push(id);
  await sql`
    insert into poem (
      id, title, body, author_id, status, published_at, creation_token,
      moderation_status, visibility, created_at, updated_at
    ) values (
      ${id}, ${`评论测试作品-${id.slice(0, 8)}`}, '正文', ${authorId},
      'published', now(), ${randomUUID()}, 'visible', ${visibility}, now(), now()
    )
  `;
  return id;
}

async function addComment(
  authorId: string,
  poemId: string,
  parentId: string | null,
  body: string,
  token = randomUUID(),
): Promise<string> {
  const id = await createComment(authorId, {
    poemId,
    parentId,
    body,
    creationToken: token,
  });
  if (!commentIds.includes(id)) commentIds.push(id);
  return id;
}

beforeEach(() => {
  rateLimitMock.mockReset();
  rateLimitMock.mockResolvedValue("allowed");
});

afterAll(async () => {
  if (commentIds.length > 0) {
    await sql`delete from notification where target_type = 'comment' and target_id in ${sql(commentIds)}`;
    await sql`delete from admin_audit_log where target_type = 'comment' and target_id in ${sql(commentIds)}`;
  }
  if (poemIds.length > 0) {
    await sql`delete from poem where id in ${sql(poemIds)}`;
  }
  if (userIds.length > 0) {
    await sql`delete from "user" where id in ${sql(userIds)}`;
  }
  await sql.end();
});

describe("comment creation and access", () => {
  it("creates idempotently, limits depth, and rejects cross-poem replies", async () => {
    const poemAuthor = await createUser();
    const writer = await createUser();
    const poemId = await createPoem(poemAuthor);
    const otherPoemId = await createPoem(poemAuthor);
    const token = randomUUID();

    const rootId = await addComment(writer, poemId, null, "根评论", token);
    const retryId = await addComment(writer, poemId, null, "根评论", token);
    expect(retryId).toBe(rootId);
    expect(rateLimitMock).toHaveBeenCalledTimes(1);

    await expect(
      createComment(writer, {
        poemId,
        parentId: null,
        body: "不同正文",
        creationToken: token,
      }),
    ).rejects.toMatchObject({ code: "idempotency_conflict" });

    const replyId = await addComment(writer, poemId, rootId, "一级回复");
    await expect(
      addComment(writer, poemId, replyId, "二级回复"),
    ).rejects.toMatchObject({ code: "invalid_depth" });
    await expect(
      addComment(writer, otherPoemId, rootId, "跨作品回复"),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("enforces member-only reads and suspended write rejection", async () => {
    const poemAuthor = await createUser();
    const active = await createUser();
    const suspended = await createUser("suspended");
    const poemId = await createPoem(poemAuthor, "members_only");
    await addComment(active, poemId, null, "成员评论");

    await expect(
      listCommentRoots(poemId, viewer("anonymous", null, null)),
    ).rejects.toMatchObject({ code: "login_required" });
    await expect(
      listCommentRoots(poemId, viewer("suspended", suspended, "suspended")),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(
      listCommentRoots(poemId, viewer("active_member", active, "active")),
    ).resolves.toMatchObject({ items: [{ body: "成员评论" }] });

    await expect(
      addComment(suspended, poemId, null, "不能写入"),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("rejects new comments after a poem is withdrawn", async () => {
    const poemAuthor = await createUser();
    const writer = await createUser();
    const poemId = await createPoem(poemAuthor);
    await sql`update poem set status = 'draft' where id = ${poemId}`;
    await expect(
      addComment(writer, poemId, null, "不可发布"),
    ).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("comment lifecycle, ordering, DTOs, and governance", () => {
  it("edits, soft-deletes, recounts, and recomputes activity", async () => {
    const poemAuthor = await createUser();
    const writer = await createUser();
    const poemId = await createPoem(poemAuthor);
    const rootId = await addComment(writer, poemId, null, "根评论");
    const firstReply = await addComment(writer, poemId, rootId, "较早回复");
    const secondReply = await addComment(writer, poemId, rootId, "较新回复");

    await sql`update poem_comment set created_at = now() - interval '3 minutes' where id = ${rootId}`;
    await sql`update poem_comment set created_at = now() - interval '2 minutes' where id = ${firstReply}`;
    await sql`update poem_comment set created_at = now() - interval '1 minute' where id = ${secondReply}`;
    await updateOwnComment(writer, poemId, firstReply, "修改后的回复");
    const beforeDelete = await sql`select last_activity_at from poem_comment where id = ${rootId}`;
    await deleteOwnComment(writer, poemId, secondReply);
    const afterDelete = await sql`
      select r.last_activity_at, c.created_at, c.body, c.deleted_at
      from poem_comment r join poem_comment c on c.id = ${secondReply}
      where r.id = ${rootId}
    `;
    const first = await sql`select created_at from poem_comment where id = ${firstReply}`;

    expect(beforeDelete[0]?.last_activity_at).not.toEqual(afterDelete[0]?.last_activity_at);
    expect(afterDelete[0]?.last_activity_at).toEqual(first[0]?.created_at);
    expect(afterDelete[0]?.body).toBe("");
    expect(afterDelete[0]?.deleted_at).toBeInstanceOf(Date);
    expect(await countVisibleComments(poemId)).toBe(2);

    const thread = await listThreadReplies(
      poemId,
      rootId,
      viewer("active_member", writer, "active"),
    );
    expect(thread.replies.map((reply) => reply.body)).toContain("修改后的回复");
    expect(thread.replies.find((reply) => reply.id === secondReply)).toMatchObject({
      body: null,
      placeholder: "deleted",
    });
  });

  it("hides and restores with audit, notification, safe DTOs, and recipient dedupe", async () => {
    const poemAuthor = await createUser();
    const commentAuthor = await createUser();
    const replier = await createUser();
    const admin = await createUser("active", "admin");
    const poemId = await createPoem(poemAuthor, "members_only");
    const rootId = await addComment(commentAuthor, poemId, null, "治理前原文");
    const replyId = await addComment(replier, poemId, rootId, "回复正文");

    const recipients = await sql`
      select nr.user_id
      from notification n
      join notification_recipient nr on nr.notification_id = n.id
      where n.target_type = 'comment' and n.target_id = ${replyId}
      order by nr.user_id
    `;
    expect(recipients.map((row) => row.user_id)).toEqual(
      [poemAuthor, commentAuthor].sort(),
    );

    await hideComment(admin, rootId, "不符合讨论规范");
    expect(await countVisibleComments(poemId)).toBe(1);
    const outsiderPage = await listCommentRoots(
      poemId,
      viewer("active_member", replier, "active"),
    );
    expect(outsiderPage.items[0]).toMatchObject({
      body: null,
      placeholder: "hidden",
      moderationReason: null,
    });
    expect(JSON.stringify(outsiderPage)).not.toMatch(/authorId|email|moderatedBy/);

    const ownerPage = await listCommentRoots(
      poemId,
      viewer("active_member", commentAuthor, "active"),
    );
    expect(ownerPage.items[0]).toMatchObject({
      body: "治理前原文",
      placeholder: null,
      moderationReason: "不符合讨论规范",
    });

    const audit = await sql`
      select action::text as action, reason from admin_audit_log
      where target_type = 'comment' and target_id = ${rootId}
      order by created_at
    `;
    expect(audit[0]).toMatchObject({
      action: "comment_hidden",
      reason: "不符合讨论规范",
    });
    const governanceNotification = await sql`
      select n.type, n.body, nr.user_id
      from notification n
      join notification_recipient nr on nr.notification_id = n.id
      where n.target_type = 'comment' and n.target_id = ${rootId}
        and n.type = 'moderation.comment_hidden'
    `;
    expect(governanceNotification[0]).toMatchObject({
      user_id: commentAuthor,
      type: "moderation.comment_hidden",
    });

    await restoreComment(admin, rootId, "复核后恢复");
    expect(await countVisibleComments(poemId)).toBe(2);
    const restored = await sql`
      select moderation_status, moderation_reason from poem_comment where id = ${rootId}
    `;
    expect(restored[0]).toMatchObject({
      moderation_status: "visible",
      moderation_reason: null,
    });
  });

  it("searches administrator comments with a joined total count", async () => {
    const poemAuthor = await createUser();
    const commentAuthor = await createUser();
    const poemId = await createPoem(poemAuthor);
    const uniqueBody = `管理员搜索-${randomUUID()}`;
    const commentId = await addComment(commentAuthor, poemId, null, uniqueBody);

    const page = await listAdminComments({
      page: 1,
      moderationStatus: undefined,
      q: uniqueBody,
    });

    expect(page).toMatchObject({ total: 1, page: 1, pageCount: 1 });
    expect(page.items).toEqual([
      expect.objectContaining({ id: commentId, body: uniqueBody }),
    ]);
  });

  it("returns a domain error for malformed cursors", async () => {
    const poemAuthor = await createUser();
    const poemId = await createPoem(poemAuthor);
    await expect(
      listCommentRoots(
        poemId,
        viewer("anonymous", null, null),
        "malformed",
      ),
    ).rejects.toBeInstanceOf(CommentError);
  });
});

describe("comment publish rate limiting", () => {
  it("rejects a new token while allowing an existing token retry", async () => {
    const poemAuthor = await createUser();
    const writer = await createUser();
    const poemId = await createPoem(poemAuthor);
    const existingToken = randomUUID();
    await addComment(writer, poemId, null, "首次提交", existingToken);

    rateLimitMock.mockResolvedValue("limited");
    await expect(
      createComment(writer, {
        poemId,
        parentId: null,
        body: "首次提交",
        creationToken: existingToken,
      }),
    ).resolves.toBeTruthy();
    await expect(
      addComment(writer, poemId, null, "过快的新评论"),
    ).rejects.toMatchObject({ code: "rate_limited" });
  });
});
