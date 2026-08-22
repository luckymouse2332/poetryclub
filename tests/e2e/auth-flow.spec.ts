import { expect, test, type Page } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
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

  const nav = page.getByRole("navigation", { name: "主导航" });
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

test("account overview aligns cards and uses one quick-action surface", async ({
  page,
}) => {
  const signInResponse = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: E2E_ADMIN_EMAIL,
      password: E2E_ADMIN_PASSWORD,
      rememberMe: false,
    },
  });
  expect(signInResponse.status()).toBe(200);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { level: 1, name: "账户" }),
  ).toBeVisible();

  const accountDetailsSurface = page.locator(
    'section[aria-labelledby="account-details-title"] > [data-slot="surface"]',
  );
  const quickActionSurfaces = page.locator(
    'aside[aria-label="快捷操作"] > [data-slot="surface"]',
  );
  await expect(quickActionSurfaces).toHaveCount(2);
  await expect(accountDetailsSurface).toHaveAttribute("data-variant", "paper");
  expect(
    await quickActionSurfaces.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-variant")),
    ),
  ).toEqual(["paper", "paper"]);

  const [detailsBox, firstQuickActionBox, quickActionStyles] =
    await Promise.all([
      accountDetailsSurface.boundingBox(),
      quickActionSurfaces.first().boundingBox(),
      quickActionSurfaces.evaluateAll((elements) =>
        elements.map((element) => {
          const styles = getComputedStyle(element);
          return {
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
            boxShadow: styles.boxShadow,
          };
        }),
      ),
    ]);
  expect(detailsBox).not.toBeNull();
  expect(firstQuickActionBox).not.toBeNull();
  expect(Math.abs(detailsBox!.y - firstQuickActionBox!.y)).toBeLessThanOrEqual(
    1,
  );
  expect(quickActionStyles[0]).toEqual(quickActionStyles[1]);

  await page.setViewportSize({ width: 390, height: 844 });
  const accountDimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(accountDimensions.scrollWidth).toBeLessThanOrEqual(
    accountDimensions.clientWidth,
  );
});

test("mobile member navigation separates global and account responsibilities", async ({
  page,
}) => {
  const name = `林嘉禾${Math.floor(Math.random() * 100_000)}`;
  const email = uniqueEmail("mobile-member-navigation");
  const password = "password123";
  const inviteCode = await createTestInvitation();
  const signUpResponse = await page.request.post("/api/auth/sign-up/email", {
    data: { name, email, password, inviteCode },
  });
  expect(signUpResponse.status()).toBe(200);
  const signInResponse = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password, rememberMe: false },
  });
  expect(signInResponse.status()).toBe(200);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/account");
  await waitForHydration(page, 'button[aria-label="打开全站导航"]');

  const headerNavigation = page.getByRole("navigation", { name: "主导航" });
  const accountTrigger = headerNavigation.getByRole("button", {
    name: new RegExp(`${name}的账户菜单`),
  });
  await expect(accountTrigger.getByText("林", { exact: true })).toBeVisible();
  await expect(
    accountTrigger.locator('[data-unread-indicator="true"]'),
  ).toHaveCount(0);

  await headerNavigation
    .getByRole("button", { name: "打开全站导航" })
    .click();
  const globalNavigation = page.getByRole("navigation", { name: "全站导航" });
  await expect(page.locator('[data-slot="sheet-content"]')).toHaveAttribute(
    "data-side",
    "left",
  );
  await expect(globalNavigation.getByRole("link", { name: /通知/ })).toHaveCount(0);
  await expect(globalNavigation.getByRole("link", { name: "管理" })).toHaveCount(0);
  await expect(
    globalNavigation.getByRole("button", { name: "管理后台" }),
  ).toHaveCount(0);
  await expect(globalNavigation.getByRole("link", { name: "我的" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await accountTrigger.click();
  const accountMenu = page.getByRole("menu");
  await expect(accountMenu.getByRole("menuitem", { name: /通知/ })).toContainText(
    "无未读",
  );
  await expect(accountMenu.getByRole("menuitem", { name: "我的诗作" })).toBeVisible();
  await expect(accountMenu.getByRole("menuitem", { name: "账户信息" })).toBeVisible();
  await expect(accountMenu.getByRole("menuitem", { name: "账户安全" })).toBeVisible();
  await expect(accountMenu.getByRole("menuitem", { name: "登出" })).toBeVisible();
  await page.keyboard.press("Escape");

  const [headingBox, sectionNavigationBox] = await Promise.all([
    page.getByRole("heading", { level: 1, name: "账户" }).boundingBox(),
    page.getByRole("navigation", { name: "账户导航" }).boundingBox(),
  ]);
  expect(headingBox).not.toBeNull();
  expect(sectionNavigationBox).not.toBeNull();
  expect(sectionNavigationBox!.y).toBeGreaterThan(
    headingBox!.y + headingBox!.height,
  );
});

test("administrator navigation stays reachable across Sheet and workspace breakpoints", async ({
  page,
}) => {
  const signInResponse = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: E2E_ADMIN_EMAIL,
      password: E2E_ADMIN_PASSWORD,
      rememberMe: false,
    },
  });
  expect(signInResponse.status()).toBe(200);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  await waitForHydration(page, 'button[aria-label="打开全站导航"]');
  await expect(page.locator('nav[aria-label="管理后台导航"]:visible')).toHaveCount(0);

  await page.getByRole("button", { name: "打开全站导航" }).click();
  const globalNavigation = page.getByRole("navigation", { name: "全站导航" });
  await globalNavigation.getByRole("button", { name: "管理后台" }).click();
  const adminLinks = globalNavigation.getByRole("link", { name: /^管理：/ });
  await expect(adminLinks).toHaveCount(7);
  await expect(
    globalNavigation.getByRole("link", { name: "管理：总览" }),
  ).toHaveAttribute("aria-current", "page");
  await globalNavigation.getByRole("link", { name: "管理：用户" }).click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(globalNavigation).toBeHidden();

  await page.setViewportSize({ width: 1024, height: 844 });
  const compactAdminNavigation = page.locator(
    'nav[aria-label="管理后台导航"]:visible',
  );
  await expect(compactAdminNavigation).toHaveCount(1);
  await expect(compactAdminNavigation).toHaveAttribute("data-variant", "bar");
  await expect(
    compactAdminNavigation.locator('[data-slot="secondary-navigation-indicator"]'),
  ).toHaveCount(1);

  await page.setViewportSize({ width: 1280, height: 844 });
  const desktopAdminNavigation = page.locator(
    'nav[aria-label="管理后台导航"]:visible',
  );
  await expect(desktopAdminNavigation).toHaveCount(1);
  await expect(desktopAdminNavigation).toHaveAttribute(
    "data-variant",
    "sidebar",
  );
  await expect(
    desktopAdminNavigation.getByRole("link", { name: "用户" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(desktopAdminNavigation.getByRole("link")).toHaveCount(7);
  const [desktopAdminNavigationBox, desktopAdminHeadingBox] =
    await Promise.all([
      desktopAdminNavigation.boundingBox(),
      page
        .getByRole("heading", { level: 1, name: "用户管理" })
        .boundingBox(),
    ]);
  expect(desktopAdminNavigationBox).not.toBeNull();
  expect(desktopAdminHeadingBox).not.toBeNull();
  expect(desktopAdminNavigationBox!.x).toBeLessThan(
    desktopAdminHeadingBox!.x,
  );
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
    const nav = page.getByRole("navigation", { name: "主导航" });
    await expect(nav.getByText(displayName)).toHaveCount(0);
    await expect(nav.getByRole("button", { name: /^通知/ })).toBeVisible();
    const myMenuTrigger = nav.getByRole("button", { name: /^我的/ });
    await expect(myMenuTrigger).toBeVisible();
    await myMenuTrigger.click();
    const myMenu = page.getByRole("menu");
    await expect(myMenu).toBeVisible();
    const myMenuContent = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(myMenuContent).toHaveCSS(
      "animation-name",
      /dropdown-unfold-in/,
    );
    await expect(page.locator(
      '[data-account-menu-backdrop="true"][data-variant="desktop"]',
    )).toHaveCount(0);
    await expect(myMenuContent).toHaveCSS(
      "backdrop-filter",
      "none",
    );
    await expect(myMenu.getByRole("menuitem", { name: "我的诗作" })).toBeVisible();
    await expect(myMenu.getByRole("menuitem", { name: "账户信息" })).toBeVisible();
    await expect(myMenu.getByRole("menuitem", { name: "账户安全" })).toBeVisible();
    await expect(myMenu.getByRole("menuitem", { name: "登出" })).toBeVisible();
    await expect(myMenu.getByText("最近通知")).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "登录" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "注册" })).toHaveCount(0);

    const accountLink = myMenu.getByRole("menuitem", { name: "账户信息" });
    const logoutButton = myMenu.getByRole("menuitem", { name: "登出" });
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
    expect(logoutButtonMetrics.height).toBeGreaterThanOrEqual(44);
    expect(logoutButtonMetrics.fontFamily).toBe(accountLinkMetrics.fontFamily);
    expect(logoutButtonMetrics.fontSize).toBe(accountLinkMetrics.fontSize);
    expect(logoutButtonMetrics.lineHeight).toBe(accountLinkMetrics.lineHeight);

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
    expect(hoveredLogoutStyle.backgroundColor).not.toBe(
      baseLogoutStyle.backgroundColor,
    );
    expect(hoveredLogoutStyle.color).toBe(baseLogoutStyle.color);
    await page.mouse.move(0, 0);
    await page.keyboard.press("Escape");

    for (const viewport of [
      { width: 320, height: 720 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 860 },
      { width: 768, height: 900 },
      { width: 920, height: 900 },
      { width: 1024, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      if (viewport.width < 1024) {
        const mobileNav = page.getByRole("navigation", { name: "主导航" });
        const menuTrigger = mobileNav.getByRole("button", {
          name: "打开全站导航",
        });
        const accountTrigger = mobileNav.getByRole("button", {
          name: new RegExp(`${displayName}的账户菜单`),
        });
        const brand = mobileNav.getByRole("link", { name: "回中诗社" });
        const [navBox, menuBox, accountBox, brandBox] = await Promise.all([
          mobileNav.boundingBox(),
          menuTrigger.boundingBox(),
          accountTrigger.boundingBox(),
          brand.boundingBox(),
        ]);
        expect(navBox).not.toBeNull();
        expect(menuBox).not.toBeNull();
        expect(accountBox).not.toBeNull();
        expect(brandBox).not.toBeNull();
        expect(navBox!.height).toBe(64);
        expect(menuBox!.height).toBeGreaterThanOrEqual(44);
        expect(accountBox!.height).toBeGreaterThanOrEqual(44);
        expect(
          Math.abs(
            brandBox!.x + brandBox!.width / 2 - viewport.width / 2,
          ),
        ).toBeLessThanOrEqual(1);
        await expect(accountTrigger.getByText("诗", { exact: true })).toBeVisible();
      } else {
        const desktopNav = page.getByRole("navigation", { name: "主导航" });
        await expect(
          desktopNav.getByRole("button", { name: /^通知/ }),
        ).toBeVisible();
        await expect(
          desktopNav.getByRole("button", { name: "我的" }),
        ).toBeVisible();
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileMenuTrigger = page.getByRole("button", {
      name: "打开全站导航",
    });
    await mobileMenuTrigger.click();
    const globalNavigation = page.getByRole("navigation", {
      name: "全站导航",
    });
    await expect(globalNavigation.getByRole("link", { name: /通知/ })).toHaveCount(0);
    await expect(globalNavigation.getByRole("link", { name: "管理" })).toHaveCount(0);
    await expect(globalNavigation.getByRole("link", { name: "我的" })).toHaveCount(0);
    await page.keyboard.press("Escape");

    const mobileAccountTrigger = page.getByRole("button", {
      name: new RegExp(`${displayName}的账户菜单`),
    });
    await expect(
      mobileAccountTrigger.locator('[data-unread-indicator="true"]'),
    ).toHaveCount(0);
    await mobileAccountTrigger.click();
    const mobileAccountMenu = page.getByRole("menu");
    await expect(
      mobileAccountMenu.getByRole("menuitem", { name: "我的诗作" }),
    ).toBeVisible();
    await expect(
      mobileAccountMenu.getByRole("menuitem", { name: /通知/ }),
    ).toContainText("无未读");
    await expect(
      mobileAccountMenu.getByRole("menuitem", { name: "账户信息" }),
    ).toBeVisible();
    await expect(
      mobileAccountMenu.getByRole("menuitem", { name: "账户安全" }),
    ).toBeVisible();
    await expect(
      mobileAccountMenu.getByRole("menuitem", { name: "登出" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");

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
    const accountNavigation = page.getByRole("navigation", { name: "账户导航" });
    await expect(accountNavigation).toBeVisible();
    const [accountHeadingBox, accountNavigationBox] = await Promise.all([
      page.getByRole("heading", { level: 1, name: "账户" }).boundingBox(),
      accountNavigation.boundingBox(),
    ]);
    expect(accountHeadingBox).not.toBeNull();
    expect(accountNavigationBox).not.toBeNull();
    expect(accountNavigationBox!.y).toBeGreaterThan(
      accountHeadingBox!.y + accountHeadingBox!.height,
    );
    await expect(accountNavigation.getByRole("link", { name: "账户信息" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(accountNavigation.getByRole("link", { name: "我的诗作" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.goto("/account/poems");
    await expect(
      page
        .getByRole("navigation", { name: "账户导航" })
        .getByRole("link", { name: "我的诗作" }),
    ).toHaveAttribute("aria-current", "page");
    await page.goto("/account");
    const accountDimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(accountDimensions.scrollWidth).toBeLessThanOrEqual(
      accountDimensions.clientWidth,
    );

    await page.setViewportSize({ width: 1024, height: 844 });
    await page.goto("/account");
    const compactAccountNavigation = page.locator(
      'nav[aria-label="账户导航"]:visible',
    );
    await expect(compactAccountNavigation).toHaveCount(1);
    await expect(compactAccountNavigation).toHaveAttribute(
      "data-variant",
      "bar",
    );
    await expect(
      compactAccountNavigation.locator(
        '[data-slot="secondary-navigation-indicator"]',
      ),
    ).toHaveCount(1);
    const [compactAccountNavigationBox, compactAccountHeadingBox] =
      await Promise.all([
        compactAccountNavigation.boundingBox(),
        page.getByRole("heading", { level: 1, name: "账户" }).boundingBox(),
      ]);
    expect(compactAccountNavigationBox).not.toBeNull();
    expect(compactAccountHeadingBox).not.toBeNull();
    expect(compactAccountNavigationBox!.y).toBeLessThan(
      compactAccountHeadingBox!.y,
    );

    await page.setViewportSize({ width: 1280, height: 844 });
    const desktopAccountNavigation = page.locator(
      'nav[aria-label="账户导航"]:visible',
    );
    await expect(desktopAccountNavigation).toHaveCount(1);
    await expect(desktopAccountNavigation).toHaveAttribute(
      "data-variant",
      "sidebar",
    );
    const [desktopAccountNavigationBox, desktopAccountHeadingBox] =
      await Promise.all([
        desktopAccountNavigation.boundingBox(),
        page.getByRole("heading", { level: 1, name: "账户" }).boundingBox(),
      ]);
    expect(desktopAccountNavigationBox).not.toBeNull();
    expect(desktopAccountHeadingBox).not.toBeNull();
    expect(desktopAccountNavigationBox!.x).toBeLessThan(
      desktopAccountHeadingBox!.x,
    );

    // 精简首页不按认证态增加首屏按钮；登录态入口统一保留在刊头导航。
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const homeMain = page.getByRole("main");
    const homeNav = page.getByRole("navigation");
    const homeMyTrigger = homeNav.getByRole("button", { name: /^我的/ });
    await expect(homeMyTrigger).toBeVisible();
    await waitForHydration(page, 'button[aria-label="我的"]');
    await homeMyTrigger.click();
    const homeMyMenu = page.getByRole("menu");
    await expect(homeMyMenu).toBeVisible();
    await expect(homeMyMenu.getByRole("menuitem", { name: "我的诗作" })).toHaveAttribute(
      "href",
      "/account/poems",
    );
    await expect(homeMyMenu.getByRole("menuitem", { name: "账户信息" })).toBeVisible();
    await expect(homeMyMenu.getByRole("menuitem", { name: "账户安全" })).toHaveAttribute(
      "href",
      "/account/security",
    );
    await expect(homeMyMenu.getByRole("menuitem", { name: "登出" })).toBeVisible();
    await expect(homeMain.getByText(/^欢迎回来/)).toHaveCount(0);
    await expect(homeMain.getByRole("link", { name: "写一首" })).toHaveCount(0);
    await expect(homeMain.getByRole("link", { name: "登录" })).toHaveCount(0);
  });

  test("logs out via the UI; repeated sign-out API calls stay stable; stale cookies are rejected", async () => {
    // Real logout through the navigation form.
    await page.goto("/");
    const myTrigger = page.getByRole("button", { name: /^我的/ });
    await expect(myTrigger).toBeVisible();
    await waitForHydration(page, 'button[aria-label="我的"]');
    await myTrigger.click();
    const myMenu = page.getByRole("menu");
    await expect(myMenu).toBeVisible();
    await myMenu.getByRole("menuitem", { name: "登出" }).click();
    await page.waitForURL("/");
    await page.reload();

    // Navigation returns to the anonymous state.
    const nav = page.getByRole("navigation", { name: "主导航" });
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
