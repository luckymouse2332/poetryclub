import { expect, test } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
import { createCommentPaginationFixtures, createHomePoemVisibilityFixtures, deletePoemsByIds } from "./helpers/database";

test.describe.serial("dark paper pages", () => {
  let fixture: Awaited<ReturnType<typeof createHomePoemVisibilityFixtures>>;

  test.beforeAll(async () => {
    fixture = await createHomePoemVisibilityFixtures();
    await createCommentPaginationFixtures(fixture.visible.id, E2E_ADMIN_EMAIL, true);
  });
  test.afterAll(async () => { if (fixture) await deletePoemsByIds(fixture.ids); });

  for (const width of [390, 1440]) {
    test(`reading, comments, forms, notifications and administration share dark surfaces at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /hydrat|Encountered a script tag/i.test(message.text())) errors.push(message.text());
      });
      await page.emulateMedia({ colorScheme: "dark" });
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/login", `/poems/${fixture.visible.id}`, "/collections"]) {
        await page.goto(path);
        await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("button", { name: "切换浅色模式", exact: true }).filter({ visible: true })).toBeEnabled();
        await page.evaluate(async () => { await document.fonts.ready; });
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        const name = path.startsWith("/poems/") ? "reading" : path.slice(1);
        await page.screenshot({ fullPage: true, caret: "initial", animations: "disabled", path: `output/playwright/dark-mode/${width}-${name}.png` });
        if (path.startsWith("/poems/")) {
          const thread = page.locator('[data-slot="comment-thread"]').first();
          await expect(thread).toHaveCSS("background-color", "rgb(44, 55, 69)");
          await expect(thread.locator('[data-slot="comment"]').first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
          await thread.screenshot({ caret: "initial", animations: "disabled", path: `output/playwright/dark-mode/${width}-comments.png` });
        }
      }
      expect((await page.request.post("/api/auth/sign-in/email", { data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD } })).status()).toBe(200);
      for (const path of ["/account/security", "/account/poems/new", "/notifications", "/admin", "/admin/poems"]) {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("button", { name: "切换浅色模式", exact: true }).filter({ visible: true })).toBeEnabled();
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
        await expect(page.getByRole("banner")).toHaveCSS("background-color", "rgb(24, 32, 41)");
        await expect(page.getByRole("contentinfo")).toHaveCSS("background-color", "rgb(24, 32, 41)");
        for (const surface of await page.locator('main [data-variant="paper"]').all()) {
          await expect(surface).toHaveCSS("background-color", "rgb(44, 55, 69)");
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        await page.screenshot({ fullPage: true, caret: "initial", animations: "disabled", path: `output/playwright/dark-mode/${width}-${path.slice(1).replaceAll("/", "-")}.png` });
      }
      expect(errors).toEqual([]);
    });
  }
});
