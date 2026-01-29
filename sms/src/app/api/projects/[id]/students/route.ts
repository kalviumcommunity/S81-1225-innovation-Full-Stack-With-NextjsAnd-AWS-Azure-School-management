import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import {
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  successResponse,
  StatusCode,
} from "@/lib/api-response";

type EnrolledStudentRow = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
  createdAt: Date;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return errorResponse("Forbidden", StatusCode.FORBIDDEN);
    }

    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return notFoundResponse("Course not found");

    if (user.role === "TEACHER" && project.createdBy !== user.userId) {
      return forbiddenResponse();
    }

    const enrollments = (await (prisma as any).projectEnrollment.findMany({
      where: {
        projectId,
        user: { role: "STUDENT" },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })) as EnrolledStudentRow[];

    const students = enrollments.map((e: EnrolledStudentRow) => ({
      ...e.user,
      enrolledAt: e.createdAt,
    }));

    return successResponse(students, "Enrolled students fetched successfully");
  } catch (e) {
    console.error("Get enrolled students error:", e);
    return errorResponse(
      "Failed to fetch enrolled students",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
