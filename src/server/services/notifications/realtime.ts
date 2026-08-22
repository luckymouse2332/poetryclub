import "server-only";

import { createClient, type RedisClientType } from "redis";

import { getServerEnv } from "@/server/env";

export type NotificationRealtimeEvent = Readonly<{
  id: string;
  type: string;
  createdAt: string;
}>;

const globalForNotificationRedis = globalThis as typeof globalThis & {
  notificationRedisPublisher?: RedisClientType;
  notificationRedisConnecting?: Promise<RedisClientType>;
};

function notificationChannel(userId: string): string {
  return `notifications:user:${userId}`;
}

function createRedisConnection(
  reconnectStrategy: false | ((retries: number, cause: Error) => number),
): RedisClientType {
  const client = createClient({
    url: getServerEnv().REDIS_URL,
    socket: {
      connectTimeout: 750,
      reconnectStrategy,
    },
  });
  client.on("error", () => {
    // Keep Redis client errors from becoming unhandled process errors. Callers
    // receive the connection/publish failure through the awaited operation.
  });
  return client;
}

export async function getRedisCommandClient(): Promise<RedisClientType> {
  if (globalForNotificationRedis.notificationRedisPublisher?.isReady) {
    return globalForNotificationRedis.notificationRedisPublisher;
  }
  if (!globalForNotificationRedis.notificationRedisConnecting) {
    globalForNotificationRedis.notificationRedisPublisher?.destroy();
    const client = createRedisConnection(false);
    globalForNotificationRedis.notificationRedisPublisher = client;
    globalForNotificationRedis.notificationRedisConnecting = client
      .connect()
      .then(() => client)
      .catch((error) => {
        globalForNotificationRedis.notificationRedisPublisher = undefined;
        client.destroy();
        throw error;
      })
      .finally(() => {
        globalForNotificationRedis.notificationRedisConnecting = undefined;
      });
  }
  return globalForNotificationRedis.notificationRedisConnecting;
}

export async function publishNotificationRealtime(
  recipientIds: ReadonlyArray<string>,
  event: NotificationRealtimeEvent,
): Promise<void> {
  if (recipientIds.length === 0) return;
  try {
    const publisher = await getRedisCommandClient();
    const payload = JSON.stringify(event);
    await Promise.all(
      [...new Set(recipientIds)].map((userId) =>
        publisher.publish(notificationChannel(userId), payload),
      ),
    );
  } catch {
    // PostgreSQL is authoritative. A temporary Redis outage must not roll back
    // a durable notification or make the calling governance operation fail.
    console.error("Notification realtime publish failed; durable data is preserved");
  }
}

export async function createNotificationSubscriber(
  userId: string,
  listener: (message: string) => void,
): Promise<Readonly<{
  close: () => Promise<void>;
}>> {
  const subscriber = createRedisConnection((retries) =>
    Math.min(250 * 2 ** Math.min(retries, 5), 5_000),
  );
  const channel = notificationChannel(userId);
  let closed = false;

  await Promise.race([
    subscriber.connect(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Redis subscriber connection timed out")),
        3_000,
      ),
    ),
  ]).catch((error) => {
    subscriber.destroy();
    throw error;
  });

  try {
    await subscriber.subscribe(channel, listener);
  } catch (error) {
    subscriber.destroy();
    throw error;
  }

  return {
    close: async () => {
      if (closed) return;
      closed = true;
      try {
        if (subscriber.isReady) {
          await subscriber.unsubscribe(channel);
          await subscriber.quit();
        } else {
          subscriber.destroy();
        }
      } catch {
        subscriber.destroy();
      }
    },
  };
}
