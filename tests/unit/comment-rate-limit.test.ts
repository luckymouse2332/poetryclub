import { afterEach, describe, expect, it, vi } from "vitest";

const redisMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));
const getRedisCommandClient = vi.hoisted(() => vi.fn());

vi.mock("@/server/services/notifications/realtime", () => ({
  getRedisCommandClient,
}));

import { checkCommentPublishRateLimit } from "@/server/services/comments/rate-limit";

afterEach(() => {
  vi.restoreAllMocks();
  redisMock.get.mockReset();
  redisMock.set.mockReset();
  getRedisCommandClient.mockReset();
});

describe("comment Redis publish cooldown", () => {
  it("allows the first token and stores it for ten seconds", async () => {
    getRedisCommandClient.mockResolvedValue(redisMock);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");
    await expect(checkCommentPublishRateLimit("user-1", "token-1")).resolves.toBe(
      "allowed",
    );
    expect(redisMock.set).toHaveBeenCalledWith(
      "rate-limit:comments:user-1",
      "token-1",
      { EX: 10, NX: true },
    );
  });

  it("allows a safe retry and rejects a different token", async () => {
    getRedisCommandClient.mockResolvedValue(redisMock);
    redisMock.get.mockResolvedValueOnce("token-1");
    await expect(checkCommentPublishRateLimit("user-1", "token-1")).resolves.toBe(
      "retry",
    );
    redisMock.get.mockResolvedValueOnce("token-1");
    await expect(checkCommentPublishRateLimit("user-1", "token-2")).resolves.toBe(
      "limited",
    );
  });

  it("fails open with a sanitized warning when Redis is unavailable", async () => {
    getRedisCommandClient.mockRejectedValue(new Error("secret connection detail"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(checkCommentPublishRateLimit("user-1", "token-1")).resolves.toBe(
      "allowed",
    );
    expect(warning).toHaveBeenCalledWith(
      "Comment publish rate limit unavailable; request allowed",
    );
    expect(warning.mock.calls.flat().join(" ")).not.toContain("secret connection detail");
  });
});
