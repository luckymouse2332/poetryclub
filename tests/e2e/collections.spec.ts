import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
import { deleteCollectionById, deletePoemsByIds } from "./helpers/database";

test.setTimeout(180_000);

async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((target) => {
    const element = document.querySelector(target);
    return Boolean(
      element && Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
    );
  }, selector);
}

async function waitForHydratedLocator(locator: Locator): Promise<void> {
  await expect
    .poll(() =>
      locator.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
      ),
    )
    .toBe(true);
}

async function signInAdmin(page: Page): Promise<void> {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: E2E_ADMIN_EMAIL,
      password: E2E_ADMIN_PASSWORD,
      rememberMe: false,
    },
  });
  expect(response.status()).toBe(200);
}

async function createPublishedPoem(page: Page, title: string): Promise<string> {
  await page.goto("/account/poems/new");
  await waitForHydration(page, "main form button[type=submit]");
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("正文").fill(`${title}第一行。\n\n${title}第二行。`);
  await page.getByRole("radio", { name: "公开", exact: true }).click();
  await page.getByRole("button", { name: "保存草稿" }).click();
  await page.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
  const id = new URL(page.url()).pathname.split("/")[3] ?? "";
  await page.getByRole("button", { name: "保存并发布" }).click();
  await page.waitForURL(`/poems/${id}`);
  return id;
}

test.describe.serial("curated collection publishing and governance", () => {
  let adminContext: BrowserContext;
  let anonymousContext: BrowserContext;
  let adminPage: Page;
  let anonymousPage: Page;
  let collectionId = "";
  const poemIds: string[] = [];
  const marker = `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
  const firstTitle = `特辑首篇-${marker}`;
  const secondTitle = `特辑次篇-${marker}`;
  const collectionTitle = `连续阅读特辑-${marker}`;

  test.beforeAll(async ({ browser }) => {
    adminContext = await browser.newContext();
    anonymousContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    anonymousPage = await anonymousContext.newPage();
    await signInAdmin(adminPage);
    poemIds.push(await createPublishedPoem(adminPage, firstTitle));
    poemIds.push(await createPublishedPoem(adminPage, secondTitle));
  });

  test.afterAll(async () => {
    if (collectionId) await deleteCollectionById(collectionId);
    await deletePoemsByIds(poemIds);
    await Promise.all([adminContext?.close(), anonymousContext?.close()]);
  });

  test("creates, orders and publishes a collection", async () => {
    await adminPage.goto("/account/collections/new");
    await waitForHydration(adminPage, "main form button[type=submit]");
    await adminPage.getByLabel("标题").fill(collectionTitle);
    await adminPage.getByLabel("简介").fill("用于验证纯文本特辑目录。\n第二行简介。");
    await adminPage.getByRole("radio", { name: /^公开/ }).click();
    await adminPage.getByRole("button", { name: "保存草稿" }).click();
    await adminPage.waitForURL(/\/account\/collections\/[0-9a-f-]+\/edit\?created=1$/);
    collectionId = new URL(adminPage.url()).pathname.split("/")[3] ?? "";
    const editPagePublish = adminPage.getByRole("button", { name: "保存并发布特辑" });
    await expect(
      adminPage.getByRole("heading", { name: "发布状态" }),
    ).toBeVisible();
    await expect(editPagePublish).toBeEnabled();
    await expect(
      adminPage.getByText(/发布前需要先收录至少一篇当前可读/),
    ).toBeVisible();

    for (const title of [firstTitle, secondTitle]) {
      const candidate = adminPage.getByRole("article").filter({ hasText: title });
      const addButton = candidate.getByRole("button", { name: "加入特辑" });
      await waitForHydratedLocator(addButton);
      await addButton.click();
      await expect(
        adminPage
          .locator("section")
          .filter({ has: adminPage.getByRole("heading", { name: "已收录作品" }) })
          .getByText(`《${title}》`, { exact: true }),
      ).toBeVisible();
    }

    const secondItem = adminPage.getByRole("article").filter({ hasText: secondTitle });
    const moveUp = secondItem.getByRole("button", { name: "上移" });
    await waitForHydratedLocator(moveUp);
    await moveUp.click();
    await adminPage.goto("/account/collections");
    const collectionCard = adminPage
      .getByRole("article")
      .filter({ hasText: collectionTitle });
    await expect(collectionCard).toContainText("2 篇");
    for (const width of [390, 768, 920, 1024, 1440]) {
      await adminPage.setViewportSize({ width, height: 900 });
      const dimensions = await adminPage.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    }
    const more = collectionCard.getByRole("button", { name: /更多操作/ });
    await waitForHydratedLocator(more);
    await more.click();
    await adminPage.getByRole("menuitem", { name: "发布" }).click();
    await adminPage.waitForURL(`/collections/${collectionId}`);
    await expect(adminPage.getByRole("heading", { level: 1, name: collectionTitle })).toBeVisible();
    await expect(adminPage.locator("main ol li").first()).toContainText(secondTitle);
  });

  test("publishes current unsaved collection edits after withdrawal", async () => {
    await adminPage.goto(`/account/collections/${collectionId}/edit`);
    const withdraw = adminPage.getByRole("button", { name: "撤回特辑" });
    await waitForHydratedLocator(withdraw);
    await withdraw.click();
    await adminPage.waitForURL(`/account/collections/${collectionId}/edit?withdrawn=1`);
    await adminPage.getByLabel("简介").fill("发布时修改的特辑简介。");
    await adminPage.getByRole("button", { name: "保存并发布特辑" }).click();
    await adminPage.waitForURL(`/collections/${collectionId}`);
    await expect(adminPage.getByText("发布时修改的特辑简介。")).toBeVisible();
  });

  test("supports anonymous continuous reading, keyboard links and responsive widths", async () => {
    for (const width of [390, 1024, 1440]) {
      await anonymousPage.setViewportSize({ width, height: 900 });
      await anonymousPage.goto(`/collections/${collectionId}`);
      const dimensions = await anonymousPage.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    }
    const firstDirectoryLink = anonymousPage.getByRole("link", {
      name: `《${secondTitle}》`,
      exact: true,
    });
    await firstDirectoryLink.focus();
    await expect(firstDirectoryLink).toBeFocused();
    await firstDirectoryLink.press("Enter");
    await anonymousPage.waitForURL(`/collections/${collectionId}/read/${poemIds[1]}`);
    await expect(anonymousPage.getByText(`${secondTitle}第一行。`)).toBeVisible();
    await anonymousPage.getByRole("link", { name: "下一篇" }).click();
    await anonymousPage.waitForURL(`/collections/${collectionId}/read/${poemIds[0]}`);
    await expect(anonymousPage.getByText(`${firstTitle}第一行。`)).toBeVisible();
    await anonymousPage.getByRole("link", { name: "返回目录" }).click();
    await expect(anonymousPage).toHaveURL(`/collections/${collectionId}`);

    await adminPage.goto(
      `/collections/${collectionId}/read/${poemIds[1]}`,
    );
    await expect(adminPage.getByRole("heading", { name: "评论与补充" })).toBeVisible();
    await expect(adminPage.getByLabel("评论内容")).toBeVisible();
    await adminPage.getByLabel("评论内容").fill("特辑阅读评论回归测试");
    const publishComment = adminPage.getByRole("button", { name: "发布评论" });
    await waitForHydratedLocator(publishComment);
    await publishComment.click();
    await expect(adminPage.getByText("评论已发布。", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(adminPage.getByText("特辑阅读评论回归测试", { exact: true })).toBeVisible();
  });

  test("hides and restores the collection with an audited administrator reason", async () => {
    await adminPage.goto(`/admin/collections/${collectionId}`);
    const hide = adminPage.getByRole("button", { name: "隐藏", exact: true });
    await waitForHydratedLocator(hide);
    await hide.click();
    const dialog = adminPage.getByRole("alertdialog");
    await dialog.getByLabel("原因").fill("E2E 特辑治理原因");
    await dialog.getByRole("button", { name: "确认隐藏" }).click();
    await expect(dialog).toHaveCount(0);
    expect((await anonymousPage.request.get(`/collections/${collectionId}`)).status()).toBe(404);

    const restore = adminPage.getByRole("button", { name: "恢复", exact: true });
    await waitForHydratedLocator(restore);
    await restore.click();
    const restoreDialog = adminPage.getByRole("alertdialog");
    await restoreDialog.getByLabel("原因").fill("E2E 特辑恢复说明");
    await restoreDialog.getByRole("button", { name: "确认恢复" }).click();
    await expect(restoreDialog).toHaveCount(0);
    expect((await anonymousPage.request.get(`/collections/${collectionId}`)).status()).toBe(200);
  });

  test("member-only direct access shows a login gate without protected text", async () => {
    await adminPage.goto(`/account/collections/${collectionId}/edit`);
    await waitForHydration(adminPage, "main form button[type=submit]");
    await adminPage.getByRole("radio", { name: /^仅成员可见/ }).click();
    await adminPage.getByRole("button", { name: "保存修改" }).click();
    await adminPage.waitForURL(`/account/collections/${collectionId}/edit?saved=1`);

    const response = await anonymousPage.request.get(`/collections/${collectionId}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain(collectionTitle);
    await anonymousPage.goto(`/collections/${collectionId}`);
    await expect(
      anonymousPage.getByRole("heading", { name: "这个特辑仅成员可见" }),
    ).toBeVisible();
    await expect(anonymousPage.getByText(collectionTitle, { exact: true })).toHaveCount(0);
  });
});
