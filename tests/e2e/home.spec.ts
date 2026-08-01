import { expect, test } from "@playwright/test";

test("home page shows the community placeholder", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/回中诗社/);
  await expect(
    page.getByRole("heading", { level: 1, name: "回中诗社" }),
  ).toBeVisible();
  await expect(page.getByText("一个属于校园的诗意角落")).toBeVisible();
});

test("site header navigation is present", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "首页" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "登录" })).toBeVisible();
});

test("login page exposes the minimal email flow", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { level: 1, name: "加入回中诗社" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "邮箱" })).toBeVisible();
  await expect(page.getByRole("button", { name: "登录", exact: true })).toBeVisible();
});

test("health endpoint returns a minimal liveness response", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toBe("no-store");
});
