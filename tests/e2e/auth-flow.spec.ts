import { expect, test, type Page } from "@playwright/test";

import { createTestInvitation } from "./helpers/database";

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

/**
 * 等待 React 接管指定节点（hydration 完成）。
 *
 * 登录/注册表单的提交完全依赖客户端 JS：hydration 之前点击提交按钮会触发浏览器
 * 原生 GET 提交，请求不会到达 authClient（密码还会被带进 URL）。真实用户不可能
 * 在页面可交互前完成填写并提交，测试因此显式等待，避免与 hydration 竞速。
 */
async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((target) => {
    const element = document.querySelector(target);
    return Boolean(
      element &&
        Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
    );
  }, selector);
}

function uniqueEmail(prefix: string): string {
  const nonce = `${Date.now()}${Math.floor(Math.random() * 100_000)}`;
  return `${prefix}-${nonce}@example.com`;
}

test("anonymous home navigation shows only implemented public entries", async ({
  page,
}) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "注册" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "账户" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "我的诗作" })).toHaveCount(0);
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
    const inviteCode = await createTestInvitation();
    // Register through the real UI (mode=sign-up).
    await page.goto("/login?mode=sign-up&next=/account");
    await waitForHydration(page, "#auth-form-panel button[type=submit]");
    await page.getByLabel("昵称").fill(displayName);
    await page.getByLabel("邮箱").fill(email);
    await page.getByLabel("密码").fill(password);
    await page.getByLabel("邀请码").fill(inviteCode);
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
    await expect(nav.getByText(displayName)).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "我的诗作" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "账户" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "登出" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登录" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "注册" })).toHaveCount(0);

    const accountLink = nav.getByRole("link", { name: "账户" });
    const logoutButton = nav.getByRole("button", { name: "登出" });
    const [accountLinkMetrics, logoutButtonMetrics] = await Promise.all([
      accountLink.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          height: element.getBoundingClientRect().height,
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily,
          fontWeight: styles.fontWeight,
          letterSpacing: styles.letterSpacing,
          lineHeight: styles.lineHeight,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
        };
      }),
      logoutButton.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          height: element.getBoundingClientRect().height,
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily,
          fontWeight: styles.fontWeight,
          letterSpacing: styles.letterSpacing,
          lineHeight: styles.lineHeight,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
        };
      }),
    ]);
    expect(accountLinkMetrics).toEqual(logoutButtonMetrics);

    const baseLogoutStyle = await logoutButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });
    await logoutButton.hover();
    await page.waitForTimeout(180);
    const hoveredLogoutStyle = await logoutButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });
    expect(hoveredLogoutStyle.backgroundColor).toBe(
      baseLogoutStyle.backgroundColor,
    );
    expect(hoveredLogoutStyle.color).not.toBe(baseLogoutStyle.color);
    await page.mouse.move(0, 0);

    const navigationList = nav.locator("ul");
    const navigationItems = navigationList.locator(":scope > li");
    const navigationControls = navigationList.locator("a, button");

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 900 },
      { width: 920, height: 900 },
      { width: 1024, height: 900 },
    ]) {
      await page.setViewportSize(viewport);

      const [listStyles, brandBox, listBox, itemBoxes, controlBoxes, pageWidth] =
        await Promise.all([
          navigationList.evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
              display: styles.display,
              gridTemplateColumns: styles.gridTemplateColumns,
            };
          }),
          nav.getByRole("link", { name: "回中诗社" }).boundingBox(),
          navigationList.boundingBox(),
          navigationItems.evaluateAll((elements) =>
            elements.map((element) => {
              const box = element.getBoundingClientRect();
              return { x: box.x, y: box.y, width: box.width, height: box.height };
            }),
          ),
          navigationControls.evaluateAll((elements) =>
            elements.map((element) => {
              const box = element.getBoundingClientRect();
              return { x: box.x, y: box.y, width: box.width, height: box.height };
            }),
          ),
          page.evaluate(() => document.documentElement.clientWidth),
        ]);

      expect(brandBox).not.toBeNull();
      expect(listBox).not.toBeNull();
      expect(controlBoxes).toHaveLength(5);
      for (const box of controlBoxes) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(pageWidth);
      }

      const itemRows = new Set(itemBoxes.map((box) => Math.round(box.y))).size;
      if (viewport.width === 390) {
        expect(listStyles.display).toBe("grid");
        expect(listStyles.gridTemplateColumns.split(" ")).toHaveLength(3);
        expect(itemRows).toBe(2);
        expect(brandBox!.y + brandBox!.height).toBeLessThan(listBox!.y);
      } else if (viewport.width < 1024) {
        expect(listStyles.display).toBe("flex");
        expect(itemRows).toBe(1);
        expect(brandBox!.y + brandBox!.height).toBeLessThan(listBox!.y);
      } else {
        expect(listStyles.display).toBe("flex");
        const brandCenter = brandBox!.y + brandBox!.height / 2;
        const listCenter = listBox!.y + listBox!.height / 2;
        expect(Math.abs(brandCenter - listCenter)).toBeLessThan(2);
      }
    }

    // The account page shows the safe profile fields.
    await expect(
      page.getByRole("heading", { level: 1, name: "账户" }),
    ).toBeVisible();
    await expect(page.getByText("显示名称")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("注册时间")).toBeVisible();
    await expect(page.getByText("已登录")).toBeVisible();

    const accountText = await page.locator("main").innerText();
    expect(accountText).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);

    // The raw session token string must not appear in the account HTML.
    expect(await page.content()).not.toContain(sessionTokenValue);

    await page.setViewportSize({ width: 390, height: 844 });
    const accountDimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(accountDimensions.scrollWidth).toBeLessThanOrEqual(
      accountDimensions.clientWidth,
    );

    // 精简首页不按认证态增加首屏按钮；登录态入口统一保留在刊头导航。
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const homeMain = page.getByRole("main");
    const homeNav = page.getByRole("navigation");
    await expect(
      homeNav.getByRole("link", { name: "我的诗作" }),
    ).toHaveAttribute("href", "/account/poems");
    await expect(homeNav.getByRole("link", { name: "账户" })).toBeVisible();
    await expect(homeNav.getByRole("button", { name: "登出" })).toBeVisible();
    await expect(homeMain.getByText(/^欢迎回来/)).toHaveCount(0);
    await expect(homeMain.getByRole("link", { name: "写一首" })).toHaveCount(0);
    await expect(homeMain.getByRole("link", { name: "登录" })).toHaveCount(0);
  });

  test("logs out via the UI; repeated sign-out API calls stay stable; stale cookies are rejected", async () => {
    // Real logout through the navigation form.
    await page.getByRole("button", { name: "登出" }).click();
    await page.waitForURL("/");

    // Navigation returns to the anonymous state.
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "注册" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "账户" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "我的诗作" })).toHaveCount(0);
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
