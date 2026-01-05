import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { errorResponse, successResponse, StatusCode } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;
  if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden", StatusCode.FORBIDDEN);
  }

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

  return successResponse(users, "Users fetched successfully");
}
