import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  StatusCode,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;
  if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

  const me = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      isActive: true,
    },
  });

  if (!me) return notFoundResponse("User not found");
  return successResponse(me, "User fetched successfully");
}
