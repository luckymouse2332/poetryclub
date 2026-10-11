import { expect, test } from "@playwright/test";

import { createEmailOtpMessage } from "../../src/server/email/email-otp-message";
import { createPasswordResetEmail } from "../../src/server/email/password-reset-message";
import { artifactPath } from "./helpers/artifacts";

for (const width of [390, 768, 1440]) {
  for (const kind of ["reset", "otp"] as const) {
    test(`paper email ${kind} fits ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const address = { to: "preview@example.invalid", fromAddress: "preview@example.invalid" };
      const message = kind === "reset"
        ? createPasswordResetEmail({ ...address, resetUrl: "https://example.invalid/reset-password?token=preview" })
        : createEmailOtpMessage({ ...address, otp: "123456", type: "sign-in" });
      await page.setContent(message.html);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(243, 238, 228)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (kind === "reset") await expect(page.getByRole("link", { name: "设置新密码" })).toHaveAttribute("href", /token=preview/);
      else await expect(page.getByText("123456", { exact: true })).toBeVisible();
      await page.screenshot({ path: artifactPath(`email/${width}-${kind}.png`), fullPage: true });
    });
  }
}
