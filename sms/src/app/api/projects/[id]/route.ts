import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  StatusCode,
} from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return notFoundResponse("Project not found");
    }

    // Check authorization
    if (project.createdBy !== user.userId && user.role !== "ADMIN") {
      return forbiddenResponse();
    }

    return successResponse(project, "Project fetched successfully");
  } catch (error) {
    console.error("Get project error:", error);
    return errorResponse(
      "Failed to fetch project",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
