import { describe, expect, it } from "vitest";

import { sanitizeAuthResponse } from "@/server/auth/sanitize-response";

const SENSITIVE_KEYS = [
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "password",
] as const;

function collectSensitiveKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectSensitiveKeys(item, `${prefix}[${index}]`),
    );
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      const found = (SENSITIVE_KEYS as readonly string[]).includes(key)
        ? [path]
        : [];
      return [...found, ...collectSensitiveKeys(nested, path)];
    });
  }

  return [];
}

function jsonResponse(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

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

  it("recursively removes every sensitive key at any depth", async () => {
    const response = jsonResponse({
      token: "top-level-token",
      user: {
        id: "user-1",
        name: "李白",
        email: "li@example.com",
        accounts: [
          { provider: "credential", accessToken: "nested-access" },
          { provider: "oidc", idToken: "nested-id", refreshToken: "nested-refresh" },
        ],
        credentials: { password: "nested-password" },
      },
      sessions: [
        { id: "session-1", refreshToken: "array-refresh" },
        { id: "session-2", token: "array-token" },
      ],
      meta: {
        nested: { deep: { accessToken: "deep-access" } },
      },
    });

    const sanitized = await sanitizeAuthResponse(response);
    const body = await sanitized.json();

    expect(collectSensitiveKeys(body)).toEqual([]);
  });

  it("preserves non-sensitive fields while stripping sensitive ones", async () => {
    const response = jsonResponse({
      redirect: false,
      token: "should-be-stripped",
      user: {
        id: "user-1",
        email: "a@example.com",
        emailVerified: false,
        image: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const sanitized = await sanitizeAuthResponse(response);

    await expect(sanitized.json()).resolves.toEqual({
      redirect: false,
      user: {
        id: "user-1",
        email: "a@example.com",
        emailVerified: false,
        image: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });
  });

  it("keeps Set-Cookie headers intact with HttpOnly", async () => {
    const response = jsonResponse({ token: "x" }, {
      "Set-Cookie":
        "poetryclub.session_token=opaque; HttpOnly; SameSite=Lax; Path=/",
    });

    const sanitized = await sanitizeAuthResponse(response);

    const setCookie = sanitized.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("poetryclub.session_token");
    expect(setCookie).toContain("HttpOnly");
  });

  it("drops the stale content-length header after rewriting the body", async () => {
    const response = jsonResponse({ token: "x", user: { id: "u" } });

    const sanitized = await sanitizeAuthResponse(response);

    expect(sanitized.headers.get("content-length")).toBeNull();
  });
});
