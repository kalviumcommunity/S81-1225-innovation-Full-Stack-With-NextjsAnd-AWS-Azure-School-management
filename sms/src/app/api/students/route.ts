import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { errorResponse, StatusCode, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) return error;
    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return errorResponse("Forbidden", StatusCode.FORBIDDEN);
    }

    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return successResponse(students, "Students fetched successfully");
  } catch (err) {
    console.error("Get students error:", err);
    return errorResponse(
      "Failed to fetch students",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
