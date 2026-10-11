import { getCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import { createNotificationStream } from "@/server/services/notifications/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return new Response(null, { status: 401 });
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  if (!currentUser) return new Response(null, { status: 401 });

  const stream = createNotificationStream(request.signal, currentUser.id);

  return new Response(stream, {
    headers: {
      "Cache-Control": "private, no-store, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
