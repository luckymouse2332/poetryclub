import { randomUUID } from "node:crypto";

import nextEnv from "@next/env";
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";

nextEnv.loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.INITIAL_ADMIN_NAME?.trim();
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  throw new Error("INITIAL_ADMIN_EMAIL must be a valid email address");
}

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });

try {
  const result = await sql.begin(async (tx) => {
    const guard = await tx`
      select id from admin_guard where id = 1 for update
    `;
    if (!guard[0]) throw new Error("admin_guard is missing; run migrations first");

    const users = await tx`
      select id, role, status from "user" where lower(email) = ${email} limit 1 for update
    `;
    let target = users[0];
    let created = false;

    if (!target) {
      if (!name) {
        throw new Error(
          "INITIAL_ADMIN_NAME is required when the account does not exist",
        );
      }
      if (!password || password.length < 8 || password.length > 128) {
        throw new Error(
          "INITIAL_ADMIN_PASSWORD must contain between 8 and 128 characters when the account does not exist",
        );
      }

      const userId = randomUUID();
      const now = new Date();
      const passwordHash = await hashPassword(password);
      await tx`
        insert into "user" (
          id, name, email, email_verified, created_at, updated_at, role, status
        ) values (
          ${userId}, ${name}, ${email}, false, ${now}, ${now}, 'member', 'active'
        )
      `;
      await tx`
        insert into account (
          id, account_id, provider_id, user_id, password, created_at, updated_at
        ) values (
          ${randomUUID()}, ${userId}, 'credential', ${userId}, ${passwordHash}, ${now}, ${now}
        )
      `;
      target = { id: userId, role: "member", status: "active" };
      created = true;
    }

    if (target.status !== "active") {
      throw new Error("The bootstrap target is suspended; restore it through another administrator");
    }
    if (target.role === "admin") return { changed: false, created: false };

    await tx`
      update "user" set role = 'admin', updated_at = now() where id = ${target.id}
    `;
    await tx`
      insert into admin_audit_log (
        id, admin_id, action, target_type, target_id, reason, metadata
      ) values (
        ${randomUUID()}, ${target.id}, 'user_promoted', 'user', ${target.id},
        '首个管理员初始化',
        ${tx.json({ source: "bootstrap-cli", accountCreated: created })}
      )
    `;
    return { changed: true, created };
  });

  if (result.changed) {
    console.log(
      result.created
        ? "Initial administrator account created and promoted."
        : "Existing account promoted to administrator.",
    );
  } else {
    console.log("Initial administrator already exists; no changes made.");
  }
} finally {
  await sql.end();
}
