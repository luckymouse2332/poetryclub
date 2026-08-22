import "server-only";

import { getRedisCommandClient } from "@/server/services/notifications/realtime";
import { COMMENT_PUBLISH_COOLDOWN_SECONDS } from "@/server/validation/comments";

export type CommentRateLimitResult = "allowed" | "retry" | "limited";

export async function checkCommentPublishRateLimit(
  userId: string,
  creationToken: string,
): Promise<CommentRateLimitResult> {
  try {
    const redis = await getRedisCommandClient();
    const key = `rate-limit:comments:${userId}`;
    const current = await redis.get(key);
    if (current === creationToken) return "retry";
    if (current !== null) return "limited";

    const result = await redis.set(key, creationToken, {
      EX: COMMENT_PUBLISH_COOLDOWN_SECONDS,
      NX: true,
    });
    if (result === "OK") return "allowed";
    return (await redis.get(key)) === creationToken ? "retry" : "limited";
  } catch {
    console.warn("Comment publish rate limit unavailable; request allowed");
    return "allowed";
  }
}
