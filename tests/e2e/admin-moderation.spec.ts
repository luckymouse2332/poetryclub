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
  auditContainsText,
  countActiveAdmins,
  countAuditEntries,
  createTestInvitation,
  getUserAuthorityByEmail,
  getUserIdByEmail,
  listOtherActiveAdmins,
} from "./helpers/database";

const PASSWORD = "password123";

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

async function signIn(
  page: Page,
  email: string,
  password: string,
  next = "/",
): Promise<void> {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await page.waitForURL(new RegExp(`${next.replaceAll("/", "\\/")}$`));
}

async function registerAndSignIn(
  page: Page,
  name: string,
  email: string,
  next = "/account/poems",
): Promise<void> {
  const inviteCode = await createTestInvitation();
  await page.goto(`/login?mode=sign-up&next=${encodeURIComponent(next)}`);
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
  await page.waitForURL(new RegExp(`${next.replaceAll("/", "\\/")}$`));
}

async function createPublishedPoem(
  page: Page,
  title: string,
): Promise<string> {
  await page.goto("/account/poems/new");
  await waitForHydration(page, "main form button[type=submit]");
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("正文").fill("治理测试正文第一行。\n\n治理测试正文第二行。");
  await page.getByRole("radio", { name: "公开", exact: true }).click();
  await page.getByRole("button", { name: "保存草稿" }).click();
  await page.waitForURL(/\/account\/poems\/[0-9a-f-]+\/edit\?created=1$/);
  const id = new URL(page.url()).pathname.split("/")[3] ?? "";
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await page.waitForURL(`/poems/${id}`);
  return id;
}

function cardByText(page: Page, text: string) {
  return page.locator('[data-slot="card"]').filter({ hasText: text });
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

async function submitReasonDialog(
  page: Page,
  trigger: string,
  confirm: string,
  reason: string,
): Promise<void> {
  const dialog = await openReasonDialog(
    page,
    page.getByRole("button", { name: trigger, exact: true }),
  );
  await dialog.getByLabel("原因").fill(reason);
  await dialog.getByRole("button", { name: confirm, exact: true }).click();
  await expect(dialog).toHaveCount(0);
}

test.setTimeout(180_000);

test("anonymous users are redirected away from the administrator area", async ({
  request,
}) => {
  const response = await request.get("/admin", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const location = new URL(
    response.headers()["location"] ?? "/",
    "http://playwright.test",
  );
  expect(location.pathname).toBe("/login");
  expect(location.searchParams.get("next")).toBe("/admin");
});

test.describe.serial("administrator authorization and governance", () => {
  let adminContext: BrowserContext;
  let memberContext: BrowserContext;
  let adminPage: Page;
  let memberPage: Page;
  let poemId: string;

  const memberName = uniqueValue("治理成员");
  const memberEmail = `${uniqueValue("moderation-member")}@example.com`;
  const poemTitle = uniqueValue("待治理诗作");
  const hiddenReason = "包含不适合公开展示的个人信息。";

  test.beforeAll(async ({ browser }) => {
    adminContext = await browser.newContext();
    memberContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    memberPage = await memberContext.newPage();
    await signIn(adminPage, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, "/admin");
    await registerAndSignIn(memberPage, memberName, memberEmail);
    poemId = await createPublishedPoem(memberPage, poemTitle);
  });

  test.afterAll(async () => {
    await Promise.all([adminContext?.close(), memberContext?.close()]);
  });

  test("members receive 403 and cannot invoke a captured administrator action", async () => {
    const denied = await memberPage.request.get("/admin");
    expect(denied.status()).toBe(403);
    await memberPage.goto("/");
    await expect(
      memberPage.getByRole("navigation").getByRole("link", { name: "管理" }),
    ).toHaveCount(0);

    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(poemTitle)}`);
    const card = cardByText(adminPage, poemTitle);
    const hideButton = card.getByRole("button", { name: "隐藏", exact: true });
    await waitForHydratedLocator(hideButton);
    const adminCookies = await adminContext.cookies();
    const memberCookies = await memberContext.cookies();
    await adminContext.clearCookies();
    await adminContext.addCookies(memberCookies);
    await hideButton.click();
    const dialog = adminPage.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("原因").fill("伪造管理员参数");
    await dialog.getByRole("button", { name: "确认隐藏" }).click();
    await expect(dialog.getByRole("alert")).toContainText("没有执行此管理操作的权限");
    expect((await adminPage.request.get(`/poems/${poemId}`)).status()).toBe(200);
    expect(await countAuditEntries("poem_hidden", poemId)).toBe(0);

    await adminContext.clearCookies();
    await adminContext.addCookies(adminCookies);
  });

  test("empty GET filter values do not turn valid admin filters into 404", async () => {
    await adminPage.goto("/admin/users?page=1&role=&status=suspended&q=");
    await expect(
      adminPage.getByRole("heading", { level: 1, name: "用户管理" }),
    ).toBeVisible();
    await expect(adminPage.getByLabel("账号状态")).toHaveValue("suspended");

    await adminPage.goto(
      "/admin/poems?page=1&status=&moderationStatus=hidden&q=",
    );
    await expect(
      adminPage.getByRole("heading", { level: 1, name: "诗作治理" }),
    ).toBeVisible();
    await expect(adminPage.getByLabel("治理状态")).toHaveValue("hidden");
  });

  test("user cards show the author's actual poem counts", async () => {
    await adminPage.goto(`/admin/users?q=${encodeURIComponent(memberEmail)}`);
    const memberCard = cardByText(adminPage, memberEmail);

    await expect(memberCard).toBeVisible();
    await expect(
      memberCard.getByText("草稿 0 · 已发布 1", { exact: true }),
    ).toBeVisible();
  });

  test("hiding is immediately private, survives author changes, and restore follows author status", async () => {
    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(poemTitle)}`);
    const card = cardByText(adminPage, poemTitle);
    const dialog = await openReasonDialog(
      adminPage,
      card.getByRole("button", { name: "隐藏", exact: true }),
    );
    await dialog.getByLabel("原因").fill(hiddenReason);
    await dialog.getByRole("button", { name: "确认隐藏" }).click();
    await expect(cardByText(adminPage, poemTitle).getByText("已隐藏", { exact: true })).toBeVisible();

    expect((await memberPage.request.get(`/poems/${poemId}`)).status()).toBe(404);
    await memberPage.goto("/poems");
    await expect(memberPage.getByText(poemTitle, { exact: true })).toHaveCount(0);
    await memberPage.goto("/");
    await expect(memberPage.getByText(poemTitle, { exact: true })).toHaveCount(0);

    await memberPage.goto(`/account/poems/${poemId}/edit`);
    await expect(memberPage.getByText("管理员已隐藏", { exact: true })).toBeVisible();
    await expect(memberPage.getByText(hiddenReason, { exact: false })).toBeVisible();
    await waitForHydration(memberPage, "main form button[type=submit]");
    await memberPage.getByRole("button", { name: "撤回", exact: true }).click();
    await memberPage.waitForURL(`/account/poems/${poemId}/edit?withdrawn=1`);
    await memberPage.getByRole("button", { name: "发布", exact: true }).click();
    await memberPage.waitForURL(`/account/poems/${poemId}/edit?published=1`);
    expect((await memberPage.request.get(`/poems/${poemId}`)).status()).toBe(404);
    expect(await countAuditEntries("poem_hidden", poemId)).toBe(1);

    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(poemTitle)}`);
    const restore = await openReasonDialog(
      adminPage,
      cardByText(adminPage, poemTitle).getByRole("button", {
        name: "恢复",
        exact: true,
      }),
    );
    await restore.getByLabel("原因").fill("作者已完成调整");
    await restore.getByRole("button", { name: "确认恢复" }).click();
    await expect(
      cardByText(adminPage, poemTitle).getByText("可见", { exact: true }),
    ).toBeVisible();
    expect((await memberPage.request.get(`/poems/${poemId}`)).status()).toBe(200);
    expect(await countAuditEntries("poem_restored", poemId)).toBe(1);

    await memberPage.goto(`/account/poems/${poemId}/edit`);
    await waitForHydration(memberPage, "main form button[type=submit]");
    await memberPage.getByRole("button", { name: "撤回", exact: true }).click();
    await memberPage.waitForURL(`/account/poems/${poemId}/edit?withdrawn=1`);
    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(poemTitle)}`);
    await submitReasonDialog(adminPage, "隐藏", "确认隐藏", "草稿治理验证");
    await adminPage.goto(`/admin/poems?q=${encodeURIComponent(poemTitle)}`);
    await submitReasonDialog(adminPage, "恢复", "确认恢复", "恢复草稿治理状态");
    expect((await memberPage.request.get(`/poems/${poemId}`)).status()).toBe(404);
  });

  test("suspension blocks the next poem write and restoration re-enables it", async () => {
    await memberPage.goto(`/account/poems/${poemId}/edit`);
    await waitForHydration(memberPage, "main form button[type=submit]");

    await adminPage.goto(`/admin/users?q=${encodeURIComponent(memberEmail)}`);
    const card = cardByText(adminPage, memberEmail);
    const dialog = await openReasonDialog(
      adminPage,
      card.getByRole("button", { name: "禁用用户", exact: true }),
    );
    await dialog.getByLabel("原因").fill("异常写入行为测试");
    await dialog.getByRole("button", { name: "确认禁用" }).click();

    await memberPage.getByRole("button", { name: "保存修改" }).click();
    await expect(
      memberPage.locator('main [role="alert"]').filter({ hasText: "账号已被禁用" }),
    ).toBeVisible();
    await memberPage.goto("/account");
    await expect(
      memberPage.locator('main [role="alert"]').filter({ hasText: "异常写入行为测试" }),
    ).toBeVisible();

    const memberId = await getUserIdByEmail(memberEmail);
    expect(await countAuditEntries("user_suspended", memberId)).toBe(1);
    await adminPage.goto(`/admin/users?q=${encodeURIComponent(memberEmail)}`);
    await submitReasonDialog(adminPage, "恢复用户", "确认恢复", "已确认恢复访问");
    expect(await countAuditEntries("user_restored", memberId)).toBe(1);

    await memberPage.goto(`/account/poems/${poemId}/edit`);
    await waitForHydration(memberPage, "main form button[type=submit]");
    await memberPage.getByRole("button", { name: "保存修改" }).click();
    await memberPage.waitForURL(`/account/poems/${poemId}/edit?saved=1`);
  });

  test("only an active administrator can create and disable invitations without leaking plaintext", async () => {
    await adminPage.goto("/admin/invitations");
    const createButton = adminPage.getByRole("button", { name: "创建邀请码" });
    await waitForHydratedLocator(createButton);
    const adminCookies = await adminContext.cookies();
    const memberCookies = await memberContext.cookies();
    await adminContext.clearCookies();
    await adminContext.addCookies(memberCookies);
    await adminPage.getByLabel("可用次数").fill("1");
    await adminPage.getByLabel("过期时间").fill("2030-01-01T12:00");
    await createButton.click();
    await expect(
      adminPage
        .locator('main [role="alert"]')
        .filter({ hasText: "没有执行此管理操作的权限" }),
    ).toBeVisible();

    await adminContext.clearCookies();
    await adminContext.addCookies(adminCookies);
    await adminPage.goto("/admin/invitations");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    await adminPage.getByLabel("可用次数").fill("2");
    await adminPage.getByLabel("过期时间").fill(expires);
    await adminPage.getByRole("button", { name: "创建邀请码" }).click();
    const code = await adminPage.locator("main code, main .font-mono").first().textContent();
    expect(code?.trim()).toMatch(/^[A-Za-z0-9_-]{32,128}$/);
    expect(await auditContainsText(code!.trim())).toBe(false);

    const firstCard = adminPage.locator('[data-slot="card"]').first();
    const disable = await openReasonDialog(
      adminPage,
      firstCard.getByRole("button", { name: "停用邀请码" }),
    );
    await disable.getByLabel("原因").fill("测试停用邀请码");
    await disable.getByRole("button", { name: "确认停用" }).click();
    await expect(adminPage.getByText("已停用", { exact: true }).first()).toBeVisible();
  });

  test("role changes are audited and a suspended administrator immediately loses access", async ({
    browser,
  }) => {
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondName = uniqueValue("第二管理员");
    const secondEmail = `${uniqueValue("second-admin")}@example.com`;
    try {
      await registerAndSignIn(secondPage, secondName, secondEmail, "/account");
      const secondId = await getUserIdByEmail(secondEmail);

      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "提升为管理员",
        "确认提升",
        "治理轮值测试",
      );
      expect(await countAuditEntries("user_promoted", secondId)).toBe(1);
      await secondPage.goto("/admin");
      await expect(
        secondPage.getByRole("heading", { level: 1, name: "管理后台" }),
      ).toBeVisible();

      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "禁用用户",
        "确认禁用",
        "管理员账号状态验证",
      );
      const denied = await secondPage.request.get("/admin");
      expect(denied.status()).toBe(403);

      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "恢复用户",
        "确认恢复",
        "恢复管理员测试账号",
      );
      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "降级为成员",
        "确认降级",
        "结束治理轮值测试",
      );
      expect(await countAuditEntries("user_demoted", secondId)).toBe(1);
      expect((await secondPage.request.get("/admin")).status()).toBe(403);
    } finally {
      await secondContext.close();
    }
  });

  test("self-operation and concurrent administrator removal cannot eliminate every active admin", async ({
    browser,
  }) => {
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondName = uniqueValue("并发管理员");
    const secondEmail = `${uniqueValue("concurrent-admin")}@example.com`;
    const suspendedExtras: string[] = [];
    try {
      await registerAndSignIn(secondPage, secondName, secondEmail, "/account");
      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "提升为管理员",
        "确认提升",
        "并发保护测试",
      );
      await secondPage.goto("/admin");

      // A stale card cannot be used to make the target administrator disable self.
      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      const primaryCookies = await adminContext.cookies();
      const secondCookies = await secondContext.cookies();
      const suspendSelfButton = cardByText(adminPage, secondEmail).getByRole(
        "button",
        { name: "禁用用户" },
      );
      await waitForHydratedLocator(suspendSelfButton);
      await adminContext.clearCookies();
      await adminContext.addCookies(secondCookies);
      const selfDialog = await openReasonDialog(adminPage, suspendSelfButton);
      await selfDialog.getByLabel("原因").fill("伪造自我禁用");
      await selfDialog.getByRole("button", { name: "确认禁用" }).click();
      await expect(selfDialog.getByRole("alert")).toContainText("不能对自己的管理员身份");
      await selfDialog.getByRole("button", { name: "取消" }).click();
      const selfDemotion = await openReasonDialog(
        adminPage,
        cardByText(adminPage, secondEmail).getByRole("button", {
          name: "降级为成员",
        }),
      );
      await selfDemotion.getByLabel("原因").fill("伪造自我降级");
      await selfDemotion.getByRole("button", { name: "确认降级" }).click();
      await expect(selfDemotion.getByRole("alert")).toContainText(
        "不能对自己的管理员身份",
      );
      await adminContext.clearCookies();
      await adminContext.addCookies(primaryCookies);

      // Reversibly suspend unrelated active admins so this test reaches the
      // exact two-admin boundary even in a reused local E2E database.
      const extras = await listOtherActiveAdmins([E2E_ADMIN_EMAIL, secondEmail]);
      for (const email of extras) {
        await adminPage.goto(`/admin/users?q=${encodeURIComponent(email)}`);
        await submitReasonDialog(
          adminPage,
          "禁用用户",
          "确认禁用",
          "并发测试临时隔离（测试后恢复）",
        );
        suspendedExtras.push(email);
      }
      expect(await countActiveAdmins()).toBe(2);

      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      const primaryDialog = await openReasonDialog(
        adminPage,
        cardByText(adminPage, secondEmail).getByRole("button", {
          name: "禁用用户",
        }),
      );
      await primaryDialog.getByLabel("原因").fill("并发移除第二管理员");

      await secondPage.goto(`/admin/users?q=${encodeURIComponent(E2E_ADMIN_EMAIL)}`);
      const secondDialog = await openReasonDialog(
        secondPage,
        cardByText(secondPage, E2E_ADMIN_EMAIL).getByRole("button", {
          name: "禁用用户",
        }),
      );
      await secondDialog.getByLabel("原因").fill("并发移除第一管理员");

      await Promise.allSettled([
        primaryDialog.getByRole("button", { name: "确认禁用" }).click(),
        secondDialog.getByRole("button", { name: "确认禁用" }).click(),
      ]);
      await expect.poll(() => countActiveAdmins()).toBe(1);
      const primary = await getUserAuthorityByEmail(E2E_ADMIN_EMAIL);
      const second = await getUserAuthorityByEmail(secondEmail);
      expect([primary.status, second.status].sort()).toEqual(["active", "suspended"]);

      const survivorPage = primary.status === "active" ? adminPage : secondPage;
      const restoreEmails = [
        ...(primary.status === "suspended" ? [E2E_ADMIN_EMAIL] : []),
        ...(second.status === "suspended" ? [secondEmail] : []),
        ...suspendedExtras,
      ];
      for (const email of restoreEmails) {
        await survivorPage.goto(`/admin/users?q=${encodeURIComponent(email)}`);
        await submitReasonDialog(
          survivorPage,
          "恢复用户",
          "确认恢复",
          "并发保护测试清理",
        );
      }

      // Primary is active again; return the temporary second account to member.
      await adminPage.goto(`/admin/users?q=${encodeURIComponent(secondEmail)}`);
      await submitReasonDialog(
        adminPage,
        "降级为成员",
        "确认降级",
        "并发保护测试结束",
      );
    } finally {
      // Best-effort cleanup is intentionally performed through audited admin UI
      // above; contexts can always be closed without exposing credentials.
      await secondContext.close();
    }
  });
});
