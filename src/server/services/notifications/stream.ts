import "server-only";
import { createNotificationSubscriber } from "./realtime";

// Reconnect forces a fresh session check, including revoked/expired sessions.
export const STREAM_MAX_AGE_MS = 5 * 60_000;

export function createNotificationStream(
  signal: AbortSignal,
  userId: string,
  subscribe: typeof createNotificationSubscriber = createNotificationSubscriber,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cleanup = () => {};
  return new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let subscription: Awaited<ReturnType<typeof subscribe>> | undefined;
      let heartbeat: ReturnType<typeof setInterval> | undefined;
      let lifetime: ReturnType<typeof setTimeout> | undefined;
      const dispose = (value: NonNullable<typeof subscription>) => { void value.close().catch(() => {}); };
      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(lifetime);
        heartbeat = undefined;
        lifetime = undefined;
        signal.removeEventListener("abort", cleanup);
        if (subscription) dispose(subscription);
        try { controller.close(); } catch { /* Already cancelled by reader. */ }
      };
      const send = (value: string) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(value)); } catch { cleanup(); }
      };
      if (signal.aborted) { cleanup(); return; }
      signal.addEventListener("abort", cleanup, { once: true });
      send(": connected\nretry: 3000\n\n");
      heartbeat = setInterval(() => send(": heartbeat\n\n"), 25_000);
      lifetime = setTimeout(cleanup, STREAM_MAX_AGE_MS);
      void subscribe(userId,
        (message) => send(`event: notification\ndata: ${message}\n\n`),
        () => send("event: ready\ndata: {}\n\n"),
      ).then((value) => {
        if (closed) dispose(value);
        else subscription = value;
      }).catch(() => {
        send("event: unavailable\ndata: {}\n\n");
        cleanup();
      });
    },
    cancel() { cleanup(); },
  });
}
