import { getCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import { createNotificationSubscriber } from "@/server/services/notifications/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return new Response(null, { status: 401 });
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  if (!currentUser) return new Response(null, { status: 401 });

  const encoder = new TextEncoder();
  let closeSubscription: (() => Promise<void>) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (value: string) => {
        if (!closed) controller.enqueue(encoder.encode(value));
      };
      const cleanup = async () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        await closeSubscription?.();
        try {
          controller.close();
        } catch {
          // The client may already have cancelled the stream.
        }
      };

      enqueue(": connected\n\n");
      enqueue("retry: 3000\n\n");
      heartbeat = setInterval(() => enqueue(": heartbeat\n\n"), 25_000);
      void createNotificationSubscriber(currentUser.id, (message) => {
        enqueue(`event: notification\ndata: ${message}\n\n`);
      })
        .then((subscription) => {
          closeSubscription = subscription.close;
          if (closed) void subscription.close();
        })
        .catch(() => {
          enqueue("event: unavailable\ndata: {}\n\n");
          void cleanup();
        });
      request.signal.addEventListener("abort", () => void cleanup(), {
        once: true,
      });
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      return closeSubscription?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
