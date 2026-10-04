import { afterEach, expect, it, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn());
vi.mock("redis", () => ({ createClient }));
vi.mock("@/server/env", () => ({ getServerEnv: () => ({ REDIS_URL: "redis://localhost:6379" }) }));
import { getRedisCommandClient } from "@/server/services/notifications/realtime";

const state = globalThis as typeof globalThis & {
  notificationRedisPublisher?: unknown;
  notificationRedisConnecting?: unknown;
};
afterEach(() => {
  delete state.notificationRedisPublisher;
  delete state.notificationRedisConnecting;
  createClient.mockReset();
});

function client() {
  const connection = {
    isOpen: false, isReady: false, on: vi.fn(),
    connect: vi.fn(async () => { connection.isOpen = true; connection.isReady = true; }),
    destroy: vi.fn(() => {
      if (!connection.isOpen) throw new Error("ClientClosedError");
      connection.isOpen = false;
    }),
  };
  return connection;
}

it("replaces a publisher closed by a Redis outage and resumes publishing", async () => {
  const first = client();
  const recovered = client();
  createClient.mockReturnValueOnce(first).mockReturnValueOnce(recovered);
  expect(await getRedisCommandClient()).toBe(first);
  first.isOpen = false;
  first.isReady = false;
  expect(await getRedisCommandClient()).toBe(recovered);
  expect(first.destroy).not.toHaveBeenCalled();
  expect(recovered.connect).toHaveBeenCalledOnce();
});

it("does not mask a failed connection by destroying an already closed client", async () => {
  const failed = client();
  failed.connect.mockRejectedValue(new Error("connection failure"));
  createClient.mockReturnValue(failed);
  await expect(getRedisCommandClient()).rejects.toThrow("connection failure");
  expect(failed.destroy).not.toHaveBeenCalled();
  expect(state.notificationRedisConnecting).toBeUndefined();
});
