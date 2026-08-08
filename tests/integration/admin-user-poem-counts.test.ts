import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";

import { listAdminUsers } from "@/server/services/moderation";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const createdUserIds: string[] = [];

async function createUserWithPoems(input: Readonly<{
  email: string;
  draftCount: number;
  publishedCount: number;
}>): Promise<void> {
  const userId = randomUUID();
  createdUserIds.push(userId);

  await sql.begin(async (tx) => {
    await tx`
      insert into "user" (
        id, name, email, email_verified, created_at, updated_at, role, status
      ) values (
        ${userId}, '作品统计集成测试', ${input.email}, false, now(), now(),
        'member', 'active'
      )
    `;

    for (let index = 0; index < input.draftCount; index += 1) {
      await tx`
        insert into poem (
          id, title, body, author_id, status, published_at, creation_token,
          moderation_status, created_at, updated_at
        ) values (
          ${randomUUID()}, '统计测试草稿', '测试正文', ${userId}, 'draft', null,
          ${randomUUID()}, 'visible', now(), now()
        )
      `;
    }

    for (let index = 0; index < input.publishedCount; index += 1) {
      await tx`
        insert into poem (
          id, title, body, author_id, status, published_at, creation_token,
          moderation_status, created_at, updated_at
        ) values (
          ${randomUUID()}, '统计测试已发布作品', '测试正文', ${userId},
          'published', now(), ${randomUUID()}, 'visible', now(), now()
        )
      `;
    }
  });
}

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await sql`delete from "user" where id in ${sql(createdUserIds)}`;
  }
  await sql.end();
});

describe("administrator user poem counts", () => {
  it("returns draft and published counts from the user's actual poems", async () => {
    const email = `poem-counts-${randomUUID()}@example.test`;
    await createUserWithPoems({ email, draftCount: 1, publishedCount: 1 });

    const result = await listAdminUsers({ page: 1, q: email });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      email,
      draftCount: 1,
      publishedCount: 1,
    });
  });

  it("keeps zero counts for a user without poems", async () => {
    const email = `poem-counts-empty-${randomUUID()}@example.test`;
    await createUserWithPoems({ email, draftCount: 0, publishedCount: 0 });

    const result = await listAdminUsers({ page: 1, q: email });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      email,
      draftCount: 0,
      publishedCount: 0,
    });
  });
});
