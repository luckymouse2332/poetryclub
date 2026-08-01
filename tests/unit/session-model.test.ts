import { describe, expect, it } from "vitest";

import { toCurrentSession } from "@/server/auth/session-model";

type SessionInput = NonNullable<Parameters<typeof toCurrentSession>[0]>;

const FIXED_NOW = new Date("2026-08-01T12:00:00.000Z");
const FUTURE = new Date("2026-08-02T12:00:00.000Z");

function buildSession() {
  const session: SessionInput["session"] & {
    token: string;
    ipAddress: string;
    userAgent: string;
  } = {
    id: "session-1",
    userId: "user-1",
    expiresAt: "2026-08-02T12:00:00.000Z",
    // Provider / network fields must never leak into the DTO.
    token: "session-secret",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (test)",
  };

  const user: SessionInput["user"] & { password: string } = {
    id: "user-1",
    name: "李白",
    email: "li@example.com",
    createdAt: "2026-01-01T09:00:00.000Z",
    password: "dummy-password-hash",
  };

  return { session, user };
}

describe("toCurrentSession", () => {
  it("maps a valid session to a minimal DTO without tokens or network fields", () => {
    expect(toCurrentSession(buildSession(), FIXED_NOW)).toEqual({
      id: "session-1",
      userId: "user-1",
      expiresAt: FUTURE,
      user: {
        id: "user-1",
        name: "李白",
        email: "li@example.com",
        createdAt: new Date("2026-01-01T09:00:00.000Z"),
      },
    });
  });

  it("accepts string dates for both createdAt and expiresAt", () => {
    const result = toCurrentSession(buildSession(), FIXED_NOW);

    expect(result).not.toBeNull();
    expect(result!.expiresAt).toEqual(FUTURE);
    expect(result!.user.createdAt).toEqual(
      new Date("2026-01-01T09:00:00.000Z"),
    );
  });

  it("accepts Date objects for both createdAt and expiresAt", () => {
    const value = buildSession();
    value.session = { ...value.session, expiresAt: FUTURE };
    value.user = { ...value.user, createdAt: new Date("2026-01-01T09:00:00.000Z") };

    const result = toCurrentSession(value, FIXED_NOW);

    expect(result).not.toBeNull();
    expect(result!.expiresAt).toEqual(FUTURE);
    expect(result!.user.createdAt).toEqual(
      new Date("2026-01-01T09:00:00.000Z"),
    );
  });

  it("returns null for a null input", () => {
    expect(toCurrentSession(null, FIXED_NOW)).toBeNull();
  });

  it("returns null for an expired session", () => {
    const value = buildSession();
    value.session = {
      ...value.session,
      expiresAt: "2026-07-01T12:00:00.000Z",
    };

    expect(toCurrentSession(value, FIXED_NOW)).toBeNull();
  });

  it("returns null when the session expires exactly at the current time", () => {
    const value = buildSession();
    value.session = { ...value.session, expiresAt: FIXED_NOW };

    expect(toCurrentSession(value, FIXED_NOW)).toBeNull();
  });

  it("returns null for an invalid expiresAt", () => {
    const value = buildSession();
    value.session = { ...value.session, expiresAt: "not-a-date" };

    expect(toCurrentSession(value, FIXED_NOW)).toBeNull();
  });

  it("returns null for an invalid createdAt", () => {
    const value = buildSession();
    value.user = { ...value.user, createdAt: "not-a-date" };

    expect(toCurrentSession(value, FIXED_NOW)).toBeNull();
  });

  it("returns null when the session and user ids disagree", () => {
    const value = buildSession();
    value.user = { ...value.user, id: "user-2" };

    expect(toCurrentSession(value, FIXED_NOW)).toBeNull();
  });
});
