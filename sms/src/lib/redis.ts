import { createClient } from "redis";
import { getServerEnv } from "@/lib/env";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  // eslint-disable-next-line no-var
  var __redisClientPromise: Promise<RedisClient> | undefined;
  // eslint-disable-next-line no-var
  var __redisClientOptionalPromise: Promise<RedisClient | null> | undefined;
}

async function initRedisClient(): Promise<RedisClient> {
  const { REDIS_URL } = getServerEnv();

  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not set");
  }

  const client = createClient({ url: REDIS_URL });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  return client;
}

async function initRedisClientOptional(): Promise<RedisClient | null> {
  const { REDIS_URL } = getServerEnv();

  if (!REDIS_URL) return null;

  const client = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: () => false,
    },
  });

  client.on("error", (err) => {
    console.warn("Redis client error:", err);
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.warn("Redis unavailable; caching disabled.", err);
    try {
      await client.quit();
    } catch {
      // ignore
    }
    return null;
  }
}

export async function getRedisClient(): Promise<RedisClient> {
  if (!global.__redisClientPromise) {
    global.__redisClientPromise = initRedisClient();
  }

  return global.__redisClientPromise;
}

export async function getRedisClientOptional(): Promise<RedisClient | null> {
  if (!global.__redisClientOptionalPromise) {
    global.__redisClientOptionalPromise = initRedisClientOptional();
  }

  return global.__redisClientOptionalPromise;
}
