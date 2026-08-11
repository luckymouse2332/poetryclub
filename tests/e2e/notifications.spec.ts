import { expect, test, type Page } from "@playwright/test";

import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
} from "./global-setup";
import {
  createUnreadNotificationFixture,
  deleteNotificationById,
} from "./helpers/database";

async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((target) => {
    const element = document.querySelector(target);
    return Boolean(
      element &&
        Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
    );
  }, selector);
}

async function signIn(page: Page, next: string): Promise<void> {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("邮箱").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("密码").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL(new RegExp(`${next.replaceAll("/", "\\/")}$`));
}

function unreadCountFromLabel(value: string | null): number {
  const match = value?.match(/(\d+) 条未读/);
  if (!match) throw new Error(`Unable to parse unread count from: ${value}`);
  return Number(match[1]);
}

test("anonymous users cannot access notification or announcement pages", async ({
  page,
}) => {
  for (const path of [
    "/notifications",
    "/announcements/00000000-0000-0000-0000-000000000000",
    "/admin/announcements",
  ]) {
    await page.goto(path);
    await page.waitForURL(/\/login/);
    expect(new URL(page.url()).pathname).toBe("/login");
    expect(new URL(page.url()).searchParams.get("next")).toBe(
      path.startsWith("/admin/") ? "/admin" : path,
    );
  }
});

test("desktop notification popover stays synchronized and supports keyboard dismissal", async ({
  browser,
}) => {
  const inboxPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const adminPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await inboxPage.addInitScript(() => {
      class TestEventSource extends EventTarget {
        static activeSource: EventTarget | undefined;
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSED = 2;
        readonly readyState = TestEventSource.OPEN;
        readonly url = "/api/notifications/stream";
        close() {
          TestEventSource.activeSource = undefined;
        }
        constructor() {
          super();
          TestEventSource.activeSource = this;
        }
      }
      Object.defineProperty(window, "EventSource", {
        configurable: true,
        writable: true,
        value: TestEventSource,
      });
      Object.defineProperty(window, "__emitNotificationStreamEvent", {
        configurable: true,
        value: (type: string) =>
          TestEventSource.activeSource?.dispatchEvent(new Event(type)),
      });
    });
    await signIn(inboxPage, "/");
    const nav = inboxPage.getByRole("navigation", { name: "主导航" });
    const notificationTrigger = nav.getByRole("button", { name: /^通知/ });
    const myTrigger = nav.getByRole("button", { name: "我的" });
    await expect(notificationTrigger).toBeVisible();
    await expect(myTrigger).toBeVisible();
    await waitForHydration(inboxPage, 'button[aria-label^="通知"]');

    const [notificationBox, myBox] = await Promise.all([
      notificationTrigger.boundingBox(),
      myTrigger.boundingBox(),
    ]);
    expect(notificationBox).not.toBeNull();
    expect(myBox).not.toBeNull();
    expect(myBox!.x).toBeGreaterThan(notificationBox!.x);

    await notificationTrigger.focus();
    await notificationTrigger.press("Enter");
    const popover = inboxPage.locator('[data-slot="popover-content"]');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveCSS(
      "animation-name",
      /dropdown-unfold-in/,
    );
    await expect(popover).toHaveCSS("backdrop-filter", "none");
    await inboxPage.evaluate(() => {
      (
        window as Window & {
          __emitNotificationStreamEvent?: (type: string) => void;
        }
      ).__emitNotificationStreamEvent?.("error");
    });
    await expect(popover.getByRole("status")).toContainText(
      "实时更新暂时不可用",
    );
    await inboxPage.evaluate(() => {
      (
        window as Window & {
          __emitNotificationStreamEvent?: (type: string) => void;
        }
      ).__emitNotificationStreamEvent?.("open");
    });
    await expect(popover.getByRole("status")).toHaveCount(0);
    await inboxPage.keyboard.press("Escape");
    await expect(popover).toBeHidden();
    await expect(notificationTrigger).toBeFocused();

    await notificationTrigger.click();
    await expect(popover).toBeVisible();
    await inboxPage.mouse.click(24, 320);
    await expect(popover).toBeHidden();

    const beforeCount = unreadCountFromLabel(
      await notificationTrigger.getAttribute("aria-label"),
    );
    await notificationTrigger.click();
    await expect(popover).toBeVisible();

    await signIn(adminPage, "/admin/announcements/new");
    await waitForHydration(adminPage, "main form button[type=submit]");
    const title = `E2E 系统公告 ${Date.now()}`;
    await adminPage.getByLabel("公告标题").fill(title);
    await adminPage
      .getByLabel("公告正文")
      .fill("这是一条用于验证实时通知列表同步的公告正文。第二行内容用于摘要截断。");
    await adminPage.getByLabel("站内链接").fill("/about");
    await adminPage.getByRole("radio", { name: "全部正常账号" }).click();
    await adminPage.getByRole("button", { name: "创建草稿" }).click();
    await adminPage.waitForURL(/\/admin\/announcements\/[0-9a-f-]+\/edit\?created=1$/);
    const publishButton = adminPage.getByRole("button", { name: "发布公告" });
    await expect(publishButton).toBeEnabled();
    await publishButton.click();
    await expect(adminPage.getByRole("heading", { level: 1, name: "已发布公告" })).toBeVisible();
    const announcementId = adminPage
      .url()
      .match(/\/admin\/announcements\/([0-9a-f-]+)\/edit/)?.[1];
    expect(announcementId).toBeTruthy();
    await inboxPage.evaluate(() => {
      (
        window as Window & {
          __emitNotificationStreamEvent?: (type: string) => void;
        }
      ).__emitNotificationStreamEvent?.("notification");
    });

    await expect
      .poll(
        async () =>
          unreadCountFromLabel(await notificationTrigger.getAttribute("aria-label")),
        { timeout: 15_000 },
      )
      .toBe(beforeCount + 1);
    await expect(popover.getByText(title, { exact: true })).toBeVisible();
    const notificationTime = popover.locator("time").filter({ hasText: /刚刚|分钟前|今天|昨天/ }).first();
    await expect(notificationTime).toHaveAttribute("datetime", /T/);

    await popover.getByRole("button").filter({ hasText: title }).click();
    await inboxPage.waitForURL(`/announcements/${announcementId}`);
    await expect(inboxPage.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(inboxPage.getByRole("article", { name: title })).toContainText(
      "第二行内容用于摘要截断。",
    );
    await expect
      .poll(
        async () =>
          unreadCountFromLabel(await notificationTrigger.getAttribute("aria-label")),
        { timeout: 15_000 },
      )
      .toBe(beforeCount);
    await inboxPage.getByRole("link", { name: "前往相关页面" }).click();
    await inboxPage.waitForURL("/about");
    await inboxPage.goto("/notifications");
    const notificationList = inboxPage.getByRole("list", { name: "通知列表" });
    await expect(notificationList.getByText(title, { exact: true })).toBeVisible();
    await expect(notificationList.locator("time").first()).toHaveAttribute(
      "datetime",
      /T/,
    );
  } finally {
    await inboxPage.close();
    await adminPage.close();
  }
});

test("non-recipients cannot read member-only announcement details", async ({
  page,
}) => {
  await signIn(page, "/admin/announcements/new");
  await waitForHydration(page, "main form button[type=submit]");
  const title = `E2E 非收件人公告 ${Date.now()}`;
  await page.getByLabel("公告标题").fill(title);
  await page.getByLabel("公告正文").fill("这段正文不应被管理员收件人读取。");
  await page.getByRole("radio", { name: "正常成员" }).click();
  await page.getByRole("button", { name: "创建草稿" }).click();
  await page.waitForURL(/\/admin\/announcements\/[0-9a-f-]+\/edit\?created=1$/);
  const publishButton = page.getByRole("button", { name: "发布公告" });
  await publishButton.click();
  await expect(page.getByRole("heading", { level: 1, name: "已发布公告" })).toBeVisible();
  const announcementId = page
    .url()
    .match(/\/admin\/announcements\/([0-9a-f-]+)\/edit/)?.[1];
  expect(announcementId).toBeTruthy();

  await page.goto(`/announcements/${announcementId}`);
  await expect(page.getByRole("heading", { level: 1, name: "页面不存在" })).toBeVisible();
  await expect(page.getByText("这段正文不应被管理员收件人读取。")).toHaveCount(0);
});

test("mobile notification state and admin entry stay inside their navigation roles", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const notificationId = await createUnreadNotificationFixture(E2E_ADMIN_EMAIL);

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    const signInResponse = await page.request.post("/api/auth/sign-in/email", {
      data: {
        email: E2E_ADMIN_EMAIL,
        password: E2E_ADMIN_PASSWORD,
        rememberMe: false,
      },
    });
    expect(signInResponse.status()).toBe(200);

    for (const viewport of [
      { width: 320, height: 720 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 860 },
      { width: 768, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await waitForHydration(page, 'button[aria-label="打开全站导航"]');
      const headerNavigation = page.getByRole("navigation", {
        name: "主导航",
      });
      const accountTrigger = headerNavigation.getByRole("button", {
        name: /E2E 测试管理员的账户菜单/,
      });
      await expect(accountTrigger).toBeVisible();
      await expect(
        accountTrigger.locator('[data-unread-indicator="true"]'),
      ).toHaveCount(1);

      await accountTrigger.click();
      const accountMenu = page.getByRole("menu");
      const notificationItem = accountMenu.getByRole("menuitem", {
        name: /通知.*[1-9]\d* 条未读/,
      });
      await expect(notificationItem).toHaveAttribute("href", "/notifications");
      const mobileAccountBackdrop = page.locator(
        '[data-account-menu-backdrop="true"]',
      );
      await expect(mobileAccountBackdrop).toHaveCount(0);
      await expect(page.locator('[data-slot="dropdown-menu-content"]')).toHaveCSS(
        "animation-name",
        /dropdown-unfold-in/,
      );
      await page.keyboard.press("Escape");
      await expect(accountMenu).toBeHidden();
      await expect(accountTrigger).toBeFocused();

      await accountTrigger.click();
      await page.mouse.click(8, 100);
      await expect(accountMenu).toBeHidden();

      await headerNavigation
        .getByRole("button", { name: "打开全站导航" })
        .click();
      const globalNavigation = page.getByRole("navigation", {
        name: "全站导航",
      });
      const adminNavigationTrigger = globalNavigation.getByRole("button", {
        name: "管理后台",
      });
      await expect(adminNavigationTrigger).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(
        globalNavigation.getByRole("link", { name: "管理：总览" }),
      ).toBeHidden();
      await adminNavigationTrigger.click();
      await expect(adminNavigationTrigger).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      const links = globalNavigation.getByRole("link");
      await expect(
        globalNavigation.getByRole("link", { name: "诗作", exact: true }),
      ).toBeVisible();
      await expect(
        globalNavigation.getByRole("link", { name: "关于", exact: true }),
      ).toBeVisible();
      await expect(globalNavigation.getByRole("link", { name: /通知/ })).toHaveCount(0);
      await expect(globalNavigation.getByText("管理后台", { exact: true })).toBeVisible();
      await expect(globalNavigation.getByRole("link", { name: "管理：总览" })).toHaveAttribute(
        "href",
        "/admin",
      );
      await expect(globalNavigation.getByRole("link", { name: "管理：诗作" })).toHaveAttribute(
        "href",
        "/admin/poems",
      );
      await expect(globalNavigation.getByRole("link", { name: "管理：审计" })).toHaveAttribute(
        "href",
        "/admin/audit",
      );
      await adminNavigationTrigger.click();
      await expect(adminNavigationTrigger).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(
        globalNavigation.getByRole("link", { name: "管理：总览" }),
      ).toBeHidden();
      await adminNavigationTrigger.click();
      await expect(globalNavigation.getByRole("link", { name: "我的" })).toHaveCount(0);
      await expect(globalNavigation.getByRole("link", { name: "账户信息" })).toHaveCount(0);
      const linkHeights = await links.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().height),
      );
      expect(linkHeights.every((height) => height >= 44)).toBe(true);
      await page.mouse.click(viewport.width - 8, 120);
      await expect(globalNavigation).toBeHidden();
      await expect(
        headerNavigation.getByRole("button", { name: "打开全站导航" }),
      ).toBeFocused();
    }

    await page.goto("/");
    await waitForHydration(page, 'button[aria-label="打开全站导航"]');
    await page.getByRole("button", { name: "打开全站导航" }).click();
    await page.getByRole("button", { name: "管理后台" }).click();
    await page
      .getByRole("navigation", { name: "全站导航" })
      .getByRole("link", { name: "管理：总览" })
      .click();
    await page.waitForURL(/\/admin$/);
    await expect(page.getByRole("navigation", {
      name: "管理后台导航",
    })).toHaveCount(0);

    await page.getByRole("button", { name: "打开全站导航" }).click();
    const mobileAdminNavigation = page.getByRole("navigation", {
      name: "全站导航",
    });
    await expect(
      mobileAdminNavigation.getByRole("link", { name: "管理：总览" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      mobileAdminNavigation.getByRole("link", { name: "管理：审计" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/admin");
    const compactAdminNavigation = page.getByRole("navigation", {
      name: "管理后台导航",
    });
    await expect(compactAdminNavigation.getByRole("link", { name: "总览" })).toBeVisible();
    await expect(compactAdminNavigation.getByRole("link", { name: "审计" })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/admin");
    const desktopAdminNavigation = page.getByRole("navigation", {
      name: "管理后台导航",
    });
    await expect(desktopAdminNavigation.getByRole("link", { name: "总览" })).toBeVisible();
    await expect(desktopAdminNavigation.getByRole("link", { name: "审计" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await waitForHydration(page, 'button[aria-label^="打开E2E 测试管理员的账户菜单"]');
    await page.getByRole("button", { name: /E2E 测试管理员的账户菜单/ }).click();
    await page.getByRole("menuitem", { name: /通知.*条未读/ }).click();
    await page.waitForURL("/notifications");
    await expect(
      page.getByRole("heading", { level: 1, name: "通知" }),
    ).toBeVisible();
  } finally {
    await deleteNotificationById(notificationId);
  }
});
