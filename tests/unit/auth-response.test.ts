import { describe, expect, it } from "vitest";

import { sanitizeAuthResponse } from "@/server/auth/sanitize-response";

describe("sanitizeAuthResponse", () => {
  it("removes session and provider secrets from JSON while retaining cookies", async () => {
    const response = new Response(
      JSON.stringify({
        token: "session-secret",
        user: { id: "user-id", email: "student@example.com" },
        session: { id: "session-id", token: "nested-secret" },
        provider: { accessToken: "access", refreshToken: "refresh" },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "poetryclub.session=opaque; HttpOnly; Secure",
        },
      },
    );

    const sanitized = await sanitizeAuthResponse(response);

    await expect(sanitized.json()).resolves.toEqual({
      user: { id: "user-id", email: "student@example.com" },
      session: { id: "session-id" },
      provider: {},
    });
    expect(sanitized.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("leaves non-JSON responses unchanged", async () => {
    const response = new Response("ok");

    await expect(sanitizeAuthResponse(response)).resolves.toBe(response);
  });
});
