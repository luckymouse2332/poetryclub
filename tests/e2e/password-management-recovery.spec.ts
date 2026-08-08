import { expect, test, type Page } from "@playwright/test";

import { createTestInvitation, expirePasswordResetUrl } from "./helpers/database";
import {
  countEmailTestMessages,
  waitForPasswordResetEmail,
} from "./helpers/email-outbox";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}@example.com`;
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

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login?next=/account");
  await waitForHydration(page, "#auth-form-panel button[type=submit]");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    })),
  ).toEqual(expect.objectContaining({ content: expect.any(Number) }));
  const width = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
}

test("anonymous users cannot access account security", async ({ page }) => {
  const response = await page.request.get("/account/security", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const location = new URL(
    response.headers()["location"] ?? "/",
    "http://playwright.test",
  );
  expect(location.pathname).toBe("/login");
  expect(location.searchParams.get("next")).toBe("/account/security");
});

test.describe.serial("password management and recovery loop", () => {
  const email = uniqueEmail("password-loop");
  const oldPassword = "password123";
  const changedPassword = "changed-password-123";
  const resetPassword = "reset-password-456";
  let currentPage: Page;
  let otherPage: Page;
  let resetUrl: string;

  test.beforeAll(async ({ browser, request }) => {
    const invitation = await createTestInvitation();
    const registered = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "密码闭环测试成员",
        email,
        password: oldPassword,
        inviteCode: invitation,
      },
    });
    expect(registered.status()).toBe(200);

    currentPage = await browser.newPage();
    otherPage = await browser.newPage();
    await signIn(currentPage, email, oldPassword);
    await currentPage.waitForURL(/\/account$/);
    await signIn(otherPage, email, oldPassword);
    await otherPage.waitForURL(/\/account$/);
  });

  test.afterAll(async () => {
    await currentPage?.close();
    await otherPage?.close();
  });

  test("account security form validates locally and exposes correct password semantics", async () => {
    await currentPage.goto("/account/security");
    await waitForHydration(currentPage, "form button[type=submit]");

    await expect(currentPage.getByLabel(/^当前密码/)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    await expect(currentPage.getByLabel(/^新密码/)).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    await expect(
      currentPage.getByLabel(/^确认新密码/),
    ).toHaveAttribute("autocomplete", "new-password");

    let changeRequests = 0;
    const countChangeRequest = (request: { url(): string }) => {
      if (new URL(request.url()).pathname === "/api/auth/change-password") {
        changeRequests += 1;
      }
    };
    currentPage.on("request", countChangeRequest);

    await currentPage.getByLabel(/^当前密码/).fill(oldPassword);
    await currentPage.getByLabel(/^新密码/).fill(changedPassword);
    await currentPage
      .getByLabel(/^确认新密码/)
      .fill("different-password-123");
    await currentPage.getByRole("button", { name: "更新密码" }).click();
    await expect(currentPage.getByText("两次输入的新密码不一致")).toBeVisible();
    expect(changeRequests).toBe(0);

    await currentPage.getByLabel(/^新密码/).fill("short");
    await currentPage.getByLabel(/^确认新密码/).fill("short");
    await currentPage.getByRole("button", { name: "更新密码" }).click();
    await expect(currentPage.getByText("密码至少需要 8 个字符")).toBeVisible();
    expect(changeRequests).toBe(0);
    currentPage.off("request", countChangeRequest);
  });

  test("a wrong current password does not change the password", async () => {
    await currentPage.getByLabel(/^当前密码/).fill("wrong-password");
    await currentPage.getByLabel(/^新密码/).fill(changedPassword);
    await currentPage
      .getByLabel(/^确认新密码/)
      .fill(changedPassword);
    await currentPage.getByRole("button", { name: "更新密码" }).click();
    await expect(currentPage.getByText("当前密码不正确")).toBeVisible();

    const checkPage = await currentPage.context().browser()!.newPage();
    await signIn(checkPage, email, oldPassword);
    await checkPage.waitForURL(/\/account$/);
    await checkPage.close();
  });

  test("changing the password preserves the current browser and revokes other sessions", async () => {
    await currentPage.getByLabel(/^当前密码/).fill(oldPassword);
    await currentPage.getByLabel(/^新密码/).fill(changedPassword);
    await currentPage
      .getByLabel(/^确认新密码/)
      .fill(changedPassword);
    await currentPage.getByRole("button", { name: "更新密码" }).click();
    await expect(
      currentPage.getByText("密码已更新，其他已登录设备的会话已经撤销。"),
    ).toBeVisible();
    await expect(currentPage.getByLabel(/^当前密码/)).toHaveValue("");

    await currentPage.reload();
    await expect(
      currentPage.getByRole("heading", { level: 1, name: "修改密码" }),
    ).toBeVisible();

    await otherPage.goto("/account");
    await otherPage.waitForURL(/\/login/);
    await waitForHydration(otherPage, "#auth-form-panel button[type=submit]");

    await otherPage.getByLabel("邮箱").fill(email);
    await otherPage.getByLabel("密码").fill(oldPassword);
    await otherPage.getByRole("button", { name: "登录", exact: true }).click();
    await expect(otherPage.getByText("操作失败，请检查输入后重试。"))
      .toBeVisible();

    await otherPage.getByLabel("密码").fill(changedPassword);
    await otherPage.getByRole("button", { name: "登录", exact: true }).click();
    await otherPage.waitForURL(/\/account$/);
  });

  test("forgot-password responses are equivalent and use the controlled outbox", async ({
    browser,
  }) => {
    const page = await browser.newPage();
    const beforeExisting = await countEmailTestMessages();
    await page.goto("/forgot-password");
    await waitForHydration(page, "form button[type=submit]");
    await expect(page.getByLabel("邮箱")).toHaveAttribute("autocomplete", "email");

    await page.route(
      "**/api/auth/request-password-reset",
      async (route) => {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
        await route.continue();
      },
      { times: 1 },
    );
    await page.getByLabel("邮箱").fill(`  ${email.toUpperCase()}  `);
    await page.getByRole("button", { name: "发送重置邮件" }).click();
    await expect(page.getByRole("button", { name: "正在提交…" })).toBeDisabled();
    const existingMessage = page.getByText(
      "如果该邮箱已注册，我们会发送一封密码重置邮件。",
    );
    await expect(existingMessage).toBeVisible();
    const existingSuccessText = await existingMessage.textContent();
    expect(existingSuccessText).not.toBeNull();
    resetUrl = (await waitForPasswordResetEmail(email, beforeExisting)).resetUrl;

    await page.goto("/forgot-password");
    await waitForHydration(page, "form button[type=submit]");
    await page.getByLabel("邮箱").fill(uniqueEmail("missing-password"));
    await page.getByRole("button", { name: "发送重置邮件" }).click();
    await expect(
      page.getByText("如果该邮箱已注册，我们会发送一封密码重置邮件。"),
    ).toHaveText(existingSuccessText!);
    await page.close();
  });

  test("a valid reset token changes the password, revokes every old session, and is single-use", async ({
    browser,
  }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(resetUrl);
    await waitForHydration(page, "form button[type=submit]");
    await page.waitForURL(/\/reset-password$/);
    await expect(page.getByLabel(/^新密码/)).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    await expectNoHorizontalOverflow(page);

    let resetRequests = 0;
    const countResetRequest = (request: { url(): string }) => {
      if (new URL(request.url()).pathname === "/api/auth/reset-password") {
        resetRequests += 1;
      }
    };
    page.on("request", countResetRequest);
    await page.getByLabel(/^新密码/).fill(resetPassword);
    await page
      .getByLabel(/^确认新密码/)
      .fill("different-reset-password");
    await page.getByRole("button", { name: "设置新密码" }).click();
    await expect(page.getByText("两次输入的新密码不一致")).toBeVisible();
    expect(resetRequests).toBe(0);

    await page.getByLabel(/^确认新密码/).fill(resetPassword);
    await page.getByRole("button", { name: "设置新密码" }).click();
    await page.waitForURL(/\/login$/);
    await expect(page.getByText("密码已重置，请使用新密码登录。"))
      .toBeVisible();
    await waitForHydration(page, "#auth-form-panel button[type=submit]");
    expect(resetRequests).toBe(1);
    page.off("request", countResetRequest);

    for (const oldSessionPage of [currentPage, otherPage]) {
      await oldSessionPage.goto("/account");
      await oldSessionPage.waitForURL(/\/login/);
    }

    await page.getByLabel("邮箱").fill(email);
    await page.getByLabel("密码").fill(changedPassword);
    await page.getByRole("button", { name: "登录", exact: true }).click();
    await expect(page.getByText("操作失败，请检查输入后重试。"))
      .toBeVisible();

    await page.getByLabel("密码").fill(resetPassword);
    await page.getByRole("button", { name: "登录", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await page.goto("/account");
    await expect(
      page.getByRole("heading", { level: 1, name: "账户" }),
    ).toBeVisible();

    const reused = await browser.newPage();
    await reused.goto(resetUrl);
    await reused.waitForURL(/\/reset-password\?error=INVALID_TOKEN/);
    await expect(
      reused.getByText("这个重置链接无效、已过期或已经使用，请重新申请。"),
    ).toBeVisible();
    await expect(reused.getByRole("button", { name: "设置新密码" })).toHaveCount(0);
    await reused.close();
    await page.close();
  });

  test("missing, invalid, and expired reset tokens cannot submit", async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/reset-password");
    await expect(page.getByText("重置链接不完整，请重新申请密码重置邮件。"))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "设置新密码" })).toHaveCount(0);

    await page.goto(`/reset-password?token=${"invalid".repeat(5)}`);
    await expect(
      page.getByText("这个重置链接无效、已过期或已经使用，请重新申请。"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "设置新密码" })).toHaveCount(0);

    const beforeExpired = await countEmailTestMessages();
    const requestPage = await browser.newPage();
    await requestPage.goto("/forgot-password");
    await waitForHydration(requestPage, "form button[type=submit]");
    await requestPage.getByLabel("邮箱").fill(email);
    await requestPage.getByRole("button", { name: "发送重置邮件" }).click();
    const expiredUrl = (await waitForPasswordResetEmail(email, beforeExpired)).resetUrl;
    await expirePasswordResetUrl(expiredUrl);
    await page.goto(expiredUrl);
    await page.waitForURL(/\/reset-password\?error=INVALID_TOKEN/);
    await expect(
      page.getByText("这个重置链接无效、已过期或已经使用，请重新申请。"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "设置新密码" })).toHaveCount(0);
    await requestPage.close();
    await page.close();
  });
});
