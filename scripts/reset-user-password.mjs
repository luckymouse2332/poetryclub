import { randomUUID } from "node:crypto";

import nextEnv from "@next/env";
import { hashPassword } from "better-auth/crypto";
import postgres from "postgres";
import { z } from "zod";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../src/lib/password-policy.mjs";

nextEnv.loadEnvConfig(process.cwd());

const inputSchema = z.object({
  databaseUrl: z.string().regex(/^postgres(?:ql)?:\/\//),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH),
});

const parsed = inputSchema.safeParse({
  databaseUrl: process.env.DATABASE_URL,
  email: process.env.RESET_USER_EMAIL,
  password: process.env.RESET_USER_PASSWORD,
});

if (!parsed.success) {
  const fields = Object.keys(z.flattenError(parsed.error).fieldErrors).join(", ");
  throw new Error(`Invalid account recovery environment variables: ${fields}`);
}

const { databaseUrl, email, password } = parsed.data;
const passwordHash = await hashPassword(password);
const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });

try {
  await sql.begin(async (tx) => {
    const users = await tx`
      select id from "user"
      where lower(email) = ${email}
      for update
    `;
    if (users.length === 0) throw new Error("No user exists for the supplied email");
    if (users.length !== 1) {
      throw new Error("Multiple users matched the supplied email; recovery aborted");
    }

    const userId = String(users[0].id);
    const accounts = await tx`
      select id from account
      where user_id = ${userId} and provider_id = 'credential'
      for update
    `;
    if (accounts.length === 0) {
      throw new Error("The user has no credential account; recovery aborted");
    }
    if (accounts.length !== 1) {
      throw new Error("Multiple credential accounts found; recovery aborted");
    }

    const updated = await tx`
      update account
      set password = ${passwordHash}, updated_at = now()
      where id = ${accounts[0].id}
      returning id
    `;
    if (updated.length !== 1) {
      throw new Error("Credential update did not affect exactly one account");
    }

    await tx`delete from session where user_id = ${userId}`;

    // break-glass 恢复与密码更新同事务写入只读审计：admin_id 记录恢复对象
    // 本身，来源通过 metadata 标明为服务器终端 CLI，与 bootstrap-admin 对称。
    await tx`
      insert into admin_audit_log (
        id, admin_id, action, target_type, target_id, reason, metadata
      ) values (
        ${randomUUID()}, ${userId}, 'user_password_recovered', 'user', ${userId},
        '服务器终端紧急密码恢复',
        ${tx.json({ source: "password-recovery-cli" })}
      )
    `;
  });

  console.log(
    "Account password recovered and all existing sessions revoked; recovery recorded in the audit log.",
  );
} finally {
  await sql.end();
}
