import { createHash, randomBytes, randomUUID } from "node:crypto";

import * as nextEnv from "@next/env";
import postgres from "postgres";

import { E2E_ADMIN_EMAIL } from "../global-setup";

nextEnv.loadEnvConfig(process.cwd());

function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required for E2E fixtures");
  return value;
}

export async function createTestInvitation(
  options: Readonly<{
    maxUses?: number;
    expiresAt?: Date;
    disabled?: boolean;
  }> = {},
): Promise<string> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const admins = await sql`
      select id from "user"
      where email = ${E2E_ADMIN_EMAIL} and role = 'admin' and status = 'active'
      limit 1
    `;
    const admin = admins[0];
    if (!admin) throw new Error("E2E administrator is missing");
    const code = randomBytes(32).toString("base64url");
    const codeHash = createHash("sha256").update(code, "utf8").digest("hex");
    const disabledAt = options.disabled ? new Date() : null;
    await sql`
      insert into invitation (
        id, code_hash, created_by, max_uses, used_count, expires_at,
        disabled_at, disabled_by
      ) values (
        ${randomUUID()}, ${codeHash}, ${admin.id}, ${options.maxUses ?? 1}, 0,
        ${options.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000)},
        ${disabledAt}, ${disabledAt ? admin.id : null}
      )
    `;
    return code;
  } finally {
    await sql.end();
  }
}

export async function readInvitationByCode(code: string) {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const hash = createHash("sha256").update(code, "utf8").digest("hex");
    const rows = await sql`
      select id, code_hash, used_count, max_uses from invitation where code_hash = ${hash}
    `;
    return rows[0] ?? null;
  } finally {
    await sql.end();
  }
}

export async function countUsersByEmail(emails: ReadonlyArray<string>): Promise<number> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select count(*)::int as value from "user" where email in ${sql(emails)}
    `;
    return Number(rows[0]?.value ?? 0);
  } finally {
    await sql.end();
  }
}

export async function countAuditEntries(
  action: string,
  targetId: string,
): Promise<number> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select count(*)::int as value from admin_audit_log
      where action::text = ${action} and target_id = ${targetId}
    `;
    return Number(rows[0]?.value ?? 0);
  } finally {
    await sql.end();
  }
}

export async function countActiveAdmins(): Promise<number> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select count(*)::int as value from "user"
      where role = 'admin' and status = 'active'
    `;
    return Number(rows[0]?.value ?? 0);
  } finally {
    await sql.end();
  }
}

export async function getUserIdByEmail(email: string): Promise<string> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`select id from "user" where email = ${email} limit 1`;
    if (!rows[0]) throw new Error(`Missing E2E user: ${email}`);
    return String(rows[0].id);
  } finally {
    await sql.end();
  }
}

export async function getUserAuthorityByEmail(
  email: string,
): Promise<Readonly<{ id: string; role: string; status: string }>> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select id, role::text, status::text from "user" where email = ${email} limit 1
    `;
    if (!rows[0]) throw new Error(`Missing E2E user: ${email}`);
    return {
      id: String(rows[0].id),
      role: String(rows[0].role),
      status: String(rows[0].status),
    };
  } finally {
    await sql.end();
  }
}

export async function listOtherActiveAdmins(
  excludedEmails: ReadonlyArray<string>,
): Promise<ReadonlyArray<string>> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select email from "user"
      where role = 'admin' and status = 'active'
        and email not in ${sql(excludedEmails)}
      order by email
    `;
    return rows.map((row) => String(row.email));
  } finally {
    await sql.end();
  }
}

export async function expirePasswordResetUrl(resetUrl: string): Promise<void> {
  const url = new URL(resetUrl);
  const token = decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) ?? "");
  if (!token) throw new Error("Reset URL does not contain a token");

  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      update verification
      set expires_at = ${new Date(Date.now() - 60_000)}, updated_at = now()
      where identifier = ${`reset-password:${token}`}
      returning id
    `;
    if (rows.length !== 1) {
      throw new Error("Expected exactly one password reset verification row");
    }
  } finally {
    await sql.end();
  }
}

export async function auditContainsText(value: string): Promise<boolean> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const rows = await sql`
      select exists(
        select 1 from admin_audit_log
        where reason like ${`%${value}%`} or metadata::text like ${`%${value}%`}
      ) as value
    `;
    return Boolean(rows[0]?.value);
  } finally {
    await sql.end();
  }
}

export async function createHomePoemVisibilityFixtures(): Promise<
  Readonly<{
    visible: Readonly<{ id: string; title: string }>;
    draftTitle: string;
    withdrawnTitle: string;
    hiddenTitle: string;
    ids: ReadonlyArray<string>;
  }>
> {
  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    const admins = await sql`
      select id from "user"
      where email = ${E2E_ADMIN_EMAIL} and role = 'admin' and status = 'active'
      limit 1
    `;
    const admin = admins[0];
    if (!admin) throw new Error("E2E administrator is missing");

    const fixtureId = randomUUID();
    const visible = {
      id: randomUUID(),
      title: `首页公开诗作 ${fixtureId}`,
    };
    const draft = {
      id: randomUUID(),
      title: `首页草稿诗作 ${fixtureId}`,
    };
    const withdrawn = {
      id: randomUUID(),
      title: `首页撤回诗作 ${fixtureId}`,
    };
    const hidden = {
      id: randomUUID(),
      title: `首页隐藏诗作 ${fixtureId}`,
    };
    const publishedAt = new Date(Date.now() + 60_000);

    await sql`
      insert into poem (
        id, title, body, author_id, status, published_at, creation_token,
        moderation_status, moderation_reason, moderated_at
      ) values
        (
          ${visible.id}, ${visible.title}, '公开诗作正文', ${admin.id},
          'published', ${publishedAt}, ${randomUUID()}, 'visible', null, null
        ),
        (
          ${draft.id}, ${draft.title}, '草稿诗作正文', ${admin.id},
          'draft', null, ${randomUUID()}, 'visible', null, null
        ),
        (
          ${withdrawn.id}, ${withdrawn.title}, '撤回诗作正文', ${admin.id},
          'draft', ${publishedAt}, ${randomUUID()}, 'visible', null, null
        ),
        (
          ${hidden.id}, ${hidden.title}, '隐藏诗作正文', ${admin.id},
          'published', ${publishedAt}, ${randomUUID()}, 'hidden',
          'E2E 首页可见性测试', ${publishedAt}
        )
    `;

    return {
      visible,
      draftTitle: draft.title,
      withdrawnTitle: withdrawn.title,
      hiddenTitle: hidden.title,
      ids: [visible.id, draft.id, withdrawn.id, hidden.id],
    };
  } finally {
    await sql.end();
  }
}

export async function deletePoemsByIds(ids: ReadonlyArray<string>): Promise<void> {
  if (ids.length === 0) return;

  const sql = postgres(databaseUrl(), { max: 1 });
  try {
    await sql`delete from poem where id in ${sql(ids)}`;
  } finally {
    await sql.end();
  }
}
