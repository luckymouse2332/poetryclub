import { expect, test } from "@playwright/test";

test("home page shows the community identity without fake business content", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/回中诗社/);
  await expect(
    page.getByRole("heading", { level: 1, name: "回中诗社" }),
  ).toBeVisible();
  await expect(page.getByText("2021—2024级").first()).toBeVisible();
  await expect(
    page.getByText(
      "初中时代的打油诗和班史。",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "回中诗社校园视觉" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "关于回中诗社" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "网站正在建设" })).toBeVisible();
  await expect(page.getByText("账户与登录")).toBeVisible();
  await expect(page.getByText("已开放")).toBeVisible();
  await expect(page.getByText("当前阶段先搭好可靠的页面与阅读基础")).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: /作品|诗册|班史|人物/ })).toHaveCount(
    0,
  );

  const mainLinks = page.getByRole("main").getByRole("link");
  await expect(mainLinks).toHaveCount(2);
  await expect(mainLinks.nth(0)).toHaveAttribute("href", "/login?next=/account");
  await expect(mainLinks.nth(1)).toHaveAttribute("href", "#about");
});

test("site header navigation is present", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "首页" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(3);
});

test("site footer uses a three-column desktop layout with policy and ICP links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  const brand = footer.getByText("回中诗社", { exact: true });
  const note = footer.getByText("2021—2024级 · 一个属于校园的诗意角落。");
  const privacyLink = footer.getByRole("link", { name: "隐私政策" });
  const termsLink = footer.getByRole("link", { name: "使用条款" });
  const icpLink = footer.getByRole("link", {
    name: "京ICP备2022016960号-1（新窗口打开）",
  });

  await expect(note).toBeVisible();
  await expect(privacyLink).toHaveAttribute("href", "/privacy");
  await expect(termsLink).toHaveAttribute("href", "/terms");
  await expect(icpLink).toHaveAttribute("href", "https://beian.miit.gov.cn/");
  await expect(icpLink).toHaveAttribute("target", "_blank");

  const [brandBox, noteBox, privacyBox] = await Promise.all([
    brand.boundingBox(),
    note.boundingBox(),
    privacyLink.boundingBox(),
  ]);
  expect(brandBox).not.toBeNull();
  expect(noteBox).not.toBeNull();
  expect(privacyBox).not.toBeNull();
  expect(Math.abs(noteBox!.x + noteBox!.width / 2 - 720)).toBeLessThan(1);
  expect(brandBox!.x + brandBox!.width).toBeLessThan(noteBox!.x);
  expect(noteBox!.x + noteBox!.width).toBeLessThan(privacyBox!.x);

  await privacyLink.focus();
  await page.keyboard.press("Tab");
  await expect(termsLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(icpLink).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  const [mobileBrandBox, mobileNoteBox, mobilePrivacyBox] = await Promise.all([
    brand.boundingBox(),
    note.boundingBox(),
    privacyLink.boundingBox(),
  ]);
  expect(mobileBrandBox).not.toBeNull();
  expect(mobileNoteBox).not.toBeNull();
  expect(mobilePrivacyBox).not.toBeNull();
  expect(mobileBrandBox!.y + mobileBrandBox!.height).toBeLessThan(mobileNoteBox!.y);
  expect(mobileNoteBox!.y + mobileNoteBox!.height).toBeLessThan(
    mobilePrivacyBox!.y,
  );
});

for (const informationPage of [
  {
    path: "/privacy",
    title: "隐私政策",
    copy: "我们处理哪些信息",
  },
  {
    path: "/terms",
    title: "使用条款",
    copy: "当前可用的功能",
  },
]) {
  test(`${informationPage.title} page is readable on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(informationPage.path);

    await expect(page).toHaveTitle(new RegExp(informationPage.title));
    await expect(
      page.getByRole("heading", { level: 1, name: informationPage.title }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: informationPage.copy })).toBeVisible();
    await expect(page.getByText("更新日期：2026年8月2日")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test("login page exposes the minimal email flow", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { level: 1, name: "加入回中诗社" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "邮箱" })).toBeVisible();
  await expect(page.getByRole("button", { name: "登录", exact: true })).toBeVisible();

  const email = page.getByRole("textbox", { name: "邮箱" });
  expect(await email.getAttribute("id")).toBe("email");
  await expect(page.locator('label[for="email"]')).toHaveText(/邮箱/);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`home and login avoid horizontal overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);

    for (const path of ["/", "/login"]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

      if (path === "/") {
        const titleBox = await page
          .getByRole("heading", { level: 1, name: "回中诗社" })
          .boundingBox();
        const visualBox = await page
          .getByRole("img", { name: "回中诗社校园视觉" })
          .boundingBox();

        expect(titleBox).not.toBeNull();
        expect(visualBox).not.toBeNull();

        if (viewport.width < 768) {
          expect(titleBox!.y + titleBox!.height).toBeLessThan(visualBox!.y);
        } else {
          expect(titleBox!.x + titleBox!.width).toBeLessThan(visualBox!.x);
        }
      }
    }
  });
}

test("site navigation and login form are keyboard reachable", async ({ page }) => {
  await page.goto("/login");

  const brand = page.getByRole("link", { name: /回中诗社/ });
  const home = page.getByRole("navigation").getByRole("link", { name: "首页" });
  await brand.focus();
  await page.keyboard.press("Tab");
  await expect(home).toBeFocused();

  const signInTab = page.getByRole("tab", { name: "登录" });
  const signUpTab = page.getByRole("tab", { name: "注册" });
  await signInTab.focus();
  await page.keyboard.press("Tab");
  await expect(signUpTab).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("邮箱")).toBeFocused();
});

test("health endpoint returns a minimal liveness response", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toBe("no-store");
});
