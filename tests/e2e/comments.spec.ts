import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
import {
  createCommentPaginationFixtures,
  createTestInvitation,
  deletePoemsByIds,
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

async function registerAndSignIn(
  page: Page,
  name: string,
  email: string,
): Promise<void> {
  const inviteCode = await createTestInvitation();
  await page.goto("/login?mode=sign-up&next=%2Fpoems");
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("昵称").fill(name);
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByLabel("邀请码").fill(inviteCode);
  await page.getByRole("button", { name: "创建账号" }).click();
  await expect(page.getByText("注册请求已完成，请使用邮箱和密码登录。"))
    .toBeVisible();
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL("/poems");
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
  await page.getByLabel("正文").fill("评论 E2E 作品正文。\n第二行。");
  await page.getByRole("radio", { name: "公开", exact: true }).click();
  await page.getByRole("button", { name: "保存草稿" }).click();
  await page.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
  const poemId = new URL(page.url()).pathname.split("/")[3] ?? "";
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await page.waitForURL(`/poems/${poemId}`);
  return poemId;
}

function commentByText(page: Page, text: string): Locator {
  return page.getByRole("article").filter({ hasText: text }).first();
}

async function openReasonDialog(page: Page, trigger: Locator): Promise<Locator> {
  await trigger.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe.serial("M7 comments and first-level replies", () => {
  let authorContext: BrowserContext;
  let readerContext: BrowserContext;
  let adminContext: BrowserContext;
  let anonymousContext: BrowserContext;
  let authorPage: Page;
  let readerPage: Page;
  let adminPage: Page;
  let anonymousPage: Page;
  let poemId = "";

  const authorName = uniqueValue("评论作品作者");
  const authorEmail = `${uniqueValue("comment-author")}@example.com`;
  const readerName = uniqueValue("评论读者");
  const readerEmail = `${uniqueValue("comment-reader")}@example.com`;
  const title = uniqueValue("评论测试诗作");
  const rootBody = `纯文本评论 <script>window.__commentExecuted=true</script> ${uniqueValue("root")}`;
  const editedRootBody = `${uniqueValue("已编辑评论")} 第一行\n第二行`;
  const replyBody = uniqueValue("作者一级回复");

  test.beforeAll(async ({ browser }) => {
    authorContext = await browser.newContext();
    readerContext = await browser.newContext();
    adminContext = await browser.newContext();
    anonymousContext = await browser.newContext();
    authorPage = await authorContext.newPage();
    readerPage = await readerContext.newPage();
    adminPage = await adminContext.newPage();
    anonymousPage = await anonymousContext.newPage();
    await registerAndSignIn(authorPage, authorName, authorEmail);
    await registerAndSignIn(readerPage, readerName, readerEmail);
    await signInAdmin(adminPage);
    poemId = await createPublishedPoem(authorPage, title);
  });

  test.afterAll(async () => {
    if (poemId) await deletePoemsByIds([poemId]);
    await Promise.all([
      authorContext?.close(),
      readerContext?.close(),
      adminContext?.close(),
      anonymousContext?.close(),
    ]);
  });

  test("visitor reads comments and member publishes escaped plain text", async () => {
    await anonymousPage.goto(`/poems/${poemId}`);
    await expect(
      anonymousPage.getByRole("heading", { name: "评论与补充" }),
    ).toBeVisible();
    await expect(anonymousPage.getByText("登录后可以参与讨论。"))
      .toBeVisible();

    await readerPage.goto(`/poems/${poemId}`);
    await waitForHydration(readerPage, 'textarea[name="body"]');
    await readerPage.getByLabel("评论内容").fill(rootBody);
    await readerPage.getByRole("button", { name: "发布评论" }).click();
    await expect(readerPage.getByText("评论已发布。" )).toBeVisible();
    await expect(commentByText(readerPage, rootBody)).toBeVisible();
    expect(
      await readerPage.evaluate(() =>
        Boolean((window as typeof window & { __commentExecuted?: boolean }).__commentExecuted),
      ),
    ).toBe(false);

    await anonymousPage.reload();
    await expect(anonymousPage.getByText(rootBody, { exact: true })).toBeVisible();
    expect(
      await anonymousPage.evaluate(() =>
        Boolean((window as typeof window & { __commentExecuted?: boolean }).__commentExecuted),
      ),
    ).toBe(false);
    await anonymousPage.goto("/poems");
    const poemRow = anonymousPage.getByRole("article").filter({ hasText: title });
    await expect(poemRow.getByText("1 条评论", { exact: true })).toBeVisible();
  });

  test("notification focuses the root and the poem author adds one reply", async () => {
    await authorPage.goto("/notifications");
    const notification = authorPage
      .getByRole("button")
      .filter({ hasText: "你的作品有了新评论" })
      .first();
    await expect(notification).toBeVisible();
    await notification.click();
    await authorPage.waitForURL(
      new RegExp(`/poems/${poemId}/comments/[0-9a-f-]+\\?focus=[0-9a-f-]+$`),
    );
    await expect(commentByText(authorPage, rootBody)).toBeVisible();
    await expect.poll(() => authorPage.evaluate(() => document.activeElement?.id ?? ""))
      .toMatch(/^comment-/);

    const root = commentByText(authorPage, rootBody);
    await root.getByRole("button", { name: "回复", exact: true }).click();
    const dialog = authorPage.getByRole("dialog");
    await dialog.getByLabel("回复内容").fill(replyBody);
    await dialog.getByRole("button", { name: "发布回复" }).click();
    await expect(dialog).toBeHidden();
    await expect(authorPage.getByText(replyBody, { exact: true })).toBeVisible();
  });

  test("owner edits while administrator hides and restores with a reason", async () => {
    await readerPage.goto(`/poems/${poemId}`);
    await waitForHydration(readerPage, "main article button");
    const root = commentByText(readerPage, rootBody);
    await root.getByRole("button", { name: "编辑", exact: true }).click();
    const editDialog = readerPage.getByRole("dialog");
    await editDialog.getByLabel("评论内容").fill(editedRootBody);
    await editDialog.getByRole("button", { name: "保存修改" }).click();
    await expect(editDialog).toBeHidden();
    await expect(readerPage.getByText(editedRootBody, { exact: true })).toBeVisible();
    await expect(commentByText(readerPage, editedRootBody)).toContainText("已编辑");

    await adminPage.goto(`/admin/comments?q=${encodeURIComponent(editedRootBody.split("\n")[0] ?? "")}`);
    await waitForHydration(adminPage, "main button");
    const adminCard = adminPage
      .locator('[data-slot="card"]')
      .filter({ hasText: editedRootBody.split("\n")[0] })
      .first();
    const hideDialog = await openReasonDialog(
      adminPage,
      adminCard.getByRole("button", { name: "隐藏", exact: true }),
    );
    await hideDialog.getByLabel("原因").fill("E2E 评论治理原因");
    await hideDialog.getByRole("button", { name: "确认隐藏" }).click();
    await expect(adminCard.getByText("已隐藏", { exact: true })).toBeVisible();

    await anonymousPage.goto(`/poems/${poemId}`);
    await expect(anonymousPage.getByText("这条评论已被管理员隐藏。"))
      .toBeVisible();
    await expect(anonymousPage.getByText(replyBody, { exact: true })).toBeVisible();
    await readerPage.reload();
    await expect(readerPage.getByText(editedRootBody, { exact: true })).toBeVisible();
    await expect(readerPage.getByText("管理员处理原因：E2E 评论治理原因"))
      .toBeVisible();

    await adminPage.reload();
    await waitForHydration(adminPage, "main button");
    const hiddenCard = adminPage
      .locator('[data-slot="card"]')
      .filter({ hasText: editedRootBody.split("\n")[0] })
      .first();
    const restoreDialog = await openReasonDialog(
      adminPage,
      hiddenCard.getByRole("button", { name: "恢复", exact: true }),
    );
    await restoreDialog.getByLabel("原因").fill("E2E 复核恢复");
    await restoreDialog.getByRole("button", { name: "确认恢复" }).click();
    await expect(hiddenCard.getByText("可见", { exact: true })).toBeVisible();
  });

  test("soft deletion keeps replies and blocks new replies", async () => {
    await readerPage.goto(`/poems/${poemId}`);
    await waitForHydration(readerPage, "main article button");
    const root = commentByText(readerPage, editedRootBody);
    await root.getByRole("button", { name: "删除", exact: true }).click();
    const dialog = readerPage.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "确认删除" }).click();
    await expect(dialog).toBeHidden();
    const placeholder = commentByText(readerPage, "这条评论已由作者删除。");
    await expect(placeholder).toBeVisible();
    await expect(placeholder.getByRole("button", { name: "回复", exact: true }))
      .toHaveCount(0);
    await expect(readerPage.getByText(replyBody, { exact: true })).toBeVisible();
  });

  test("root and reply cursors load more and layouts do not overflow", async () => {
    const fixtures = await createCommentPaginationFixtures(poemId, readerEmail);
    await readerPage.goto(`/poems/${poemId}`);
    await waitForHydration(readerPage, "main button");
    await expect(readerPage.getByText(fixtures.oldestRootBody, { exact: true }))
      .toHaveCount(0);
    await readerPage.getByRole("button", { name: "加载更多评论" }).click();
    await expect(readerPage.getByText(fixtures.oldestRootBody, { exact: true }))
      .toBeVisible();

    await readerPage.goto(
      `/poems/${poemId}/comments/${fixtures.replyRootId}`,
    );
    await waitForHydration(readerPage, "main button");
    await expect(readerPage.getByText(fixtures.oldestReplyBody, { exact: true }))
      .toHaveCount(0);
    await readerPage.getByRole("button", { name: "加载更早回复" }).click();
    await expect(readerPage.getByText(fixtures.oldestReplyBody, { exact: true }))
      .toBeVisible();

    for (const width of [390, 1024, 1440]) {
      await readerPage.setViewportSize({ width, height: 900 });
      await readerPage.goto(`/poems/${poemId}`);
      const dimensions = await readerPage.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });
});
