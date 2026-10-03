import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { createTestInvitation } from "./helpers/database";
import { verifyTestEmail } from "./helpers/email-outbox";

test("admin navigation rechecks revoked authority and auth endpoints enforce server policy", async ({ browser, baseURL }) => {
  test.setTimeout(90_000);
  const current = await browser.newContext();
  const other = await browser.newContext();
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const email = `${randomUUID()}@example.test`;
  let password = "authority-password-123";
  try {
    const signup = await current.request.post("/api/auth/sign-up/email", {
      data: { name: "Authority regression", email, password, inviteCode: await createTestInvitation() },
    });
    expect(signup.status()).toBe(200);
    await verifyTestEmail(current.request, email);
    const signIn = async (context: typeof current) => {
      expect((await context.request.post("/api/auth/sign-in/email", { data: { email, password } })).status()).toBe(200);
    };
    await signIn(current);
    for (const flag of [undefined, false]) {
      await signIn(other);
      const newPassword = `${password}-new`;
      const response = await current.request.post("/api/auth/change-password", {
        headers: { origin: new URL(baseURL!).origin },
        data: { currentPassword: password, newPassword, ...(flag === undefined ? {} : { revokeOtherSessions: flag }) },
      });
      expect(response.status()).toBe(200);
      password = newPassword;
      expect(await (await other.request.get("/api/auth/get-session")).json()).toBeNull();
      expect(await (await current.request.get("/api/auth/get-session")).json()).not.toBeNull();
    }
    expect((await current.request.post("/api/auth/update-user", { data: { name: "unsupported" } })).status()).toBe(404);
    await sql`update "user" set role='admin' where email=${email}`;
    const page = await current.newPage();
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "管理后台", exact: true })).toBeVisible();
    await sql`update "user" set role='member' where email=${email}`;
    // A client navigation can reuse the already-authorized layout.
    await page.locator('main a[href="/admin/poems"]:visible').first().click();
    await expect(page.getByText("403", { exact: true })).toBeVisible();
    for (const path of ["/admin/audit", "/admin/invitations", "/admin/comments", "/admin/collections", "/admin/announcements"]) {
      await page.goto(path);
      await expect(page.getByText("403", { exact: true })).toBeVisible();
    }
  } finally {
    await sql`delete from "user" where email=${email}`;
    await sql.end();
    await current.close();
    await other.close();
  }
});
