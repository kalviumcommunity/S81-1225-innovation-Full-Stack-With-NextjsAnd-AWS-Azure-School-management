import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { errorResponse, StatusCode } from "@/lib/api-response";
import type { ApiResponse } from "@/lib/api-response";
import { cacheGetJson, cacheSetJson } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;
  if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden", StatusCode.FORBIDDEN);
  }

  const cached = await cacheGetJson<ApiResponse>(CACHE_KEYS.usersList);
  if (cached) {
    console.log("Cache Hit");
    return NextResponse.json(cached, { status: cached.statusCode ?? 200 });
  }

  console.log("Cache Miss - Fetching from DB");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const responseBody: ApiResponse<typeof users> = {
    success: true,
    statusCode: StatusCode.OK,
    message: "Users fetched successfully",
    data: users,
  };

  await cacheSetJson(CACHE_KEYS.usersList, responseBody, 60);
  return NextResponse.json(responseBody, { status: StatusCode.OK });
}
