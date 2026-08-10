import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("@/server/services/notifications/realtime", () => ({
  publishNotificationRealtime: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/server/db";
import {
  createNotificationInTransaction,
  createAnnouncementDraft,
  getUnreadNotificationCount,
  openUserAnnouncement,
  publishAnnouncement,
} from "@/server/services/notifications";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const userIds: string[] = [];
const announcementIds: string[] = [];
const auditTargetIds: string[] = [];

async function createUser(input: {
  role: "member" | "admin";
  status: "active" | "suspended";
}): Promise<string> {
  const id = randomUUID();
  userIds.push(id);
  const suspended = input.status === "suspended";
  await sql`
    insert into "user" (
      id, name, email, email_verified, created_at, updated_at, role, status,
      suspension_reason, suspended_at
    ) values (
      ${id}, ${`通知集成测试-${id.slice(0, 8)}`}, ${`${id}@example.test`}, false,
      now(), now(), ${input.role}, ${input.status},
      ${suspended ? "集成测试禁用" : null}, ${suspended ? new Date() : null}
    )
  `;
  return id;
}

afterAll(async () => {
  if (announcementIds.length > 0) {
    await sql`delete from announcement where id in ${sql(announcementIds)}`;
  }
  if (auditTargetIds.length > 0) {
    await sql`delete from admin_audit_log where target_id in ${sql(auditTargetIds)}`;
  }
  if (userIds.length > 0) {
    await sql`delete from "user" where id in ${sql(userIds)}`;
  }
  await sql.end();
});

describe("notifications and announcements", () => {
  it("publishes an immutable audience snapshot including suspended accounts", async () => {
    const adminId = await createUser({ role: "admin", status: "active" });
    const memberId = await createUser({ role: "member", status: "active" });
    const suspendedId = await createUser({ role: "member", status: "suspended" });

    const announcementId = await createAnnouncementDraft(adminId, {
      title: "集成测试公告",
      body: "公告正文",
      href: "/notifications",
      audience: "all_accounts",
    });
    announcementIds.push(announcementId);
    auditTargetIds.push(announcementId);

    await publishAnnouncement(adminId, announcementId);

    const rows = await sql`
      select a.status, a.notification_id, nr.user_id
      from announcement a
      join notification_recipient nr on nr.notification_id = a.notification_id
      where a.id = ${announcementId}
        and nr.user_id in ${sql([adminId, memberId, suspendedId])}
      order by nr.user_id
    `;
    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.user_id)).toEqual(
      expect.arrayContaining([adminId, memberId, suspendedId]),
    );
    expect(rows[0]?.status).toBe("published");
    expect(rows[0]?.notification_id).toBeTruthy();
    expect(await getUnreadNotificationCount(suspendedId)).toBe(1);

    const opened = await openUserAnnouncement(suspendedId, announcementId);
    expect(opened).toMatchObject({
      id: announcementId,
      title: "集成测试公告",
      body: "公告正文",
      href: "/notifications",
    });
    expect(await getUnreadNotificationCount(suspendedId)).toBe(0);
  });

  it("authorizes announcement details from the published recipient snapshot", async () => {
    const adminId = await createUser({ role: "admin", status: "active" });
    const recipientId = await createUser({ role: "member", status: "active" });
    const outsiderId = await createUser({ role: "admin", status: "active" });

    const announcementId = await createAnnouncementDraft(adminId, {
      title: "成员公告访问测试",
      body: "只有收件人可以看到这段正文。",
      href: null,
      audience: "active_members",
    });
    announcementIds.push(announcementId);
    auditTargetIds.push(announcementId);

    await publishAnnouncement(adminId, announcementId);

    await expect(openUserAnnouncement(recipientId, announcementId)).resolves.toMatchObject({
      id: announcementId,
      body: "只有收件人可以看到这段正文。",
    });
    await expect(openUserAnnouncement(outsiderId, announcementId)).resolves.toBeNull();
  });

  it("does not duplicate an event or recipient for the same dedupe key", async () => {
    const recipientId = await createUser({ role: "member", status: "active" });
    const dedupeKey = `integration-dedupe:${randomUUID()}`;

    await db.transaction(async (tx) => {
      await createNotificationInTransaction(tx, {
        type: "reaction.liked",
        title: "重复事件测试",
        body: "正文",
        dedupeKey,
        recipientIds: [recipientId],
      });
      await createNotificationInTransaction(tx, {
        type: "reaction.liked",
        title: "重复事件测试",
        body: "正文",
        dedupeKey,
        recipientIds: [recipientId],
      });
    });

    const rows = await sql`
      select n.id, nr.user_id
      from notification n
      join notification_recipient nr on nr.notification_id = n.id
      where n.dedupe_key = ${dedupeKey}
    `;
    expect(rows).toHaveLength(1);
  });
});
