import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

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
  next = "/account/poems",
): Promise<void> {
  await page.goto(`/login?mode=sign-up&next=${encodeURIComponent(next)}`);
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("昵称").fill(name);
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByRole("button", { name: "创建账号" }).click();
  await expect(
    page.getByText("注册请求已完成，请使用邮箱和密码登录。"),
  ).toBeVisible();

  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL(new RegExp(`${next.replaceAll("/", "\\/")}$`));
}

type SessionCookie = Awaited<ReturnType<BrowserContext["cookies"]>>[number];

async function getSessionCookie(page: Page): Promise<SessionCookie> {
  const cookie = (await page.context().cookies()).find((item) =>
    item.name.endsWith("session_token"),
  );
  expect(cookie).toBeTruthy();
  return cookie!;
}

async function gotoHydratedEdit(page: Page, poemId: string): Promise<void> {
  await page.goto(`/account/poems/${poemId}/edit`);
  await waitForHydration(page, "main form button[type=submit]");
}

function actionError(page: Page) {
  return page.locator('main p[role="alert"]').filter({ hasText: "操作未完成" });
}

test("anonymous users cannot access poem management", async ({ page }) => {
  const response = await page.request.get("/account/poems", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  const location = new URL(
    response.headers()["location"] ?? "/",
    "http://playwright.test",
  );
  expect(location.pathname).toBe("/login");
  expect(location.searchParams.get("next")).toBe("/account/poems");
});

test.describe.serial("poem publishing and authorization loop", () => {
  let authorPage: Page;
  let otherPage: Page;
  let staleActionPage: Page;
  let authorContext: BrowserContext;
  let otherContext: BrowserContext;
  let poemId: string;
  let otherDraftId: string;
  let authorSessionCookie: SessionCookie;
  let otherSessionCookie: SessionCookie;

  const authorName = uniqueValue("作者");
  const authorEmail = `${uniqueValue("poem-author")}@example.com`;
  const otherName = uniqueValue("另一位作者");
  const otherEmail = `${uniqueValue("poem-other")}@example.com`;
  const title = uniqueValue("换行测试诗");
  const changedTitle = `${title}-越权修改`;
  const body = `第一行\n\n第二行\n${"长句".repeat(130)}\n结尾标记-${uniqueValue("tail")}`;

  test.beforeAll(async ({ browser }) => {
    authorContext = await browser.newContext();
    otherContext = await browser.newContext();
    authorPage = await authorContext.newPage();
    otherPage = await otherContext.newPage();
  });

  test.afterAll(async () => {
    await Promise.all([authorContext?.close(), otherContext?.close()]);
  });

  test("creates one private draft from a repeated creation submission", async () => {
    await registerAndSignIn(authorPage, authorName, authorEmail);
    authorSessionCookie = await getSessionCookie(authorPage);
    await authorPage.goto("/account/poems/new");
    await waitForHydration(authorPage, "form button[type=submit]");

    const duplicateTitle = uniqueValue("幂等草稿");
    await authorPage.getByLabel("标题").fill(duplicateTitle);
    await authorPage.getByLabel("正文").fill("同一张表单重复提交。\n第二行。");
    await authorPage.getByRole("button", { name: "保存草稿" }).evaluate(
      (button) => {
        (button as HTMLButtonElement).click();
        (button as HTMLButtonElement).click();
      },
    );
    await authorPage.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
    await authorPage.goto("/account/poems");

    await expect(authorPage.getByText(duplicateTitle, { exact: true })).toHaveCount(1);
  });

  test("saves a draft with exact line breaks and keeps it out of public reads", async () => {
    await authorPage.goto("/account/poems/new");
    await waitForHydration(authorPage, "form button[type=submit]");
    await authorPage.getByLabel("标题").fill(title);
    await authorPage.getByLabel("正文").fill(body);
    await authorPage.getByLabel("创作背景").fill("一次换行保存测试。\n背景第二行。");
    await authorPage.getByLabel("事件日期").fill("2026-08-02");
    await authorPage.getByRole("button", { name: "保存草稿" }).click();
    await authorPage.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);

    poemId = new URL(authorPage.url()).pathname.split("/")[3] ?? "";
    expect(poemId).toMatch(/^[0-9a-f-]{36}$/);
    await expect(authorPage.getByLabel("正文")).toHaveValue(body);

    const anonymousDraft = await authorPage.context().browser()!.newPage();
    const anonymousResponse = await anonymousDraft.request.get(`/poems/${poemId}`);
    expect(anonymousResponse.status()).toBe(404);
    await anonymousDraft.goto("/poems");
    await expect(anonymousDraft.getByText(title, { exact: true })).toHaveCount(0);
    await anonymousDraft.close();

    staleActionPage = await authorPage.context().newPage();
    await gotoHydratedEdit(staleActionPage, poemId);
  });

  test("rejects anonymous and cross-user draft mutations", async () => {
    await authorPage.context().clearCookies();
    await authorPage.getByLabel("标题").fill(`${title}-匿名修改`);
    await authorPage.getByRole("button", { name: "保存修改" }).click();
    await authorPage.waitForURL(/\/login\?next=%2Faccount%2Fpoems$/);

    await authorPage.context().addCookies([authorSessionCookie]);
    await gotoHydratedEdit(authorPage, poemId);
    await expect(authorPage.getByLabel("标题")).toHaveValue(title);

    await authorPage.context().clearCookies();
    await authorPage.getByRole("button", { name: "发布", exact: true }).click();
    await authorPage.waitForURL(/\/login\?next=%2Faccount%2Fpoems$/);

    await authorPage.context().addCookies([authorSessionCookie]);
    await gotoHydratedEdit(authorPage, poemId);
    await authorPage.context().clearCookies();
    await authorPage.getByRole("button", { name: "删除草稿" }).click();
    await authorPage.getByRole("button", { name: "确认删除草稿" }).click();
    await authorPage.waitForURL(/\/login\?next=%2Faccount%2Fpoems$/);

    await authorPage.context().addCookies([authorSessionCookie]);
    await gotoHydratedEdit(authorPage, poemId);
    await expect(authorPage.getByText("草稿", { exact: true })).toBeVisible();

    await registerAndSignIn(otherPage, otherName, otherEmail);
    otherSessionCookie = await getSessionCookie(otherPage);
    const forbiddenRead = await otherPage.request.get(
      `/account/poems/${poemId}/edit`,
    );
    expect(forbiddenRead.status()).toBe(404);

    await authorPage.context().addCookies([otherSessionCookie]);
    await authorPage.getByLabel("标题").fill(changedTitle);
    await authorPage.getByRole("button", { name: "保存修改" }).click();
    await expect(actionError(authorPage)).toContainText("操作未完成");

    await authorPage.getByRole("button", { name: "发布", exact: true }).click();
    await expect(actionError(authorPage)).toContainText("操作未完成");

    await authorPage.getByRole("button", { name: "删除草稿" }).click();
    await authorPage.getByRole("button", { name: "确认删除草稿" }).click();
    await expect(
      authorPage.getByRole("alertdialog").getByRole("alert"),
    ).toContainText("操作未完成");

    await authorPage.context().addCookies([authorSessionCookie]);
    await gotoHydratedEdit(authorPage, poemId);
    await expect(authorPage.getByLabel("标题")).toHaveValue(title);
    await expect(authorPage.getByText("草稿", { exact: true })).toBeVisible();

    await otherPage.goto("/account/poems/new");
    await waitForHydration(otherPage, "form button[type=submit]");
    await otherPage.getByLabel("标题").fill(uniqueValue("他人草稿"));
    await otherPage.getByLabel("正文").fill("这是另一位用户的私有草稿。");
    await otherPage.getByRole("button", { name: "保存草稿" }).click();
    await otherPage.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
    otherDraftId = new URL(otherPage.url()).pathname.split("/")[3] ?? "";

    const authorCannotReadOther = await authorPage.request.get(
      `/account/poems/${otherDraftId}/edit`,
    );
    expect(authorCannotReadOther.status()).toBe(404);
  });

  test("publishes publicly, preserves full text, and rejects draft-only deletion", async () => {
    await gotoHydratedEdit(authorPage, poemId);
    await authorPage.getByRole("button", { name: "发布", exact: true }).click();
    await authorPage.waitForURL(`/poems/${poemId}`);

    await expect(authorPage.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const articleText = await authorPage.locator("article").textContent();
    // HTML form submission canonicalizes textarea line endings to CRLF. The
    // semantic line/blank-line structure must remain identical after display.
    expect(articleText?.replaceAll("\r\n", "\n")).toBe(body);

    await authorPage.goto("/poems");
    await expect(authorPage.getByText(title, { exact: true })).toBeVisible();
    await expect(authorPage.getByText(body.slice(-35), { exact: false })).toHaveCount(0);

    await staleActionPage.getByRole("button", { name: "发布", exact: true }).click();
    await expect(actionError(staleActionPage)).toContainText("操作未完成");
    await staleActionPage.getByRole("button", { name: "删除草稿" }).click();
    await staleActionPage
      .getByRole("button", { name: "确认删除草稿" })
      .click();
    await expect(
      staleActionPage.getByRole("alertdialog").getByRole("alert"),
    ).toContainText("操作未完成");
    const stillPublic = await authorPage.request.get(`/poems/${poemId}`);
    expect(stillPublic.status()).toBe(200);
  });

  test("prevents another user from withdrawing, then owner withdraws immediately", async () => {
    await gotoHydratedEdit(authorPage, poemId);
    await authorPage.context().addCookies([otherSessionCookie]);
    await authorPage.getByRole("button", { name: "撤回", exact: true }).click();
    await expect(actionError(authorPage)).toContainText("操作未完成");
    expect((await otherPage.request.get(`/poems/${poemId}`)).status()).toBe(200);

    await authorPage.context().addCookies([authorSessionCookie]);
    await gotoHydratedEdit(authorPage, poemId);
    await gotoHydratedEdit(staleActionPage, poemId);
    await authorPage.getByRole("button", { name: "撤回", exact: true }).click();
    await authorPage.waitForURL(
      `/account/poems/${poemId}/edit?withdrawn=1`,
    );
    await expect(
      authorPage.getByText("作品已撤回，回到草稿状态，仅自己可见。"),
    ).toBeVisible();

    expect((await authorPage.request.get(`/poems/${poemId}`)).status()).toBe(404);
    await authorPage.goto("/poems");
    await expect(authorPage.getByText(title, { exact: true })).toHaveCount(0);

    await staleActionPage.getByRole("button", { name: "撤回", exact: true }).click();
    await expect(actionError(staleActionPage)).toContainText("操作未完成");
    await gotoHydratedEdit(authorPage, poemId);
    await expect(authorPage.getByText("草稿", { exact: true })).toBeVisible();
  });

  test("deletes only after the work is a draft and keeps M1 logout working", async () => {
    await authorPage.getByRole("button", { name: "删除草稿" }).click();
    await authorPage.getByRole("button", { name: "确认删除草稿" }).click();
    await authorPage.waitForURL("/account/poems?deleted=1");
    await expect(authorPage.getByText("草稿已删除。")).toBeVisible();
    expect(
      (await authorPage.request.get(`/account/poems/${poemId}/edit`)).status(),
    ).toBe(404);

    await authorPage.getByRole("button", { name: "登出" }).click();
    await authorPage.waitForURL("/");
    await authorPage.goto("/account/poems");
    await authorPage.waitForURL(/\/login\?next=%2Faccount%2Fpoems$/);
  });
});

test.describe.serial("own poems list discoverability and inline actions", () => {
  let context: BrowserContext;
  let page: Page;
  let draftTitle: string;
  let poemId: string;

  const authorName = uniqueValue("列表操作作者");
  const authorEmail = `${uniqueValue("poem-list-actions")}@example.com`;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  /** 按标题定位管理列表卡片，避免其他草稿/作品导致按钮歧义。 */
  function cardByTitle(title: string) {
    return page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByRole("heading", { name: title }) });
  }

  /** 打开列表并等待状态按钮（useActionState 表单）完成 hydration。 */
  async function gotoListHydrated(): Promise<void> {
    await page.goto("/account/poems");
    await waitForHydration(page, "main form button[type=submit]");
  }

  test("draft card shows 编辑/发布/删除草稿 directly on the list", async () => {
    await registerAndSignIn(page, authorName, authorEmail);
    await page.goto("/account/poems/new");
    await waitForHydration(page, "form button[type=submit]");
    draftTitle = uniqueValue("列表操作草稿");
    await page.getByLabel("标题").fill(draftTitle);
    await page.getByLabel("正文").fill("从我的诗作列表直接管理状态。");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await page.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
    poemId = new URL(page.url()).pathname.split("/")[3] ?? "";
    expect(poemId).toMatch(/^[0-9a-f-]{36}$/);

    await gotoListHydrated();
    const card = cardByTitle(draftTitle);
    await expect(card.getByRole("link", { name: "编辑" })).toBeVisible();
    await expect(
      card.getByRole("button", { name: "发布", exact: true }),
    ).toBeVisible();
    await expect(card.getByRole("button", { name: "删除草稿" })).toBeVisible();
    await expect(card.getByRole("link", { name: "查看公开页" })).toHaveCount(0);
    await expect(
      card.getByRole("button", { name: "撤回", exact: true }),
    ).toHaveCount(0);

    // 390px 下卡片操作区换行排列，页面不产生水平滚动。
    await page.setViewportSize({ width: 390, height: 844 });
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });

  test("publishing from the list card lands on the public page", async () => {
    await gotoListHydrated();
    await cardByTitle(draftTitle)
      .getByRole("button", { name: "发布", exact: true })
      .click();
    await page.waitForURL(`/poems/${poemId}`);
    await expect(
      page.getByRole("heading", { level: 1, name: draftTitle }),
    ).toBeVisible();

    await gotoListHydrated();
    const card = cardByTitle(draftTitle);
    await expect(card.getByRole("link", { name: "编辑" })).toBeVisible();
    await expect(card.getByRole("link", { name: "查看公开页" })).toBeVisible();
    await expect(
      card.getByRole("button", { name: "撤回", exact: true }),
    ).toBeVisible();
    await expect(
      card.getByRole("button", { name: "发布", exact: true }),
    ).toHaveCount(0);
    await expect(card.getByRole("button", { name: "删除草稿" })).toHaveCount(0);
  });

  test("withdrawing from the list card returns the work to draft", async () => {
    await gotoListHydrated();
    await cardByTitle(draftTitle)
      .getByRole("button", { name: "撤回", exact: true })
      .click();
    await page.waitForURL(`/account/poems/${poemId}/edit?withdrawn=1`);
    await expect(
      page.getByText("作品已撤回，回到草稿状态，仅自己可见。"),
    ).toBeVisible();
    expect((await page.request.get(`/poems/${poemId}`)).status()).toBe(404);

    await gotoListHydrated();
    const card = cardByTitle(draftTitle);
    await expect(
      card.getByRole("button", { name: "发布", exact: true }),
    ).toBeVisible();
    await expect(card.getByRole("link", { name: "查看公开页" })).toHaveCount(0);
  });
});
