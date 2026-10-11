import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/server/services/notifications/realtime", () => ({ createNotificationSubscriber: vi.fn() }));
import { createNotificationStream, STREAM_MAX_AGE_MS } from "@/server/services/notifications/stream";

afterEach(() => vi.useRealTimers());

it("does not subscribe an already aborted request", async () => {
  const abort = new AbortController(); abort.abort();
  const subscribe = vi.fn();
  const reader = createNotificationStream(abort.signal, "user", subscribe).getReader();
  expect(await reader.read()).toMatchObject({ done: true });
  expect(subscribe).not.toHaveBeenCalled();
});

it("disposes a subscription that arrives after cancellation, once", async () => {
  let resolve!: (value: { close: () => Promise<void> }) => void;
  const subscribe = vi.fn(() => new Promise<{ close: () => Promise<void> }>((r) => { resolve = r; }));
  const abort = new AbortController();
  const stream = createNotificationStream(abort.signal, "user", subscribe);
  await stream.cancel(); abort.abort();
  const close = vi.fn().mockResolvedValue(undefined);
  resolve({ close });
  await vi.waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});

it("clears timers and closes a subscribed stream at its authentication lifetime", async () => {
  vi.useFakeTimers();
  const close = vi.fn().mockResolvedValue(undefined);
  const stream = createNotificationStream(new AbortController().signal, "user", async () => ({ close }));
  await Promise.resolve();
  await vi.advanceTimersByTimeAsync(STREAM_MAX_AGE_MS);
  expect(close).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  await stream.cancel();
  expect(close).toHaveBeenCalledOnce();
});

it("emits recovery signals and safely ignores notifications after abort", async () => {
  let listener!: (message: string) => void;
  let ready!: () => void;
  const abort = new AbortController();
  const close = vi.fn().mockResolvedValue(undefined);
  const stream = createNotificationStream(abort.signal, "user", async (_id, onMessage, onReady) => {
    listener = onMessage; ready = onReady!; return { close };
  });
  const reader = stream.getReader(); await reader.read();
  ready();
  expect(new TextDecoder().decode((await reader.read()).value)).toContain("event: ready");
  abort.abort(); listener("{}"); ready();
  expect(await reader.read()).toMatchObject({ done: true });
  expect(close).toHaveBeenCalledOnce();
});

it("reports unavailable and closes when subscription fails", async () => {
  const reader = createNotificationStream(new AbortController().signal, "user", async () => { throw new Error("offline"); }).getReader();
  await reader.read();
  expect(new TextDecoder().decode((await reader.read()).value)).toContain("event: unavailable");
  expect(await reader.read()).toMatchObject({ done: true });
});
