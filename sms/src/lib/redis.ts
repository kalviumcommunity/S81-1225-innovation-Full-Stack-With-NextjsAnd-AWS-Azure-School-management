import { createClient } from "redis";
import { getServerEnv } from "@/lib/env";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  // eslint-disable-next-line no-var
  var __redisClientPromise: Promise<RedisClient> | undefined;
}

async function initRedisClient(): Promise<RedisClient> {
  const { REDIS_URL } = getServerEnv();

  const client = createClient({ url: REDIS_URL });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  return client;
}

export async function getRedisClient(): Promise<RedisClient> {
  if (!global.__redisClientPromise) {
    global.__redisClientPromise = initRedisClient();
  }

  return global.__redisClientPromise;
}
