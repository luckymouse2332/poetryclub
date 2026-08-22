import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";

import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
} from "./global-setup";
import {
  createTestInvitation,
  setUserSuspendedForTest,
} from "./helpers/database";

const PASSWORD = "password123";

test.setTimeout(120_000);

function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((target) => {
    const element = document.querySelector(target);
    return Boolean(
      element &&
        Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
    );
  }, selector);
}

async function waitForHydratedLocator(locator: Locator): Promise<void> {
  await expect
    .poll(
      () =>
        locator.evaluate((element) =>
          Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
        ),
      { timeout: 30_000 },
    )
    .toBe(true);
}

async function openReasonDialog(
  page: Page,
  trigger: Locator,
): Promise<Locator> {
  await waitForHydratedLocator(trigger);
  await trigger.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function registerAndSignIn(
  page: Page,
  name: string,
  email: string,
): Promise<void> {
  const inviteCode = await createTestInvitation();
  await page.goto("/login?mode=sign-up&next=%2Faccount%2Fpoems");
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("昵称").fill(name);
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByLabel("邀请码").fill(inviteCode);
  await page.getByRole("button", { name: "创建账号" }).click();
  await expect(
    page.getByText("注册请求已完成，请使用邮箱和密码登录。"),
  ).toBeVisible();
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL("/account/poems");
}

async function signInAdmin(page: Page): Promise<void> {
  await page.goto("/login?next=%2Fadmin");
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("邮箱").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("密码").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL("/admin");
}

async function setPoemVisibility(
  page: Page,
  poemId: string,
  label: "公开" | "仅成员可见",
): Promise<void> {
  await page.goto(`/account/poems/${poemId}/edit`);
  await waitForHydration(page, "main form button[type=submit]");
  await page.getByRole("radio", { name: label, exact: true }).click();
  await page.getByRole("button", { name: "保存修改" }).click();
  await page.waitForURL(`/account/poems/${poemId}/edit?saved=1`);
  await expect(page.getByText("修改已保存。")).toBeVisible();
}

function adminItemByTitle(page: Page, title: string) {
  return page
    .locator('[data-slot="item"], [data-slot="card"]')
    .filter({ has: page.getByRole("heading", { name: title }) });
}

function poemCardByTitle(page: Page, title: string) {
  return page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", { name: `《${title}》`, exact: true }),
    });
}

test.describe.serial("member-only poem access control", () => {
  let authorContext: BrowserContext;
  let readerContext: BrowserContext;
  let anonymousContext: BrowserContext;
  let adminContext: BrowserContext;
  let authorPage: Page;
  let readerPage: Page;
  let anonymousPage: Page;
  let adminPage: Page;
  let poemId: string;

  const authorName = uniqueValue("成员作品作者");
  const authorEmail = `${uniqueValue("content-author")}@example.com`;
  const readerName = uniqueValue("成员作品读者");
  const readerEmail = `${uniqueValue("content-reader")}@example.com`;
  const title = uniqueValue("仅成员诗作");
  const body = `受保护正文-${uniqueValue("secret-body")}\n第二行内容。`;

  test.beforeAll(async ({ browser }) => {
    authorContext = await browser.newContext();
    readerContext = await browser.newContext();
    anonymousContext = await browser.newContext();
    adminContext = await browser.newContext();
    authorPage = await authorContext.newPage();
    readerPage = await readerContext.newPage();
    anonymousPage = await anonymousContext.newPage();
    adminPage = await adminContext.newPage();

    await registerAndSignIn(authorPage, authorName, authorEmail);
    await registerAndSignIn(readerPage, readerName, readerEmail);
    await signInAdmin(adminPage);
  });

  test.afterAll(async () => {
    await setUserSuspendedForTest(readerEmail, false).catch(() => undefined);
    await Promise.all([
      authorContext?.close(),
      readerContext?.close(),
      anonymousContext?.close(),
      adminContext?.close(),
    ]);
  });

  test("requires an explicit visibility and creates a member-only draft", async () => {
    await authorPage.goto("/account/poems/new");
    await waitForHydration(authorPage, "main form button[type=submit]");
    await authorPage.getByLabel("标题").fill(title);
    await authorPage.getByLabel("正文").fill(body);
    await authorPage.getByRole("button", { name: "保存草稿" }).click();

    await expect(authorPage.getByText("请选择作品访问范围")).toBeVisible();
    await expect(authorPage).toHaveURL("/account/poems/new");

    await authorPage
      .getByRole("radio", { name: "仅成员可见", exact: true })
      .click();
    await authorPage.getByRole("button", { name: "保存草稿" }).click();
    await authorPage.waitForURL(
      /\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/,
    );
    poemId = new URL(authorPage.url()).pathname.split("/")[3] ?? "";
    expect(poemId).toMatch(/^[0-9a-f-]{36}$/);
    await expect(
      authorPage.locator("dl").getByText("仅成员可见", { exact: true }),
    ).toBeVisible();
  });

  test("publishes to active members while anonymous HTML stays content-free", async () => {
    await authorPage.getByRole("button", { name: "发布", exact: true }).click();
    await authorPage.waitForURL(`/poems/${poemId}`);
    await expect(
      authorPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expect(
      authorPage.getByText("仅成员可见", { exact: true }),
    ).toBeVisible();

    await readerPage.goto("/poems");
    await expect(poemCardByTitle(readerPage, title)).toBeVisible();
    await expect(
      poemCardByTitle(readerPage, title).getByText("成员可见", {
        exact: true,
      }),
    ).toBeVisible();
    await readerPage.goto("/");
    await expect(
      readerPage.getByRole("link", { name: `《${title}》`, exact: true }),
    ).toBeVisible();

    await anonymousPage.goto("/poems");
    await expect(poemCardByTitle(anonymousPage, title)).toHaveCount(0);
    await anonymousPage.goto("/");
    await expect(
      anonymousPage.getByRole("link", { name: `《${title}》`, exact: true }),
    ).toHaveCount(0);

    await anonymousPage.goto(`/poems/${poemId}`);
    await expect(
      anonymousPage.getByRole("heading", {
        name: "这篇作品仅成员可见",
      }),
    ).toBeVisible();
    const anonymousHtml = await anonymousPage.content();
    expect(anonymousHtml).not.toContain(title);
    expect(anonymousHtml).not.toContain(body.split("\n")[0]);

    await anonymousPage.setViewportSize({ width: 390, height: 844 });
    const dimensions = await anonymousPage.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(anonymousPage.getByLabel("邮箱")).toBeFocused();
    await anonymousPage.keyboard.press("Escape");
    await expect(
      anonymousPage.getByRole("heading", {
        name: "这篇作品仅成员可见",
      }),
    ).toBeVisible();

    await anonymousPage.getByRole("link", { name: "返回诗作列表" }).click();
    await anonymousPage.waitForURL("/poems");
    await anonymousPage.goto(`/poems/${poemId}`);
    await anonymousPage.getByLabel("邮箱").fill(readerEmail);
    await anonymousPage.getByLabel("密码").fill(PASSWORD);
    await anonymousPage.getByRole("button", { name: "登录", exact: true }).click();
    await anonymousPage.waitForURL(`/poems/${poemId}`);
    await expect(
      anonymousPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  });

  test("switches a published poem between public and member-only immediately", async () => {
    await setPoemVisibility(authorPage, poemId, "公开");
    await anonymousContext.clearCookies();
    await anonymousPage.goto(`/poems/${poemId}`);
    await expect(
      anonymousPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await anonymousPage.goto("/poems");
    await expect(poemCardByTitle(anonymousPage, title)).toBeVisible();

    await setPoemVisibility(authorPage, poemId, "仅成员可见");
    await anonymousPage.goto(`/poems/${poemId}`);
    await expect(
      anonymousPage.getByRole("heading", {
        name: "这篇作品仅成员可见",
      }),
    ).toBeVisible();
    await anonymousPage.goto("/poems");
    await expect(poemCardByTitle(anonymousPage, title)).toHaveCount(0);
  });

  test("excludes suspended accounts from member works but keeps public reads", async () => {
    await setUserSuspendedForTest(readerEmail, true);
    const memberResponse = await readerPage.goto(`/poems/${poemId}`);
    expect(memberResponse?.status()).toBe(404);
    await readerPage.goto("/poems");
    await expect(poemCardByTitle(readerPage, title)).toHaveCount(0);

    await setPoemVisibility(authorPage, poemId, "公开");
    const publicResponse = await readerPage.goto(`/poems/${poemId}`);
    expect(publicResponse?.status()).toBe(200);
    await expect(
      readerPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await readerPage.goto("/poems");
    await expect(poemCardByTitle(readerPage, title)).toBeVisible();

    await setUserSuspendedForTest(readerEmail, false);
    await setPoemVisibility(authorPage, poemId, "仅成员可见");
  });

  test("keeps administrator hiding authoritative over member visibility", async () => {
    await adminPage.goto(`/poems/${poemId}`);
    await expect(
      adminPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();

    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(title)}`);
    const card = adminItemByTitle(adminPage, title);
    await expect(card.getByText("仅成员可见", { exact: true })).toBeVisible();
    const hideDialog = await openReasonDialog(
      adminPage,
      card.getByRole("button", { name: "隐藏", exact: true }),
    );
    await hideDialog.getByLabel("原因").fill("E2E 成员作品治理测试");
    await hideDialog.getByRole("button", { name: "确认隐藏" }).click();
    await expect(card.getByText("已隐藏", { exact: true })).toBeVisible();

    expect((await readerPage.request.get(`/poems/${poemId}`)).status()).toBe(404);
    await authorPage.goto(`/account/poems/${poemId}/edit`);
    await expect(authorPage.getByText("管理员已隐藏")).toBeVisible();

    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(title)}`);
    const hiddenCard = adminItemByTitle(adminPage, title);
    const restoreDialog = await openReasonDialog(
      adminPage,
      hiddenCard.getByRole("button", { name: "恢复", exact: true }),
    );
    await restoreDialog.getByLabel("原因").fill("E2E 成员作品恢复测试");
    await restoreDialog.getByRole("button", { name: "确认恢复" }).click();
    await expect(hiddenCard.getByText("可见", { exact: true })).toBeVisible();
    expect((await readerPage.request.get(`/poems/${poemId}`)).status()).toBe(200);
  });
});
