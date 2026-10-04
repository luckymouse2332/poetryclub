import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, expect, it, vi } from "vitest";

import { createDraft, deleteOwnDraft, publishOwnDraft, updateOwnPoem, withdrawOwnPublishedPoem } from "@/server/services/poems";
import { addPoemToCollection, createCollectionDraft, deleteOwnCollectionDraft, movePoemInCollection, publishOwnCollection, removePoemFromCollection, updateOwnCollection, withdrawOwnCollection } from "@/server/services/collections";

const sql = postgres(process.env.DATABASE_URL!, { max: 3 });
const users: string[] = [];
const poemInput = { title: "writer authority", body: "body", context: null, occurredAt: null, visibility: "public" as const };
const collectionInput = { title: "writer authority", description: "body", visibility: "public" as const };

async function account() {
  const id = randomUUID();
  users.push(id);
  await sql`insert into "user" (id,name,email,email_verified,role,status,created_at,updated_at)
    values (${id},'writer test',${`${id}@example.test`},true,'member','active',now(),now())`;
  return id;
}

afterAll(async () => {
  if (users.length) {
    await sql`delete from poem_collection where owner_id in ${sql(users)}`;
    await sql`delete from poem where author_id in ${sql(users)}`;
    await sql`delete from "user" where id in ${sql(users)}`;
  }
  await sql.end();
});

it("rejects every direct poem and collection write by a suspended owner", async () => {
  const owner = await account();
  const poem = await createDraft(owner, randomUUID(), poemInput);
  const collection = await createCollectionDraft(owner, randomUUID(), collectionInput);
  await sql`update "user" set status='suspended', suspension_reason='authority test', suspended_at=now() where id=${owner}`;
  const writes = [
    () => createDraft(owner, randomUUID(), poemInput),
    () => updateOwnPoem(poem, owner, poemInput),
    () => publishOwnDraft(poem, owner),
    () => withdrawOwnPublishedPoem(poem, owner),
    () => deleteOwnDraft(poem, owner),
    () => createCollectionDraft(owner, randomUUID(), collectionInput),
    () => updateOwnCollection(collection, owner, collectionInput),
    () => addPoemToCollection(collection, poem, owner),
    () => removePoemFromCollection(collection, poem, owner),
    () => movePoemInCollection(collection, poem, owner, "up"),
    () => publishOwnCollection(collection, owner),
    () => withdrawOwnCollection(collection, owner),
    () => deleteOwnCollectionDraft(collection, owner),
  ];
  for (const write of writes) {
    await expect(write()).rejects.toMatchObject({ code: "account_suspended" });
  }
  expect((await sql`select status from poem where id=${poem}`)[0]?.status).toBe("draft");
});

it("rechecks writer status after waiting for a concurrent suspension", async () => {
  const owner = await account();
  const poem = await createDraft(owner, randomUUID(), poemInput);
  let pending!: Promise<unknown>;
  await sql.begin(async (tx) => {
    await tx`select id from "user" where id=${owner} for update`;
    pending = updateOwnPoem(poem, owner, { ...poemInput, title: "must not persist" }).catch((error: unknown) => error);
    await vi.waitFor(async () => {
      await tx`select pg_stat_clear_snapshot()`;
      const waiting = await tx`select 1 from pg_stat_activity where datname=current_database()
        and wait_event_type='Lock' and query like '%user%' and pid<>pg_backend_pid()`;
      expect(waiting.length).toBeGreaterThan(0);
    });
    await tx`update "user" set status='suspended', suspension_reason='authority test', suspended_at=now() where id=${owner}`;
  });
  expect(await pending).toMatchObject({ code: "account_suspended" });
  expect((await sql`select title from poem where id=${poem}`)[0]?.title).toBe(poemInput.title);
});

it("keeps writer authority stable until an already authorized content write commits", async () => {
  const owner = await account();
  const poem = await createDraft(owner, randomUUID(), poemInput);
  let writing!: Promise<unknown>;
  let suspending!: Promise<unknown>;
  await sql.begin(async (tx) => {
    await tx`select id from poem where id=${poem} for update`;
    writing = updateOwnPoem(poem, owner, { ...poemInput, title: "authorized before suspension" });
    await vi.waitFor(async () => {
      await tx`select pg_stat_clear_snapshot()`;
      expect(await tx`select 1 from pg_stat_activity where datname=current_database()
        and wait_event_type='Lock' and query like '%update%poem%' and pid<>pg_backend_pid()`).not.toHaveLength(0);
    });
    suspending = sql`update "user" set status='suspended', suspension_reason='authority test', suspended_at=now() where id=${owner}`.execute();
    await vi.waitFor(async () => {
      await tx`select pg_stat_clear_snapshot()`;
      expect(await tx`select 1 from pg_stat_activity where datname=current_database()
        and wait_event_type='Lock' and query like '%update%user%' and pid<>pg_backend_pid()`).not.toHaveLength(0);
    });
  });
  await writing;
  await suspending;
  expect((await sql`select title from poem where id=${poem}`)[0]?.title).toBe("authorized before suspension");
  expect((await sql`select status from "user" where id=${owner}`)[0]?.status).toBe("suspended");
});
