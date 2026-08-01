import { expect, test, type Page } from "@playwright/test";

const SENSITIVE_KEYS = ["token", "accessToken", "refreshToken", "idToken", "password"];

function collectSensitiveKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectSensitiveKeys(item, `${prefix}[${index}]`),
    );
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      const found = SENSITIVE_KEYS.includes(key) ? [path] : [];
      return [...found, ...collectSensitiveKeys(nested, path)];
    });
  }

  return [];
}

function uniqueEmail(prefix: string): string {
  const nonce = `${Date.now()}${Math.floor(Math.random() * 100_000)}`;
  return `${prefix}-${nonce}@example.com`;
}

test("anonymous home navigation shows login and sign-up but no account or sign-out", async ({
  page,
}) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "注册" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "账号" })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "登出" })).toHaveCount(0);
});

test("anonymous /account is server-redirected to /login with a safe next parameter", async ({
  page,
}) => {
  // Prove the guard happens server-side and carries the fixed return path.
  const response = await page.request.get("/account", { maxRedirects: 0 });
  expect(response.status()).toBe(307);

  const location = new URL(
    response.headers()["location"] ?? "/",
    "http://playwright.test",
  );
  expect(location.pathname).toBe("/login");
  expect(location.searchParams.get("next")).toBe("/account");

  // Follow the redirect through the browser and read `next` via URLSearchParams.
  await page.goto("/account");
  await page.waitForURL(/\/login/);

  const redirected = new URL(page.url());
  expect(redirected.pathname).toBe("/login");
  expect(redirected.searchParams.get("next")).toBe("/account");
  await expect(
    page.getByRole("heading", { level: 1, name: "加入回中诗社" }),
  ).toBeVisible();
});

test("an invalid session cookie is treated as anonymous", async ({ page }) => {
  await page.goto("/");
  const origin = new URL(page.url()).origin;

  await page.context().addCookies([
    {
      name: "poetryclub.session_token",
      value: "invalid-cookie-value-for-anonymous-test",
      url: origin,
    },
  ]);

  await page.goto("/account");
  await page.waitForURL(/\/login/);

  expect(new URL(page.url()).searchParams.get("next")).toBe("/account");
});

test.describe.serial("authenticated session loop", () => {
  let page: Page;
  let sessionTokenValue: string;

  const password = "password123";
  const displayName = `诗社测试${Math.floor(Math.random() * 100_000)}`;
  const email = uniqueEmail("poetryclub-e2e");

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test("registers via the UI, signs in, and reaches the protected account page", async () => {
    // Register through the real UI (mode=sign-up).
    await page.goto("/login?mode=sign-up&next=/account");
    await page.getByLabel("昵称").fill(displayName);
    await page.getByLabel("邮箱").fill(email);
    await page.getByLabel("密码").fill(password);
    await page.getByRole("button", { name: "创建账号" }).click();
    await expect(
      page.getByText("注册请求已完成，请使用邮箱和密码登录。"),
    ).toBeVisible();

    // Sign in explicitly through the same form, capturing the API response.
    const signInResponsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/auth/sign-in/email",
    );
    await page.getByLabel("邮箱").fill(email);
    await page.getByLabel("密码").fill(password);
    await page.getByRole("button", { name: "登录", exact: true }).click();
    const signInResponse = await signInResponsePromise;

    await page.waitForURL(/\/account$/);

    // The sign-in API response must not expose any sensitive key.
    expect(signInResponse.status()).toBe(200);
    const signInBody = await signInResponse.json();
    expect(collectSensitiveKeys(signInBody)).toEqual([]);

    // The session cookie must be HttpOnly, i.e. not browser-readable.
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (cookie) => cookie.name === "poetryclub.session_token",
    );
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.httpOnly).toBe(true);
    sessionTokenValue = sessionCookie!.value;
    expect(await page.evaluate(() => document.cookie)).not.toContain(
      sessionTokenValue,
    );

    // Navigation reflects the authenticated state.
    const nav = page.getByRole("navigation");
    await expect(nav.getByText(displayName)).toBeVisible();
    await expect(nav.getByRole("link", { name: "账号" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "登出" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登录" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "注册" })).toHaveCount(0);

    // The account page shows the safe profile fields.
    await expect(
      page.getByRole("heading", { level: 1, name: "账号" }),
    ).toBeVisible();
    await expect(page.getByText("显示名称")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("注册时间")).toBeVisible();
    await expect(page.getByText("已登录")).toBeVisible();

    const accountText = await page.locator("main").innerText();
    expect(accountText).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);

    // The raw session token string must not appear in the account HTML.
    expect(await page.content()).not.toContain(sessionTokenValue);
  });

  test("logs out via the UI; repeated sign-out API calls stay stable; stale cookies are rejected", async () => {
    // Real logout through the navigation form.
    await page.getByRole("button", { name: "登出" }).click();
    await page.waitForURL("/");

    // Navigation returns to the anonymous state.
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "注册" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "账号" })).toHaveCount(0);
    await expect(nav.getByRole("button", { name: "登出" })).toHaveCount(0);

    // Double POST to the sign-out endpoint is stable and idempotent.
    const results = await page.evaluate(async () => {
      const call = async () => {
        const res = await fetch("/api/auth/sign-out", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        });
        return { status: res.status, body: await res.json() };
      };
      return [await call(), await call()];
    });

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ success: true });
    }

    // /account is denied after logout.
    await page.goto("/account");
    await page.waitForURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/account");

    // Replaying the old session cookie must still be denied: the server-side
    // session was already invalidated.
    await page.context().addCookies([
      {
        name: "poetryclub.session_token",
        value: sessionTokenValue,
        url: new URL(page.url()).origin,
      },
    ]);

    await page.goto("/account");
    await page.waitForURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/account");

    // The token string must not leak into the login HTML either.
    expect(await page.content()).not.toContain(sessionTokenValue);
  });
});
