import { artifactPath } from "./helpers/artifacts";
import { expect, test, type Page } from "@playwright/test";
import { THEME_STORAGE_KEY } from "../../src/lib/theme";

function toggle(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true }).filter({ visible: true });
}

async function noPageMotion(page: Page) {
  expect(await page.evaluate(() => document.getAnimations().filter((a) => {
    const effect = a.effect as KeyframeEffect | null;
    return effect?.pseudoElement?.includes("view-transition") && Number(effect.getComputedTiming().duration) > 0;
  }).length)).toBe(0);
  await expect(page.locator('[data-slot="page-transition"]')).toHaveCount(0);
}

for (const width of [320, 390, 768, 920, 1024, 1440]) {
  test(`theme toggle works with keyboard and persists at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const button = toggle(page, "切换深色模式");
    await expect(button).toBeEnabled();
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    if (width < 1024) {
      const brand = page.getByRole("navigation", { name: "主导航" }).filter({ visible: true }).getByRole("link", { name: "回中诗社" });
      const brandBox = (await brand.boundingBox())!;
      expect(Math.abs(brandBox.x + brandBox.width / 2 - width / 2)).toBeLessThanOrEqual(1);
      expect(box.x + box.width).toBeLessThanOrEqual(brandBox.x);
    }
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle(page, "切换浅色模式")).toBeFocused();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(24, 32, 41)");
    await expect(page.locator("body")).toHaveCSS("color", "rgb(231, 237, 243)");
    await expect(page.locator("header")).toHaveCSS("background-color", "rgb(24, 32, 41)");
    expect(await page.evaluate(() => localStorage.getItem("poetryclub-theme"))).toBe("dark");
    await noPageMotion(page);
    if ([390, 1440].includes(width)) await page.screenshot({ fullPage: true, animations: "disabled", path: artifactPath(`dark-mode/${width}-home.png`) });
    await page.goto("/poems");
    await expect(toggle(page, "切换浅色模式")).toBeEnabled();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('[data-slot="directory-surface"]')).toHaveCSS("background-color", "rgb(44, 55, 69)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if ([390, 1440].includes(width)) await page.screenshot({ fullPage: true, animations: "disabled", path: artifactPath(`dark-mode/${width}-poems.png`) });
    await toggle(page, "切换浅色模式").click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(243, 238, 228)");
  });
}

test("system changes apply until the visitor makes an explicit choice", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|Encountered a script tag/i.test(message.text())) errors.push(message.text());
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");
  await expect(toggle(page, "切换浅色模式")).toBeEnabled();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle(page, "切换深色模式").click();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("textbox", { name: "邮箱" })).toHaveCSS("background-color", "rgb(44, 55, 69)");
  expect(errors).toEqual([]);
});

test("stored theme applies before client scripts can hydrate", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript((key) => localStorage.setItem(key, "dark"), THEME_STORAGE_KEY);
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(24, 32, 41)");
  await expect(toggle(page, "切换深色模式")).toBeDisabled();
});

test("theme changes and clearing preferences synchronize between tabs", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(toggle(page, "切换深色模式")).toBeEnabled();
  const second = await context.newPage();
  await second.emulateMedia({ colorScheme: "light" });
  await second.goto("/login");
  await toggle(second, "切换深色模式").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await toggle(page, "切换浅色模式").click();
  await expect(second.locator("html")).toHaveAttribute("data-theme", "light");
  await second.evaluate((key) => localStorage.removeItem(key), THEME_STORAGE_KEY);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await second.close();
});

test("blocked storage still allows a theme choice through navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Denied", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Denied", "SecurityError"); };
  });
  await page.goto("/");
  await toggle(page, "切换深色模式").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("navigation", { name: "主导航" }).filter({ visible: true }).getByRole("link", { name: "特辑", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await toggle(page, "切换浅色模式").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

for (const width of [390, 1440]) {
  test(`dark components, focus and portal surfaces are readable at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui-preview");
    await expect(page.locator("[data-component-root]")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("[data-component]")).toHaveCount(22);
    const contrast = await page.evaluate(() => {
      function rgb(value: string) {
        const probe = document.createElement("span");
        probe.style.color = value;
        document.body.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      }
      function luminance(color: number[]) { return color.map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, index) => sum + v * ([.2126, .7152, .0722][index] ?? 0), 0); }
      function ratio(a: string, b: string) { const first = luminance(rgb(a)); const second = luminance(rgb(b)); return (Math.max(first, second) + .05) / (Math.min(first, second) + .05); }
      const input = getComputedStyle(document.querySelector('[data-component="Input"] input')!);
      const primary = getComputedStyle(document.querySelector('[data-component="Button"] [data-variant="primary"]')!);
      const danger = getComputedStyle(document.querySelector('[data-component="Button"] [data-variant="danger"]')!);
      const text = getComputedStyle(document.body).color;
      const paper = input.backgroundColor;
      const root = getComputedStyle(document.documentElement);
      return {
        text: ratio(text, paper),
        input: ratio(input.borderColor, paper),
        primary: ratio(primary.color, primary.backgroundColor),
        danger: ratio(danger.color, danger.backgroundColor),
        statuses: ["--text-secondary", "--muted-foreground", "--success", "--warning", "--danger", "--seal"].map((name) => ratio(root.getPropertyValue(name).trim(), paper)),
      };
    });
    expect(contrast.text).toBeGreaterThanOrEqual(4.5);
    expect(contrast.input).toBeGreaterThanOrEqual(3);
    expect(contrast.primary).toBeGreaterThanOrEqual(4.5);
    expect(contrast.danger).toBeGreaterThanOrEqual(4.5);
    for (const value of contrast.statuses) expect(value).toBeGreaterThanOrEqual(4.5);
    const input = page.getByRole("textbox", { name: "普通输入", exact: true });
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "solid");
    await expect(page.getByRole("textbox", { name: "错误输入", exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("textbox", { name: "禁用输入", exact: true })).toBeDisabled();
    for (const name of ["Button", "Input", "Alert", "Card"]) await page.locator(`[data-component="${name}"]`).screenshot({ animations: "disabled", path: artifactPath(`dark-mode/${width}-${name}.png`) });
    for (const [trigger, slot] of [["打开弹窗", "dialog-content"], ["打开操作菜单", "dropdown-menu-content"], ["查看消息", "popover-content"]]) {
      const button = page.getByRole("button", { name: trigger, exact: true });
      await button.click();
      const surface = page.locator(`[data-slot="${slot}"]`).first();
      await expect(surface).toBeVisible();
      await expect(surface).toHaveCSS("background-color", "rgb(44, 55, 69)");
      await page.screenshot({ animations: "disabled", path: artifactPath(`dark-mode/${width}-${slot}.png`) });
      await page.keyboard.press("Escape");
      await expect(button).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
