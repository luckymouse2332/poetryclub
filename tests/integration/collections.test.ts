import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("@/server/services/notifications/realtime", () => ({
  publishNotificationRealtime: vi.fn().mockResolvedValue(undefined),
}));

import {
  addPoemToCollection,
  CollectionMutationError,
  createCollectionDraft,
  getOwnCollection,
  getCollectionReadingItem,
  getPublishedCollectionAccess,
  listOwnCollections,
  listPublishedCollectionItems,
  movePoemInCollection,
  publishOwnCollection,
  setCollectionHidden,
  updateOwnCollection,
} from "@/server/services/collections";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const userIds: string[] = [];
const poemIds: string[] = [];
const collectionIds: string[] = [];

async function createUser(role: "member" | "admin" = "member"): Promise<string> {
  const id = randomUUID();
  userIds.push(id);
  await sql`
    insert into "user" (
      id, name, email, email_verified, created_at, updated_at, role, status
    ) values (
      ${id}, ${`特辑测试-${id.slice(0, 8)}`}, ${`${id}@example.test`}, false,
      now(), now(), ${role}, 'active'
    )
  `;
  return id;
}

async function createPublishedPoem(
  authorId: string,
  title: string,
  visibility: "public" | "members_only" = "public",
): Promise<string> {
  const id = randomUUID();
  poemIds.push(id);
  await sql`
    insert into poem (
      id, title, body, author_id, status, published_at, creation_token,
      moderation_status, visibility
    ) values (
      ${id}, ${title}, ${`${title}正文`}, ${authorId}, 'published', now(),
      ${randomUUID()}, 'visible', ${visibility}
    )
  `;
  return id;
}

async function createDraftCollection(
  ownerId: string,
  visibility: "public" | "members_only" = "public",
): Promise<string> {
  const id = await createCollectionDraft(ownerId, randomUUID(), {
    title: `集成测试特辑-${randomUUID().slice(0, 8)}`,
    description: "只保存纯文本简介",
    visibility,
  });
  collectionIds.push(id);
  return id;
}

afterAll(async () => {
  if (collectionIds.length) {
    await sql`delete from notification where target_type = 'collection' and target_id in ${sql(collectionIds)}`;
    await sql`delete from admin_audit_log where target_type = 'collection' and target_id in ${sql(collectionIds)}`;
    await sql`delete from poem_collection where id in ${sql(collectionIds)}`;
  }
  if (poemIds.length) await sql`delete from poem where id in ${sql(poemIds)}`;
  if (userIds.length) await sql`delete from "user" where id in ${sql(userIds)}`;
  await sql.end();
});

describe("curated collections", () => {
  it("creates idempotent drafts and requires an eligible item before publishing", async () => {
    const ownerId = await createUser();
    const token = randomUUID();
    const first = await createCollectionDraft(ownerId, token, {
      title: "幂等特辑",
      description: null,
      visibility: "public",
    });
    collectionIds.push(first);
    const repeated = await createCollectionDraft(ownerId, token, {
      title: "不会覆盖第一次提交",
      description: "不同内容",
      visibility: "members_only",
    });
    expect(repeated).toBe(first);
    await expect(publishOwnCollection(first, ownerId)).rejects.toMatchObject({
      code: "empty_collection",
    });
    expect((await getOwnCollection(first, ownerId))?.availableItemCount).toBe(0);

    const otherAuthorId = await createUser();
    const poemId = await createPublishedPoem(otherAuthorId, "他人的公开诗作");
    await addPoemToCollection(first, poemId, ownerId);
    expect((await getOwnCollection(first, ownerId))?.availableItemCount).toBe(1);
    expect(
      (await listOwnCollections(ownerId, 1)).items.find(
        (collection) => collection.id === first,
      )?.availableItemCount,
    ).toBe(1);
    await expect(publishOwnCollection(first, ownerId)).resolves.toMatchObject({
      moderationStatus: "visible",
    });
    const access = await getPublishedCollectionAccess(first, "anonymous");
    expect(access.kind).toBe("visible");
  });

  it("enforces collection visibility and member login boundaries", async () => {
    const ownerId = await createUser();
    const memberPoem = await createPublishedPoem(ownerId, "成员作品", "members_only");
    const publicCollection = await createDraftCollection(ownerId, "public");
    await expect(
      addPoemToCollection(publicCollection, memberPoem, ownerId),
    ).rejects.toBeInstanceOf(CollectionMutationError);

    const memberCollection = await createDraftCollection(ownerId, "members_only");
    await addPoemToCollection(memberCollection, memberPoem, ownerId);
    await publishOwnCollection(memberCollection, ownerId);
    await expect(
      updateOwnCollection(memberCollection, ownerId, {
        title: "不能直接改为公开",
        description: null,
        visibility: "public",
      }),
    ).rejects.toMatchObject({ code: "visibility_conflict" });
    expect((await getPublishedCollectionAccess(memberCollection, "anonymous")).kind).toBe(
      "login_required",
    );
    expect((await getPublishedCollectionAccess(memberCollection, "active_member")).kind).toBe(
      "visible",
    );
    expect((await getPublishedCollectionAccess(memberCollection, "suspended")).kind).toBe(
      "not_found",
    );
  });

  it("keeps ordered pagination and skips withdrawn items in reading neighbors", async () => {
    const ownerId = await createUser();
    const collectionId = await createDraftCollection(ownerId);
    const ids: string[] = [];
    for (let index = 1; index <= 13; index += 1) {
      const poemId = await createPublishedPoem(ownerId, `目录作品 ${index}`);
      ids.push(poemId);
      await addPoemToCollection(collectionId, poemId, ownerId);
    }
    await movePoemInCollection(collectionId, ids[2]!, ownerId, "up");
    await publishOwnCollection(collectionId, ownerId);

    const firstPage = await listPublishedCollectionItems(
      collectionId,
      1,
      "anonymous",
    );
    const secondPage = await listPublishedCollectionItems(
      collectionId,
      2,
      "anonymous",
    );
    expect(firstPage.kind).toBe("visible");
    expect(secondPage.kind).toBe("visible");
    if (firstPage.kind !== "visible" || secondPage.kind !== "visible") return;
    expect(firstPage.directory.items).toHaveLength(12);
    expect(secondPage.directory.items).toHaveLength(1);
    expect(firstPage.directory.items.slice(0, 3).map((item) => item.poemId)).toEqual([
      ids[0],
      ids[2],
      ids[1],
    ]);

    await sql`update poem set status = 'draft' where id = ${ids[2]!}`;
    const reading = await getCollectionReadingItem(
      collectionId,
      ids[0]!,
      "anonymous",
    );
    expect(reading.kind).toBe("visible");
    if (reading.kind === "visible") {
      expect(reading.item.nextPoemId).toBe(ids[1]);
    }
    const filtered = await listPublishedCollectionItems(
      collectionId,
      1,
      "anonymous",
    );
    expect(filtered.kind).toBe("visible");
    if (filtered.kind === "visible") {
      expect(filtered.directory.total).toBe(12);
      expect(filtered.directory.items.map((item) => item.poemId)).not.toContain(ids[2]);
    }
  });

  it("writes collection governance, minimal notification and audit atomically", async () => {
    const ownerId = await createUser();
    const adminId = await createUser("admin");
    const collectionId = await createDraftCollection(ownerId);
    const poemId = await createPublishedPoem(ownerId, "治理作品");
    await addPoemToCollection(collectionId, poemId, ownerId);
    await publishOwnCollection(collectionId, ownerId);
    await expect(
      setCollectionHidden(adminId, collectionId, "集成测试治理", true),
    ).resolves.toBe(true);

    const rows = await sql`
      select pc.moderation_status, a.action, n.title, n.body, nr.user_id
      from poem_collection pc
      join admin_audit_log a on a.target_type = 'collection' and a.target_id = pc.id
      join notification n on n.target_type = 'collection' and n.target_id = pc.id
      join notification_recipient nr on nr.notification_id = n.id
      where pc.id = ${collectionId} and a.action = 'collection_hidden'
    `;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      moderation_status: "hidden",
      action: "collection_hidden",
      title: "你的特辑已被隐藏",
      body: "管理员处理原因：集成测试治理",
      user_id: ownerId,
    });
    expect(JSON.stringify(rows[0])).not.toContain("治理作品");
    await expect(
      setCollectionHidden(adminId, collectionId, "复核后恢复", false),
    ).resolves.toBe(true);
  });
});
