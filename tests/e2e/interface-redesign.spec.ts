import { artifactPath } from "./helpers/artifacts";
import { expect, test, type Page } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
import { createCommentPaginationFixtures, createHomePoemVisibilityFixtures, deletePoemsByIds } from "./helpers/database";

test.describe.serial("paper poetry journal layout", () => {
  let fixture: Awaited<ReturnType<typeof createHomePoemVisibilityFixtures>>;
  let comments: Awaited<ReturnType<typeof createCommentPaginationFixtures>>;

  test.beforeAll(async () => {
    fixture = await createHomePoemVisibilityFixtures();
    comments = await createCommentPaginationFixtures(fixture.visible.id, E2E_ADMIN_EMAIL, true);
  });
  test.afterAll(async () => { if (fixture) await deletePoemsByIds(fixture.ids); });

  async function checkPage(page: Page, path: string, width: number) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(async () => { await document.fonts.ready; });
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll, path).toBeLessThanOrEqual(dimensions.client);
    if (["/poems", "/collections"].includes(path)) {
      await expect(page.getByRole("main").locator("section").first()).toHaveCSS("padding-top", "0px");
      await expect(page.getByRole("main").locator("section").first()).toHaveCSS("padding-bottom", "0px");
    }
    if (path.startsWith("/login") || ["/forgot-password", "/reset-password"].includes(path)) {
      const introduction = page.locator('[data-slot="auth-introduction"]');
      const formRegion = page.locator('[data-slot="auth-form-region"]');
      const introBox = await introduction.boundingBox();
      const formBox = await formRegion.boundingBox();
      expect(introBox).not.toBeNull();
      expect(formBox).not.toBeNull();
      expect(formBox!.width).toBeLessThanOrEqual(512);
      if (width >= 1024) {
        expect(introBox!.x + introBox!.width).toBeLessThan(formBox!.x);
        expect(Math.abs(introBox!.y + introBox!.height / 2 - formBox!.y - formBox!.height / 2)).toBeLessThan(1);
        expect(formBox!.width).toBeGreaterThan(380);
        await expect(introduction).toHaveCSS("border-bottom-width", "0px");
        await expect(introduction).toHaveCSS("border-right-width", "1px");
      } else {
        expect(introBox!.y + introBox!.height).toBeLessThan(formBox!.y);
        await expect(introduction).toHaveCSS("border-right-width", "0px");
      }
      if ([390, 1440].includes(width)) {
        const name = path.includes("sign-up") ? "register" : path.slice(1);
        await page.screenshot({ animations: "disabled", caret: "initial", fullPage: true, path: artifactPath(`paper-journal/${width}-split-${name}.png`) });
      }
    }
    if (["/admin/poems", "/admin/users", "/admin/invitations", "/admin/comments", "/admin/audit", "/admin/announcements"].includes(path)) {
      const rows = page.locator('[data-slot="card"]');
      for (const row of await rows.all()) {
        const header = row.locator('[data-slot="card-header"]');
        await expect(header).toHaveCSS("border-bottom-width", "0px");
        const footer = row.locator('[data-slot="card-footer"]');
        if (await footer.count()) await expect(footer).toHaveCSS("border-top-width", "0px");
      }
      if ([390, 1440].includes(width) && await rows.count()) {
        await rows.first().screenshot({ animations: "disabled", caret: "initial", path: artifactPath(`paper-journal/${width}-${path.slice(1).replaceAll("/", "-")}-row.png`) });
      }
    }
    if ([390, 1440].includes(width) && (["/", "/login", "/poems", "/collections", "/about", "/notifications", "/account/poems/new", "/admin", "/admin/users"].includes(path) || path.startsWith("/poems/"))) {
      const name = path === "/" ? "home" : path.startsWith("/poems/") ? "poem-reading" : path.slice(1).replaceAll("/", "-");
      await page.screenshot({ animations: "disabled", caret: "initial", path: artifactPath(`paper-journal/${width}-${name}.png`), fullPage: true });
    }
  }

  for (const width of [390, 768, 920, 1024, 1440]) {
    test(`comments have comfortable gutters and connected replies at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/poems/${fixture.visible.id}`);
      const section = page.locator('section[aria-labelledby="comments-title"]');
      const thread = section.locator('[data-slot="comment-thread"]').first();
      await expect(thread).toHaveCSS("background-color", "rgb(255, 253, 248)");
      const root = thread.locator('[data-slot="comment"][data-depth="0"]');
      const reply = thread.locator('[data-slot="comment"][data-depth="1"]').first();
      for (const comment of [root, reply]) {
        const geometry = await comment.evaluate((element) => {
          const styles = getComputedStyle(element);
          const article = element.getBoundingClientRect();
          const header = element.querySelector("header")!.getBoundingClientRect();
          return { left: header.left - article.left, right: article.right - header.right, background: styles.backgroundColor, width: article.width };
        });
        expect(geometry.left).toBeGreaterThanOrEqual(width < 640 ? 16 : 24);
        expect(geometry.right).toBeGreaterThanOrEqual(width < 640 ? 16 : 24);
        expect(geometry.background).toBe("rgba(0, 0, 0, 0)");
        expect(geometry.width).toBeGreaterThan(250);
      }
      await expect(reply).toHaveCSS("border-left-width", "1px");
      const prompt = section.locator('[data-slot="alert-description"]');
      await expect(prompt).toHaveCSS("display", "block");
      expect((await prompt.getByRole("link", { name: "前往登录" }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if ([390, 1440].includes(width)) {
        await section.scrollIntoViewIfNeeded();
        await page.screenshot({ animations: "disabled", caret: "initial", path: artifactPath(`paper-journal/${width}-comments-gutters.png`) });
        await thread.screenshot({ animations: "disabled", caret: "initial", path: artifactPath(`paper-journal/${width}-comment-thread.png`) });
      }
      const focusId = (await reply.getAttribute("id"))!.slice("comment-".length);
      await page.goto(`/poems/${fixture.visible.id}/comments/${comments.replyRootId}?focus=${focusId}`);
      const focused = page.locator(`[id="comment-${focusId}"]`);
      await expect(focused).toBeFocused();
      await expect(focused).toHaveCSS("background-color", "rgb(243, 232, 224)");
      expect(await focused.evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft))).toBeGreaterThanOrEqual(16);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });

    test(`public, member, and admin pages fit ${width}px`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/poems", "/collections", "/about", "/privacy", "/terms", "/login", "/login?mode=sign-up", "/forgot-password", "/reset-password", `/poems/${fixture.visible.id}`]) {
        await checkPage(page, path, width);
      }
      const response = await page.request.post("/api/auth/sign-in/email", {
        data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD, rememberMe: false },
      });
      expect(response.status()).toBe(200);
      for (const path of [
        "/account", "/account/security", "/account/poems", "/account/poems/new",
        `/account/poems/${fixture.visible.id}/edit`, "/account/collections", "/account/collections/new",
        "/notifications", "/admin", "/admin/users", "/admin/poems", `/admin/poems/${fixture.visible.id}`,
        "/admin/collections", "/admin/comments", "/admin/invitations", "/admin/announcements",
        "/admin/announcements/new", "/admin/audit",
      ]) {
        await checkPage(page, path, width);
      }
    });
  }

  test("skip link moves keyboard focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "跳转到主要内容" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });

  test("input borders show normal, hover, and invalid states", async ({ page }) => {
    await page.goto("/login");
    const input = page.locator('input[type="email"]');
    const border = () => input.evaluate((element) => getComputedStyle(element).borderTopColor);
    await page.mouse.move(0, 0);
    expect(await border()).toBe("rgb(140, 129, 112)");
    await input.hover();
    await expect.poll(border).toBe("rgb(55, 61, 56)");
    await input.evaluate((element) => element.setAttribute("aria-invalid", "true"));
    await expect.poll(border).toBe("rgb(159, 53, 47)");
  });

  test("reduced motion keeps the reading link arrow still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const link = page.getByRole("link", { name: "随便翻翻" });
    await link.hover();
    const arrow = link.locator("span[aria-hidden=true]");
    expect(await arrow.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  });
});
