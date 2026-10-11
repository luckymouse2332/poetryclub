import { artifactPath } from "./helpers/artifacts";
import { expect, test, type Page } from "@playwright/test";

const COMPONENTS = ["AlertDialog", "Alert", "Badge", "Button", "Card", "Dialog", "DropdownMenu", "Empty", "Field", "FormField", "IconButton", "Input", "Label", "Pagination", "Popover", "RadioGroup", "Separator", "Sheet", "Skeleton", "Spinner", "Surface", "Textarea"];

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

for (const width of [390, 768, 920, 1024, 1440]) {
  test(`all paper components fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui-preview");
    await expect(page.locator("[data-component-root]")).toHaveAttribute("data-ready", "true");
    await page.evaluate(async () => { await document.fonts.ready; });
    await expect(page.locator("[data-component]")).toHaveCount(22);
    for (const name of COMPONENTS) {
      const section = page.locator(`[data-component="${name}"]`);
      await expect(section).toBeVisible();
      if ([390, 1440].includes(width)) {
        await section.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-${name}.png`) });
      }
    }
    await noOverflow(page);
    const input = page.getByRole("textbox", { name: "普通输入", exact: true });
    await input.fill("一个很长的标题".repeat(50));
    await noOverflow(page);
    expect(await input.evaluate((element) => getComputedStyle(element).borderRadius)).toBe("2px");
    expect(await page.locator('[data-slot="card"]').evaluate((element) => getComputedStyle(element).borderRadius)).toBe("0px");
    expect(await page.locator('[data-slot="card"]').evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
  });
}

for (const width of [390, 1440]) {
  test(`paper controls and overlays work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ui-preview");
    await expect(page.locator("[data-component-root]")).toHaveAttribute("data-ready", "true");
    const primary = page.locator('[data-component="Button"]').getByRole("button", { name: "primary · default", exact: true });
    await primary.hover();
    await expect(primary).toHaveCSS("background-color", "rgb(41, 47, 42)");
    await primary.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-button-hover.png`) });
    await page.mouse.down();
    try {
      await expect(primary).toHaveCSS("background-color", "rgb(32, 38, 32)");
      await primary.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-button-active.png`) });
    } finally {
      await page.mouse.up();
    }
    const input = page.getByRole("textbox", { name: "普通输入", exact: true });
    await input.focus();
    await expect(input).toBeFocused();
    expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
    await input.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-input-focus.png`) });
    await expect(page.getByRole("textbox", { name: "错误输入", exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("textbox", { name: "禁用输入", exact: true })).toBeDisabled();
    await expect(page.locator('[data-component="Button"] button[aria-busy=true]').first()).toBeDisabled();
    const group = page.getByRole("radiogroup", { name: "访问范围", exact: true });
    await group.getByRole("radio", { name: /仅成员可见/ }).click();
    await expect(group.getByRole("radio", { name: /仅成员可见/ })).toBeChecked();
    await group.getByRole("radio", { name: /仅成员可见/ }).focus();
    // Radix moves focus asynchronously; retain the key until that focus change
    // completes, as a physical arrow-key press does before keyup.
    await page.keyboard.down("ArrowUp");
    try {
      await expect(group.getByRole("radio", { name: /公开/ })).toBeFocused();
      await expect(group.getByRole("radio", { name: /公开/ })).toBeChecked();
    } finally {
      await page.keyboard.up("ArrowUp");
    }
    await expect(page.locator('[data-component="Pagination"] [aria-current=page]')).toHaveCSS("text-decoration-line", "underline");

    for (const [triggerName, role, name] of [
      ["打开弹窗", "dialog", "补充创作背景"],
      ["打开删除确认", "alertdialog", "删除这份草稿？"],
    ] as const) {
      const trigger = page.getByRole("button", { name: triggerName, exact: true });
      await trigger.click();
      const dialog = page.getByRole(role, { name, exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("border-radius", "4px");
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-${role}-open.png`) });
      if (role === "dialog") await page.keyboard.press("Escape");
      else await dialog.getByRole("button", { name: "保留草稿" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }

    for (const side of ["right", "left", "top", "bottom"]) {
      const trigger = page.getByRole("button", { name: `打开目录 ${side}`, exact: true });
      await trigger.click();
      const sheet = page.getByRole("dialog", { name: "诗刊目录" });
      await expect(sheet).toBeVisible();
      await page.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-sheet-${side}.png`) });
      await sheet.getByRole("button", { name: "收起目录" }).click();
      await expect(trigger).toBeFocused();
    }

    const menuTrigger = page.getByRole("button", { name: "打开操作菜单" });
    await menuTrigger.click();
    await expect(page.getByRole("menuitem", { name: "当前不可发布" })).toBeDisabled();
    await page.getByRole("menuitemcheckbox", { name: "显示背景" }).click();
    await menuTrigger.click();
    await expect(page.getByRole("menuitemcheckbox", { name: "显示背景" })).toBeChecked();
    await page.getByRole("menuitem", { name: "其他操作" }).hover();
    await expect(page.getByRole("menuitem", { name: "查看记录" })).toBeVisible();
    await page.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-menu-open.png`) });
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(menuTrigger).toBeFocused();
    const popoverTrigger = page.getByRole("button", { name: "查看消息", exact: true });
    await popoverTrigger.click();
    await expect(page.getByText("暂无新的消息。")).toBeVisible();
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCSS("opacity", "1");
    await page.screenshot({ animations: "disabled", path: artifactPath(`paper-journal/components/${width}-popover-open.png`) });
    await page.keyboard.press("Escape");
    await expect(popoverTrigger).toBeFocused();
    await noOverflow(page);
  });
}

test("component loading respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui-preview");
  await expect(page.locator("[data-component-root]")).toHaveAttribute("data-ready", "true");
  for (const slot of ["spinner", "skeleton"]) {
    await expect(page.locator(`[data-component] [data-slot="${slot}"]`).first()).toHaveCSS("animation-name", "none");
  }
});
