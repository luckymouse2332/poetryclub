import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import { hashPassword, verifyPassword } from "better-auth/crypto";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const createdUserIds: string[] = [];

async function createCredentialFixture(input: Readonly<{
  email: string;
  password: string;
  credentialCount?: number;
}>) {
  const userId = randomUUID();
  const passwordHash = await hashPassword(input.password);
  const sessionTokens = [randomUUID(), randomUUID()];
  createdUserIds.push(userId);

  await sql.begin(async (tx) => {
    await tx`
      insert into "user" (
        id, name, email, email_verified, created_at, updated_at, role, status
      ) values (
        ${userId}, '恢复脚本集成测试', ${input.email}, false, now(), now(),
        'member', 'active'
      )
    `;
    for (let index = 0; index < (input.credentialCount ?? 1); index += 1) {
      await tx`
        insert into account (
          id, account_id, provider_id, user_id, password, created_at, updated_at
        ) values (
          ${randomUUID()}, ${userId}, 'credential', ${userId}, ${passwordHash},
          now(), now()
        )
      `;
    }
    for (const token of sessionTokens) {
      await tx`
        insert into session (
          id, expires_at, token, created_at, updated_at, user_id
        ) values (
          ${randomUUID()}, ${new Date(Date.now() + 60 * 60 * 1000)}, ${token},
          now(), now(), ${userId}
        )
      `;
    }
  });

  return { userId, sessionTokens };
}

function runRecovery(email: string, password: string) {
  return spawnSync(process.execPath, ["scripts/reset-user-password.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      RESET_USER_EMAIL: email,
      RESET_USER_PASSWORD: password,
    },
    encoding: "utf8",
  });
}

beforeAll(async () => {
  await sql`select 1`;
});

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await sql`delete from "user" where id in ${sql(createdUserIds)}`;
  }
  await sql.end();
});

describe("server-terminal password recovery", () => {
  it("updates the unique credential account and revokes all sessions atomically", async () => {
    const email = `recovery-success-${randomUUID()}@example.test`;
    const oldPassword = "old-password-123";
    const newPassword = "new-password-456";
    const fixture = await createCredentialFixture({ email, password: oldPassword });

    const result = runRecovery(email.toUpperCase(), newPassword);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("all existing sessions revoked");
    expect(`${result.stdout}${result.stderr}`).not.toContain(newPassword);

    const accounts = await sql`
      select password from account
      where user_id = ${fixture.userId} and provider_id = 'credential'
    `;
    expect(accounts).toHaveLength(1);
    const account = accounts[0];
    if (!account) throw new Error("Recovery credential account is missing");
    expect(
      await verifyPassword({ hash: String(account.password), password: newPassword }),
    ).toBe(true);
    expect(
      await verifyPassword({ hash: String(account.password), password: oldPassword }),
    ).toBe(false);

    const sessions = await sql`
      select id from session where user_id = ${fixture.userId}
    `;
    expect(sessions).toHaveLength(0);
  });

  it("aborts without changing credentials or sessions when duplicate credential rows exist", async () => {
    const email = `recovery-duplicate-${randomUUID()}@example.test`;
    const oldPassword = "duplicate-old-password";
    const attemptedPassword = "duplicate-new-password";
    const fixture = await createCredentialFixture({
      email,
      password: oldPassword,
      credentialCount: 2,
    });

    const before = await sql`
      select id, password from account
      where user_id = ${fixture.userId} and provider_id = 'credential'
      order by id
    `;
    const result = runRecovery(email, attemptedPassword);
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).not.toContain(attemptedPassword);

    const after = await sql`
      select id, password from account
      where user_id = ${fixture.userId} and provider_id = 'credential'
      order by id
    `;
    expect(after).toEqual(before);
    const sessions = await sql`
      select token from session where user_id = ${fixture.userId} order by token
    `;
    expect(sessions.map((row) => String(row.token))).toEqual(
      [...fixture.sessionTokens].sort(),
    );
  });
});
