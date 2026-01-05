import { getClientEnv, getServerEnv } from "@/lib/env";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const serverEnv = getServerEnv();
  const clientEnv = getClientEnv();

  return successResponse(
    {
      dbConfigured: !!serverEnv.DATABASE_URL,
      redisConfigured: !!serverEnv.REDIS_URL,
      apiBaseUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
    },
    "Environment variables accessed"
  );
}
