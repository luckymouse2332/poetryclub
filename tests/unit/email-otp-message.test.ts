import { describe, expect, it } from "vitest";

import { createEmailOtpMessage, EMAIL_OTP_EXPIRES_IN_MINUTES } from "@/server/email/email-otp-message";

describe("email OTP message", () => {
  it("explains the login code expiry without exposing credentials", () => {
    const message = createEmailOtpMessage({
      to: "member@example.test",
      fromAddress: "poetry@example.edu",
      otp: "123456",
      type: "sign-in",
    });
    expect(message.subject).toContain("登录验证码");
    expect(message.text).toContain("123456");
    expect(message.text).toContain(`${EMAIL_OTP_EXPIRES_IN_MINUTES} 分钟`);
    expect(message.html).toContain("123456");
    expect(message.html).not.toContain("password");
  });

  it("escapes code text before HTML rendering", () => {
    const message = createEmailOtpMessage({
      to: "member@example.test",
      fromAddress: "poetry@example.edu",
      otp: "<script>",
      type: "email-verification",
    });
    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).not.toContain("<script>");
  });
});
