import { expect, test, type Page } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";
import { createPaperDirectoryFixtures, deleteCollectionById, deletePoemsByIds } from "./helpers/database";

test.describe.serial("main content paper contrast", () => {
  let fixture: Awaited<ReturnType<typeof createPaperDirectoryFixtures>>;

  test.beforeAll(async () => { fixture = await createPaperDirectoryFixtures(); });
  test.afterAll(async () => {
    if (!fixture) return;
    for (const id of fixture.collectionIds) await deleteCollectionById(id);
    await deletePoemsByIds(fixture.poemIds);
  });

  async function checkDirectory(page: Page, path: string, width: number) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(243, 238, 228)");
    await expect(page.getByRole("banner")).toHaveCSS("background-color", "rgb(243, 238, 228)");
    await expect(page.getByRole("contentinfo")).toHaveCSS("background-color", "rgb(243, 238, 228)");
    const surface = page.locator('[data-slot="directory-surface"]');
    await expect(surface).toHaveCSS("background-color", "rgb(255, 253, 248)");
    await expect(surface).toHaveCSS("border-top-width", "1px");
    await expect(surface).toHaveCSS("border-bottom-width", "1px");
    const gutter = width >= 1024 ? 32 : width >= 640 ? 24 : 16;
    const geometry = await surface.evaluate((element) => {
      const row = element.querySelector<HTMLElement>('article, [data-slot="card"], [data-slot="empty"], ol');
      if (!row) throw new Error("Missing directory content");
      const content = row.querySelector<HTMLElement>('[data-slot="card-header"]') ?? row;
      const rect = content.getBoundingClientRect();
      const paper = element.getBoundingClientRect();
      const style = getComputedStyle(content);
      return {
        left: rect.left + parseFloat(style.paddingLeft) - paper.left,
        right: paper.right - rect.right + parseFloat(style.paddingRight),
        color: getComputedStyle(row).backgroundColor,
        paperPadding: parseFloat(getComputedStyle(element).paddingLeft),
        card: row.matches('[data-slot="card"]'),
      };
    });
    // Ordered lists reserve 24px for real numbered markers, inside the paper gutter.
    const numbered = await surface.locator("ol").count();
    expect(geometry.left, path).toBe(gutter + (numbered ? 24 : 0));
    expect(geometry.right, path).toBe(gutter);
    expect(geometry.color, path).toBe("rgba(0, 0, 0, 0)");
    if (geometry.card) expect(geometry.paperPadding, path).toBe(0);
    const rows = surface.locator('article, [data-slot="card"]');
    const borders = await rows.evaluateAll((elements) => elements.map((element) => {
      // Backend Card rows are wrapped; the list draws its rule on that wrapper.
      const style = getComputedStyle(element.matches('[data-slot="card"]') ? element.parentElement! : element);
      return { top: parseFloat(style.borderTopWidth), bottom: parseFloat(style.borderBottomWidth) };
    }));
    if (borders.length) {
      expect(borders[0]!.top).toBe(0);
      expect(borders.at(-1)!.bottom).toBe(0);
      for (let index = 1; index < borders.length; index += 1) {
        expect(borders[index - 1]!.bottom + borders[index]!.top, path).toBe(1);
      }
    }
    const pagination = page.locator('[data-slot="pagination"]');
    if (await pagination.count()) {
      await expect(pagination).toHaveCSS("border-top-width", "0px");
      await expect(pagination.locator('[data-slot="pagination-content"]')).toHaveCSS("border-top-width", "0px");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), path).toBe(true);
  }

  for (const width of [390, 768, 920, 1024, 1440]) {
    test(`continuous paper, pagination and empty states at ${width}px`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/poems", "/collections", "/poems?page=2", "/collections?page=2", `/collections/${fixture.collectionIds[0]}`, `/collections/${fixture.collectionIds[0]}?page=2`]) {
        await checkDirectory(page, path, width);
      }
      await page.goto("/collections");
      const title = page.getByRole("link", { name: fixture.longTitle, exact: true });
      await expect(title).toBeVisible();
      await title.focus();
      await expect(title).toBeFocused();
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.screenshot({ animations: "disabled", caret: "initial", fullPage: true, path: `output/playwright/paper-journal/${width}-content-paper-collections.png` });
      const response = await page.request.post("/api/auth/sign-in/email", {
        data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD, rememberMe: false },
      });
      expect(response.status()).toBe(200);
      for (const path of ["/account/poems", "/account/collections", "/admin/collections", `/admin/poems?q=${fixture.key}`, `/admin/poems?q=${fixture.key}-12`, `/admin/poems?q=missing-${fixture.key}`]) {
        await checkDirectory(page, path, width);
      }
      await expect(page.locator('[data-slot="empty"]')).toBeVisible();
      await expect(page.locator('[data-slot="empty"]')).toHaveCSS("border-top-width", "0px");
      await expect(page.locator('[data-slot="empty"]')).toHaveCSS("border-bottom-width", "0px");
    });
  }
});
