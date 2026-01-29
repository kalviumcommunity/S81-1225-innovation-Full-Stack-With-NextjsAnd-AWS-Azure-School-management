import { getRedisClientOptional } from "@/lib/redis";

export const DEFAULT_CACHE_TTL_SECONDS = 60;

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClientOptional();
    if (!client) return null;
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Redis cache GET failed for key: ${key}`, error);
    return null;
  }
}

export async function cacheSetJson<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS
): Promise<void> {
  try {
    const client = await getRedisClientOptional();
    if (!client) return;
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.warn(`Redis cache SET failed for key: ${key}`, error);
  }
}

export async function cacheDel(keys: string | string[]): Promise<void> {
  try {
    const client = await getRedisClientOptional();
    if (!client) return;
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length === 0) return;
    await client.del(list);
  } catch (error) {
    console.warn("Redis cache DEL failed", error);
  }
}
