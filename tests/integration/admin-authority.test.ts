import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, expect, it, vi } from "vitest";

vi.mock("@/server/services/notifications/realtime", () => ({ publishNotificationRealtime: vi.fn() }));
import { setUserRole, setUserSuspended } from "@/server/services/moderation";

const sql = postgres(process.env.DATABASE_URL!, { max: 3 });
const ids: string[] = [];
async function account(role = "member") {
  const id = randomUUID();
  ids.push(id);
  await sql`insert into "user" (id,name,email,email_verified,role,status,created_at,updated_at)
    values (${id},'authority test',${`${id}@example.test`},true,${role},'active',now(),now())`;
  return id;
}
afterAll(async () => {
  if (ids.length) {
    await sql`delete from notification where actor_id in ${sql(ids)}`;
    await sql`delete from admin_audit_log where admin_id in ${sql(ids)}`;
    await sql`delete from "user" where id in ${sql(ids)}`;
  }
  await sql.end();
});

it("rejects an admin operation whose actor was demoted while waiting for the guard", async () => {
  const actor = await account("admin");
  const target = await account();
  let operation!: Promise<unknown>;
  await sql.begin(async (tx) => {
    await tx`select id from admin_guard where id=1 for update`;
    operation = setUserRole(actor, target, "queued promotion", "admin").then(
      () => "unexpected success", (error: unknown) => error,
    );
    await vi.waitFor(async () => {
      await tx`select pg_stat_clear_snapshot()`;
      const waiting = await tx`select 1 from pg_stat_activity where datname=current_database()
        and wait_event_type='Lock' and query like '%admin_guard%' and pid<>pg_backend_pid()`;
      expect(waiting.length).toBeGreaterThan(0);
    });
    await tx`update "user" set role='member' where id=${actor}`;
  });
  expect(await operation).toMatchObject({ code: "forbidden" });
  expect((await sql`select role from "user" where id=${target}`)[0]?.role).toBe("member");
  expect(await sql`select id from admin_audit_log where admin_id=${actor}`).toHaveLength(0);
  expect(await sql`select id from notification where actor_id=${actor}`).toHaveLength(0);
});

it("rejects direct service writes by a non-admin", async () => {
  const actor = await account();
  const target = await account();
  await expect(setUserSuspended(actor, target, "not authorized", true)).rejects.toMatchObject({ code: "forbidden" });
});
