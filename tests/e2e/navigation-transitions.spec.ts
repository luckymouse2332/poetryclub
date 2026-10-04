import { expect, test, type Page } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "./global-setup";

type MotionSample = { path: string; animations: { name: string; pseudo: string; duration: number }[] };
type MotionWindow = Window & { navigationMotion: MotionSample[] };

async function observeTransitions(page: Page) {
  await page.addInitScript(() => {
    const host = window as unknown as MotionWindow;
    host.navigationMotion = [];
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = original(...args);
      transition.ready.then(() => {
        host.navigationMotion.push({
          path: location.pathname,
          animations: document.getAnimations().map((animation) => {
            const effect = animation.effect as KeyframeEffect | null;
            return {
              name: animation instanceof CSSAnimation ? animation.animationName : "",
              pseudo: effect?.pseudoElement ?? "",
              duration: Number(effect?.getComputedTiming().duration ?? 0),
            };
          }),
        });
      }, () => { /* Interrupted navigations can cancel a snapshot normally. */ });
      return transition;
    };
  });
}

async function waitForClientNavigation(page: Page) {
  // Hydration is needed to exercise client routing instead of HTML navigation.
  await page.waitForFunction(() => {
    const link = document.querySelector('header a');
    return link && Object.keys(link).some((key) => key.startsWith('__reactFiber$'));
  });
  await page.evaluate(async () => { await document.fonts.ready; });
}

async function expectNavigationOnly(page: Page, path: string, marker?: string) {
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  if (marker) {
    await expect.poll(() => page.evaluate(({ target, indicator }) =>
      (window as unknown as MotionWindow).navigationMotion.some((sample) => sample.path === target && sample.animations.some((a) => a.pseudo.includes(indicator) && a.duration === 220)),
      { target: path, indicator: marker }),
    ).toBe(true);
  }
  const samples = await page.evaluate(() => (window as unknown as MotionWindow).navigationMotion);
  const relevant = samples.filter((sample) => sample.path === path);
  const animations = relevant.flatMap((sample) => sample.animations);
  expect(animations.some((a) => a.name === "page-arrive" || a.name === "page-leave")).toBe(false);
  expect(animations.filter((a) => a.pseudo.includes("view-transition") && a.duration > 0).every((a) => a.pseudo.includes("navigation-indicator")), JSON.stringify(relevant)).toBe(true);
  await expect(page.locator('[data-slot="page-transition"]')).toHaveCount(0);
}

test("desktop navigation animates only the active rule, including keyboard and history", async ({ page }) => {
  await observeTransitions(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/poems");
  await waitForClientNavigation(page);
  const nav = page.getByRole("navigation", { name: "主导航" }).filter({ visible: true });
  await nav.getByRole("link", { name: "特辑", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expectNavigationOnly(page, "/collections", "primary-navigation-indicator");
  await nav.getByRole("link", { name: "关于", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about$/);
  await expectNavigationOnly(page, "/about", "primary-navigation-indicator");
  await page.goBack();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "特辑" })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
});

test("rapid navigation settles on the latest page and can navigate again", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await observeTransitions(page);
  await page.goto("/poems");
  await waitForClientNavigation(page);
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('header a'));
    links.find((link) => link.getAttribute('href') === '/collections')?.click();
    links.find((link) => link.getAttribute('href') === '/about')?.click();
  });
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("navigation", { name: "主导航" }).filter({ visible: true }).getByRole("link", { name: "诗作", exact: true }).click();
  await expect(page).toHaveURL(/\/poems$/);
  await expectNavigationOnly(page, "/poems", "primary-navigation-indicator");
  expect(errors).toEqual([]);
});

test("same-page anchors and modified clicks preserve native link behavior", async ({ page, context }) => {
  await observeTransitions(page);
  await page.goto("/");
  await waitForClientNavigation(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const nav = page.getByRole("navigation", { name: "主导航" }).filter({ visible: true });
  await nav.getByRole("link", { name: "回中诗社" }).click();
  await expect(page).toHaveURL(/\/#top$/);
  // The #top hero follows the header; align the anchor, not document scroll zero.
  await expect.poll(() => page.locator("#top").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => (window as unknown as MotionWindow).navigationMotion)).toEqual([]);
  const opened = context.waitForEvent("page");
  await nav.getByRole("link", { name: "特辑", exact: true }).click({ modifiers: ["ControlOrMeta"] });
  const nextTab = await opened;
  await expect(nextTab).toHaveURL(/\/collections$/);
  await expect(page).toHaveURL(/\/#top$/);
  await nextTab.close();
});

for (const width of [390, 1024, 1440]) {
  test(`workspace navigation transitions at ${width}px without duplicate markers`, async ({ page }) => {
    await observeTransitions(page);
    await page.setViewportSize({ width, height: 900 });
    expect((await page.request.post("/api/auth/sign-in/email", { data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD } })).status()).toBe(200);
    await page.goto("/account");
    await waitForClientNavigation(page);
    const nav = page.getByRole("navigation", { name: "账户导航" }).filter({ visible: true });
    await nav.getByRole("link", { name: "账户安全", exact: true }).click();
    await expect(page).toHaveURL(/\/account\/security$/);
    const marker = width >= 1280 ? "workspace-navigation-indicator" : width >= 1024 ? "secondary-navigation-indicator" : "embedded-navigation-indicator";
    await expectNavigationOnly(page, "/account/security", marker);
    await expect(nav.getByRole("link", { name: "账户安全", exact: true })).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("mobile menu closes without animating destination content", async ({ page }) => {
  await observeTransitions(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/poems");
  await waitForClientNavigation(page);
  await page.getByRole("button", { name: "打开全站导航" }).click();
  await page.getByRole("navigation", { name: "全站导航" }).getByRole("link", { name: "特辑", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expectNavigationOnly(page, "/collections");
  await expect(page.getByRole("button", { name: "打开全站导航" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "全站导航" })).toHaveCount(0);
});

test("reduced motion removes route and marker animations", async ({ page }) => {
  await observeTransitions(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/poems");
  await waitForClientNavigation(page);
  await page.getByRole("navigation", { name: "主导航" }).filter({ visible: true }).getByRole("link", { name: "特辑", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole("heading", { level: 1, name: "特辑" })).toBeVisible();
  const active = await page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.includes("view-transition") && Number(a.effect?.getComputedTiming().duration ?? 0) > 0).length);
  expect(active).toBe(0);
  const captured = await page.evaluate(() => (window as unknown as MotionWindow).navigationMotion.flatMap((sample) => sample.animations).filter((a) => a.pseudo.includes("view-transition") && a.duration > 0));
  expect(captured).toEqual([]);
});

test("unsupported browsers navigate normally", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true }));
  await page.goto("/poems");
  await waitForClientNavigation(page);
  await page.getByRole("navigation", { name: "主导航" }).filter({ visible: true }).getByRole("link", { name: "特辑", exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole("heading", { level: 1, name: "特辑" })).toBeVisible();
  expect(errors).toEqual([]);
});
