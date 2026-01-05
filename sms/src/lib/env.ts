import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL"),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  cachedServerEnv = serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  });
  return cachedServerEnv;
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;
  cachedClientEnv = clientSchema.parse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });
  return cachedClientEnv;
}
