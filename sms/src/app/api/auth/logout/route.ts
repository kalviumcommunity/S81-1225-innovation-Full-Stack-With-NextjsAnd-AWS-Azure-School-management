import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { successResponse, errorResponse, StatusCode } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    // Find and delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.userId },
    });

    return successResponse(null, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Failed to logout", StatusCode.INTERNAL_SERVER_ERROR);
  }
}
