import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/env", () => ({
  getServerEnv: () => ({
    REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  }),
}));

const { createNotificationSubscriber, publishNotificationRealtime } =
  await import("@/server/services/notifications/realtime");

describe("notification Redis realtime channel", () => {
  let close: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await close?.();
    close = undefined;
  });

  it("delivers a published event to the recipient subscriber", async () => {
    const userId = `integration-${crypto.randomUUID()}`;
    const event = {
      id: crypto.randomUUID(),
      type: "announcement",
      createdAt: new Date().toISOString(),
    } as const;
    let resolveReceived!: (message: string) => void;
    const received = new Promise<string>((resolve) => {
      resolveReceived = resolve;
    });
    const subscription = await createNotificationSubscriber(
      userId,
      resolveReceived,
    );
    close = subscription.close;
    await publishNotificationRealtime([userId], event);

    await expect(received).resolves.toBe(JSON.stringify(event));
  });
});
