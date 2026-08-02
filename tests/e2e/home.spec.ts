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
  await expect(page.getByText("回中诗社不是正经诗社")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "收录标准（很低）" }),
  ).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "押韵可选" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "网站正在建设" })).toBeVisible();
  await expect(page.getByText("账户与登录")).toBeVisible();
  await expect(page.getByText("诗作阅读")).toBeVisible();
  await expect(page.getByText("诗作发布")).toBeVisible();
  await expect(page.getByText("已开放")).toHaveCount(3);
  await expect(page.getByText("当前阶段先搭好可靠的页面与阅读基础")).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: /作品|诗册|班史|人物/ })).toHaveCount(
    0,
  );

  // 匿名访客的首屏主操作仍然是登录入口。
  const main = page.getByRole("main");
  const mainLinks = main.getByRole("link");
  await expect(mainLinks.nth(0)).toHaveAttribute("href", "/login?next=/account");
  await expect(mainLinks.nth(1)).toHaveAttribute("href", "#about");
  await expect(main.getByRole("link", { name: "写一首" })).toHaveCount(0);
  await expect(main.getByText(/^欢迎回来/)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 2, name: "最近诗作" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "浏览全部诗作" }),
  ).toHaveAttribute("href", "/poems");
});

test("site header navigation is present", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "首页" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "诗作" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(4);
});

test("site footer aligns brand, centered legal notice and policy links on one row", async ({
  page,
}) => {
  const measureFooterAt = async (viewport: {
    width: number;
    height: number;
  }) => {
    await page.setViewportSize(viewport);
    // boundingBox 相对视口，而全局 scroll-behavior 为 smooth；先把滚动稳定在底部再测量。
    await page.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });

    const footer = page.getByRole("contentinfo");
    const brand = footer.getByText("回中诗社", { exact: true });
    const note = footer.getByText("2021—2024级");
    const copyright = footer.getByText(/^© \d{4} 回中诗社$/);
    const privacyLink = footer.getByRole("link", { name: "隐私政策" });
    const termsLink = footer.getByRole("link", { name: "使用条款" });
    const icpLink = footer.getByRole("link", {
      name: "京ICP备2022016960号-1（新窗口打开）",
    });

    const [brandBox, noteBox, privacyBox, termsBox, copyrightBox, icpBox] =
      await Promise.all([
        brand.boundingBox(),
        note.boundingBox(),
        privacyLink.boundingBox(),
        termsLink.boundingBox(),
        copyright.boundingBox(),
        icpLink.boundingBox(),
      ]);
    for (const box of [
      brandBox,
      noteBox,
      privacyBox,
      termsBox,
      copyrightBox,
      icpBox,
    ]) {
      expect(box).not.toBeNull();
    }

    const pageCenter = viewport.width / 2;
    const centerOf = (box: { x: number; width: number }) => box.x + box.width / 2;
    const middleOf = (box: { y: number; height: number }) =>
      box.y + box.height / 2;

    // 版权与备案号始终同处一行，整体在页面水平居中，备案号在版权之后。
    expect(copyrightBox!.x).toBeLessThan(icpBox!.x);
    expect(Math.abs(copyrightBox!.y - icpBox!.y)).toBeLessThan(icpBox!.height);
    const legalCenter = (copyrightBox!.x + icpBox!.x + icpBox!.width) / 2;
    expect(Math.abs(legalCenter - pageCenter)).toBeLessThan(1);
    // 品牌名在说明之上。
    expect(brandBox!.y + brandBox!.height).toBeLessThanOrEqual(noteBox!.y);

    if (viewport.width >= 1024) {
      // 三栏单行：品牌靠左、合规信息居中、政策链接靠右。
      expect(brandBox!.x + brandBox!.width).toBeLessThan(copyrightBox!.x);
      expect(icpBox!.x + icpBox!.width).toBeLessThan(privacyBox!.x);
      expect(brandBox!.x).toBeLessThan(pageCenter);
      expect(privacyBox!.x).toBeGreaterThan(pageCenter);
      // 三组内容在同一行内垂直居中对齐。
      const brandMiddle = (brandBox!.y + noteBox!.y + noteBox!.height) / 2;
      expect(Math.abs(middleOf(icpBox!) - brandMiddle)).toBeLessThan(2);
      expect(Math.abs(middleOf(privacyBox!) - middleOf(icpBox!))).toBeLessThan(1);
      expect(Math.abs(middleOf(termsBox!) - middleOf(icpBox!))).toBeLessThan(1);
      // 左右两组相对页面中心对称；负外边距抵消链接 8px 点击内边距后文字与内容边界对齐。
      const termsRight = termsBox!.x + termsBox!.width;
      expect(
        Math.abs(pageCenter - brandBox!.x - (termsRight - pageCenter)),
      ).toBeLessThanOrEqual(8);
    } else {
      // 窄视口：品牌、说明、合规信息、政策链接居中纵向堆叠。
      for (const box of [brandBox!, noteBox!]) {
        expect(Math.abs(centerOf(box) - pageCenter)).toBeLessThan(1);
      }
      const linksCenter = (privacyBox!.x + termsBox!.x + termsBox!.width) / 2;
      expect(Math.abs(linksCenter - pageCenter)).toBeLessThan(1);
      expect(noteBox!.y + noteBox!.height).toBeLessThanOrEqual(icpBox!.y);
      expect(icpBox!.y + icpBox!.height).toBeLessThanOrEqual(privacyBox!.y);
    }
  };

  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  const privacyLink = footer.getByRole("link", { name: "隐私政策" });
  const termsLink = footer.getByRole("link", { name: "使用条款" });
  const icpLink = footer.getByRole("link", {
    name: "京ICP备2022016960号-1（新窗口打开）",
  });

  await expect(privacyLink).toHaveAttribute("href", "/privacy");
  await expect(termsLink).toHaveAttribute("href", "/terms");
  await expect(icpLink).toHaveAttribute("href", "https://beian.miit.gov.cn/");
  await expect(icpLink).toHaveAttribute("target", "_blank");
  await expect(icpLink).toHaveAttribute("rel", /noopener/);

  await measureFooterAt({ width: 1440, height: 900 });

  // 焦点顺序与视觉顺序一致：备案号在中间栏，先于右侧政策链接。
  await icpLink.focus();
  await page.keyboard.press("Tab");
  await expect(privacyLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(termsLink).toBeFocused();

  await measureFooterAt({ width: 390, height: 844 });
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
