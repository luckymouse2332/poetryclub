import { expect, test } from "@playwright/test";

import {
  createHomePoemVisibilityFixtures,
  deletePoemsByIds,
} from "./helpers/database";

test("home page shows the community identity without fake business content", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("/_next/webpack-hmr")
    ) browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/");

  const palette = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    foreground: getComputedStyle(document.body).color,
    headerSurface: getComputedStyle(document.querySelector("header")!)
      .backgroundColor,
  }));
  expect(palette.background).toBe("rgb(243, 238, 228)");
  expect(palette.foreground).toBe("rgb(40, 37, 31)");
  expect(palette.headerSurface).toBe("rgb(243, 238, 228)");

  await expect(page).toHaveTitle(/回中诗社/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "初中三年留下的一些诗。",
    }),
  ).toBeVisible();
  await expect(page.getByText("2021—2024级").first()).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "深色桌面上摆放着磨损的《杂诗集》和一本摊开的手写诗稿",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "关于回中诗社" })).toBeVisible();
  await expect(page.getByText(/诗社源自社长\s*Kevin/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "收录标准" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "网站正在建设" })).toHaveCount(0);
  await expect(
    page.getByText("网站还没修完，不过诗已经能看，也能写了。"),
  ).toBeVisible();
  await expect(page.getByText("当前阶段先搭好可靠的页面与阅读基础")).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: /作品|诗册|班史|人物/ })).toHaveCount(
    0,
  );

  // 匿名访客从首页直接阅读，登录只保留在刊头导航。
  const main = page.getByRole("main");
  const randomLink = main.getByRole("link", { name: "随便翻翻" });
  await expect(randomLink).toHaveAttribute(
    "href",
    "/poems",
  );
  await expect(main.getByRole("link", { name: "登录" })).toHaveCount(0);
  await expect(main.getByRole("link", { name: "写一首" })).toHaveCount(0);
  await expect(main.getByText(/^欢迎回来/)).toHaveCount(0);
  const latestPoemsTitle = page.getByRole("heading", {
    level: 2,
    name: "最新诗作",
  });
  await expect(latestPoemsTitle).toBeVisible();
  const titleRuleStyle = await latestPoemsTitle.evaluate((element) => {
    const styles = getComputedStyle(element, "::after");
    return {
      content: styles.content,
      display: styles.display,
      width: styles.width,
      height: styles.height,
      marginTop: styles.marginTop,
      backgroundColor: styles.backgroundColor,
    };
  });
  expect(titleRuleStyle).toEqual({
    content: '""',
    display: "block",
    width: "40px",
    height: "1px",
    marginTop: "16px",
    backgroundColor: "rgb(155, 79, 63)",
  });
  const allPoemsLink = page.getByRole("link", { name: "查看全部诗作" });
  await expect(allPoemsLink).toHaveAttribute("href", "/poems");

  const randomArrow = randomLink.locator("span[aria-hidden='true']");
  const baseRandomTransform = await randomArrow.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await randomLink.hover();
  await page.waitForTimeout(180);
  expect(
    await randomArrow.evaluate((element) => getComputedStyle(element).transform),
  ).not.toBe(baseRandomTransform);

  await page.mouse.move(0, 0);
  const allPoemsArrow = allPoemsLink.locator("span[aria-hidden='true']");
  const baseAllPoemsTransform = await allPoemsArrow.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await allPoemsLink.hover();
  await page.waitForTimeout(180);
  expect(
    await allPoemsArrow.evaluate(
      (element) => getComputedStyle(element).transform,
    ),
  ).not.toBe(baseAllPoemsTransform);
  expect(browserErrors).toEqual([]);
});

test("home index links only visible published poems for anonymous readers", async ({
  page,
}) => {
  const fixtures = await createHomePoemVisibilityFixtures();

  try {
    await page.goto("/");

    const visibleLink = page.getByRole("link", {
      name: `《${fixtures.visible.title}》`,
      exact: true,
    });
    await expect(visibleLink).toHaveAttribute(
      "href",
      `/poems/${fixtures.visible.id}`,
    );
    await expect(page.getByText(fixtures.draftTitle)).toHaveCount(0);
    await expect(page.getByText(fixtures.withdrawnTitle)).toHaveCount(0);
    await expect(page.getByText(fixtures.hiddenTitle)).toHaveCount(0);

    const poemRow = visibleLink.locator("xpath=ancestor::li");
    const baseLinkStyle = await visibleLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        textDecorationColor: style.textDecorationColor,
        textDecorationLine: style.textDecorationLine,
      };
    });
    const baseRowStyle = await poemRow.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    });
    await visibleLink.hover();
    await page.waitForTimeout(180);
    const hoveredLinkStyle = await visibleLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        textDecorationColor: style.textDecorationColor,
        textDecorationLine: style.textDecorationLine,
      };
    });
    const hoveredRowStyle = await poemRow.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    });
    expect(hoveredRowStyle.backgroundColor).toBe(
      baseRowStyle.backgroundColor,
    );
    expect(hoveredRowStyle.boxShadow).toBe(baseRowStyle.boxShadow);
    expect(baseLinkStyle.textDecorationLine).toBe("underline");
    expect(hoveredLinkStyle.textDecorationLine).toBe("underline");
    expect(hoveredLinkStyle.textDecorationColor).not.toBe(
      baseLinkStyle.textDecorationColor,
    );
    expect(hoveredLinkStyle.color).not.toBe(baseLinkStyle.color);

    await page.mouse.move(0, 0);
    await visibleLink.focus();
    await expect(visibleLink).toBeFocused();
    await page.waitForTimeout(180);
    const focusedLinkStyle = await visibleLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        textDecorationColor: style.textDecorationColor,
      };
    });
    const focusedRowStyle = await poemRow.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    });
    expect(focusedRowStyle.backgroundColor).toBe(
      baseRowStyle.backgroundColor,
    );
    expect(focusedRowStyle.boxShadow).toBe(baseRowStyle.boxShadow);
    expect(focusedLinkStyle.color).toBe(hoveredLinkStyle.color);
    expect(focusedLinkStyle.textDecorationColor).toBe(
      hoveredLinkStyle.textDecorationColor,
    );

    await visibleLink.click();
    await expect(page).toHaveURL(`/poems/${fixtures.visible.id}`);
    await expect(
      page.getByRole("heading", { level: 1, name: fixtures.visible.title }),
    ).toBeVisible();
  } finally {
    await deletePoemsByIds(fixtures.ids);
  }
});

test("site header navigation is present", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav).toBeVisible();
  const brandLink = nav.getByRole("link", { name: /回中诗社/ });
  await expect(brandLink).toHaveAttribute("aria-current", "page");
  await expect(brandLink).toHaveAttribute("href", "/#top");
  await expect(brandLink.getByText("2021—2024级")).toBeVisible();
  await expect(nav.getByRole("link", { name: "诗作" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "关于" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(4);
});

test("about page reads as prologue, past, present, future, and appendix", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { level: 1, name: "关于回中诗社" }),
  ).toBeVisible();

  await expect(page.locator("main h2")).toHaveText([
    "四次迁徙",
    "现在它向时间敞开",
    "接下来准备做什么",
    "更新记录",
  ]);

  const history = page.locator('section[aria-labelledby="history-title"]');
  await expect(history.locator("ol > li")).toHaveCount(4);
  await expect(history.getByText("2022", { exact: true })).toBeVisible();
  await expect(history.getByText("2026", { exact: true })).toBeVisible();

  const updates = page.locator('section[aria-labelledby="updates-title"]');
  await expect(updates.locator("ol > li")).toHaveCount(5);
  await expect(
    updates.getByRole("heading", { level: 3, name: "站内通知与系统公告" }),
  ).toBeVisible();
  await expect(
    updates.getByText(/当前记录更新到\s*M5 站内通知与系统公告/),
  ).toBeVisible();
  await expect(updates.getByText("M0", { exact: true })).toHaveCount(0);
});

test("about page changes editorial rhythm without horizontal overflow", async ({
  page,
}) => {
  const viewports = [
    { width: 390, historyColumns: 1, presentColumns: 1, roadmapColumns: 1 },
    { width: 768, historyColumns: 1, presentColumns: 2, roadmapColumns: 2 },
    { width: 1280, historyColumns: 2, presentColumns: 3, roadmapColumns: 2 },
    { width: 1440, historyColumns: 2, presentColumns: 3, roadmapColumns: 2 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: 900 });
    await page.goto("/about");

    const layout = await page.evaluate(() => {
      const historyEra = document.querySelector(
        'section[aria-labelledby="history-title"] ol > li',
      );
      const presentGrid = document
        .querySelector('section[aria-labelledby="present-title"] h2')
        ?.closest("header")?.nextElementSibling;
      const roadmap = document.querySelector(
        'section[aria-labelledby="future-title"] ul',
      );

      const columnCount = (element: Element | null | undefined) =>
        element
          ? getComputedStyle(element).gridTemplateColumns.split(" ").length
          : 0;

      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        historyColumns: columnCount(historyEra),
        presentColumns: columnCount(presentGrid),
        roadmapColumns: columnCount(roadmap),
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.historyColumns).toBe(viewport.historyColumns);
    expect(layout.presentColumns).toBe(viewport.presentColumns);
    expect(layout.roadmapColumns).toBe(viewport.roadmapColumns);
  }
});

test("mobile header keeps the key navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "主导航" });
  const poemsLink = nav.getByRole("link", { name: "诗作" });
  const aboutLink = nav.getByRole("link", { name: "关于" });
  const loginLink = nav.getByRole("link", { name: "登录" });
  await expect(poemsLink).toBeVisible();
  await expect(aboutLink).toBeVisible();
  await expect(loginLink).toBeVisible();

  const [poemsBox, aboutBox, loginBox] = await Promise.all([
    poemsLink.boundingBox(),
    aboutLink.boundingBox(),
    loginLink.boundingBox(),
  ]);
  expect(poemsBox).not.toBeNull();
  expect(aboutBox).not.toBeNull();
  expect(loginBox).not.toBeNull();
  expect(poemsBox!.x + poemsBox!.width).toBeLessThanOrEqual(375);
  expect(aboutBox!.x + aboutBox!.width).toBeLessThanOrEqual(375);
  expect(loginBox!.x + loginBox!.width).toBeLessThanOrEqual(375);

  await poemsLink.click();
  await expect(page).toHaveURL("/poems");
  await expect(
    page.getByRole("navigation", { name: "主导航" }).getByRole("link", {
      name: "诗作",
    }),
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/");
  await aboutLink.click();
  await expect(page).toHaveURL("/about");
  await expect(page).toHaveTitle(/关于/);

  const brandLink = nav.getByRole("link", { name: /回中诗社/ });
  const hero = page.locator("#top");
  const header = page.getByRole("banner");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await brandLink.click();
  await expect(page).toHaveURL(/\/#top$/);
  await expect
    .poll(async () => Math.abs((await hero.boundingBox())?.y ?? 9999))
    .toBeLessThan(2);
  await expect
    .poll(async () => (await header.boundingBox())?.y ?? 0)
    .toBeLessThan(0);

  // URL 已经是 #top 时也应再次触发，而不是变成无效链接。
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await brandLink.click();
  await expect
    .poll(async () => Math.abs((await hero.boundingBox())?.y ?? 9999))
    .toBeLessThan(2);
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
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
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
        const latestSection = page
          .getByRole("heading", { level: 2, name: "最新诗作" })
          .locator("xpath=ancestor::section");
        const latestSectionBox = await latestSection.boundingBox();
        const titleBox = await page
          .getByRole("heading", {
            level: 1,
            name: "初中三年留下的一些诗。",
          })
          .boundingBox();
        const visual = page.locator("[data-home-visual]");
        const visualBox = await visual.boundingBox();
        const aboutSection = page
          .getByRole("heading", { level: 2, name: "关于回中诗社" })
          .locator("xpath=ancestor::section");
        const aboutSectionBox = await aboutSection.boundingBox();
        const contentGrid = latestSection.locator("xpath=..");
        const contentGridBox = await contentGrid.boundingBox();
        const contentLayout = await contentGrid.evaluate((element) => {
          const computed = getComputedStyle(element);
          return {
            columnGap: Number.parseFloat(computed.columnGap),
            paddingLeft: Number.parseFloat(computed.paddingLeft),
            paddingRight: Number.parseFloat(computed.paddingRight),
          };
        });

        expect(titleBox).not.toBeNull();
        expect(visualBox).not.toBeNull();
        expect(latestSectionBox).not.toBeNull();
        expect(aboutSectionBox).not.toBeNull();
        expect(contentGridBox).not.toBeNull();

        expect(contentGridBox!.width).toBeLessThanOrEqual(1240.5);
        expect(
          Math.abs(
            contentGridBox!.x - (viewport.width - contentGridBox!.width) / 2,
          ),
        ).toBeLessThan(2);
        expect(
          Math.abs(
            latestSectionBox!.x -
              (contentGridBox!.x + contentLayout.paddingLeft),
          ),
        ).toBeLessThan(2);
        expect(
          Math.abs(contentLayout.paddingLeft - contentLayout.paddingRight),
        ).toBeLessThan(0.5);

        expect(titleBox!.x).toBeGreaterThanOrEqual(
          viewport.width >= 1024 ? 32 : viewport.width >= 640 ? 24 : 16,
        );
        const visualStyle = await visual.evaluate((element) => ({
          backgroundImage: getComputedStyle(element).backgroundImage,
          edgeTransform: getComputedStyle(element, "::before").transform,
          edgeBackground: getComputedStyle(element, "::before").backgroundImage,
        }));
        expect(visualStyle.backgroundImage).toBe("none");
        expect(visualStyle.edgeBackground).toContain("poetry-paper-edge-");
        const hasGradient = await page.evaluate(() =>
          [...document.styleSheets].some((styleSheet) => {
            try {
              return [...styleSheet.cssRules].some((rule) =>
                rule.cssText.includes("linear-gradient"),
              );
            } catch {
              return false;
            }
          }),
        );
        expect(hasGradient).toBe(false);

        const hasPageTransitionStyles = await page.evaluate(() =>
          [...document.styleSheets].some((styleSheet) => {
            try {
              return [...styleSheet.cssRules].some((rule) =>
                rule.cssText.includes("view-transition-old") &&
                rule.cssText.includes(".page-transition"),
              );
            } catch {
              return false;
            }
          }),
        );
        expect(hasPageTransitionStyles).toBe(false);

        if (viewport.width < 1024) {
          const expectedContentGutter = viewport.width >= 640 ? 24 : 16;
          expect(
            Math.abs(contentLayout.paddingLeft - expectedContentGutter),
          ).toBeLessThan(0.5);
          expect(latestSectionBox!.y).toBeLessThan(aboutSectionBox!.y);
          expect(Math.abs(visualBox!.x)).toBeLessThan(1);
          expect(Math.abs(visualBox!.width - viewport.width)).toBeLessThan(1);
          expect(visualBox!.y).toBeGreaterThan(titleBox!.y + titleBox!.height);
          expect(visualStyle.edgeTransform).toBe("none");
        } else {
          expect(visualBox!.height).toBeGreaterThanOrEqual(520);
          expect(visualBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width);
          expect(Math.abs(visualBox!.x + visualBox!.width - viewport.width)).toBeLessThan(1);
          expect(visualStyle.edgeBackground).toContain("vertical-v2.png");
          expect(contentLayout.paddingLeft).toBeGreaterThanOrEqual(32);
          expect(contentLayout.paddingLeft).toBeLessThanOrEqual(48);
          expect(contentLayout.columnGap).toBeGreaterThanOrEqual(64);
          expect(contentLayout.columnGap).toBeLessThanOrEqual(96);
          expect(latestSectionBox!.x).toBeLessThan(aboutSectionBox!.x);
          expect(
            Math.abs(
              aboutSectionBox!.x -
                (latestSectionBox!.x +
                  latestSectionBox!.width +
                  contentLayout.columnGap),
            ),
          ).toBeLessThan(2);

          const latestColumnRatio =
            latestSectionBox!.width /
            (latestSectionBox!.width + aboutSectionBox!.width);
          expect(latestColumnRatio).toBeGreaterThanOrEqual(0.42);
          expect(latestColumnRatio).toBeLessThanOrEqual(0.46);

          const aboutCopy = aboutSection.locator(":scope > div");
          const aboutCopyLayout = await aboutCopy.evaluate((element) => ({
            maxWidth: Number.parseFloat(getComputedStyle(element).maxWidth),
          }));
          const aboutCopyBox = await aboutCopy.boundingBox();
          expect(aboutCopyLayout.maxWidth).toBe(688);
          expect(aboutCopyBox).not.toBeNull();
          expect(aboutCopyBox!.width).toBeLessThanOrEqual(
            aboutCopyLayout.maxWidth,
          );
        }
      }
    }
  });
}

test("site navigation and login form are keyboard reachable", async ({ page }) => {
  await page.goto("/login");

  const brand = page.getByRole("link", { name: /回中诗社/ });
  const poems = page.getByRole("navigation").getByRole("link", { name: "诗作" });
  await brand.focus();
  await page.keyboard.press("Tab");
  await expect(poems).toBeFocused();

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
