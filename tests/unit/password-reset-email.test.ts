import { describe, expect, it, vi } from "vitest";

import {
  createPasswordResetEmail,
  RESET_LINK_EXPIRES_IN_MINUTES,
} from "@/server/email/password-reset-message";
import {
  EmailDeliveryError,
  reportEmailDeliveryFailure,
} from "@/server/email/types";

describe("password reset email", () => {
  it("uses the fixed sender name and explains the one-hour expiry", () => {
    const message = createPasswordResetEmail({
      to: "member@example.test",
      fromAddress: "poetry@example.edu",
      resetUrl: "https://poetry.example.edu/api/auth/reset-password/token-value",
    });

    expect(message.from).toBe("回中诗社 <poetry@example.edu>");
    expect(message.subject).toContain("重置");
    expect(message.text).toContain(`${RESET_LINK_EXPIRES_IN_MINUTES} 分钟`);
    expect(message.text).not.toMatch(/明文密码|password123/);
  });

  it("escapes the reset URL before placing it in HTML", () => {
    const message = createPasswordResetEmail({
      to: "member@example.test",
      fromAddress: "poetry@example.edu",
      resetUrl: "https://poetry.example.edu/reset?token=a&next=\"bad\"",
    });
    expect(message.html).toContain("token=a&amp;next=&quot;bad&quot;");
    expect(message.html).not.toContain('next="bad"');
  });

  it("logs only a safe provider code when delivery fails", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const secretToken = "complete-reset-token-value";
    const unsafe = new Error(`Provider failed for ${secretToken}`);

    const safe = reportEmailDeliveryFailure(unsafe, "resend");

    expect(safe).toBeInstanceOf(EmailDeliveryError);
    expect(safe.message).not.toContain(secretToken);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(secretToken);
    spy.mockRestore();
  });
});
