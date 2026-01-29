import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  StatusCode,
} from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    if (user.role !== "STUDENT") {
      return errorResponse("Only students can enroll", StatusCode.FORBIDDEN);
    }

    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return notFoundResponse("Course not found");

    if (project.status !== "ACTIVE") {
      return errorResponse("Course is not active", StatusCode.BAD_REQUEST);
    }

    try {
      const enrollment = await (prisma as any).projectEnrollment.create({
        data: {
          projectId,
          userId: user.userId,
        },
        select: {
          id: true,
          projectId: true,
          userId: true,
          createdAt: true,
        },
      });

      return successResponse(
        enrollment,
        "Enrolled successfully",
        StatusCode.CREATED
      );
    } catch (e: any) {
      // Unique constraint -> already enrolled
      if (typeof e?.code === "string" && e.code === "P2002") {
        return errorResponse("Already enrolled", StatusCode.CONFLICT);
      }
      throw e;
    }
  } catch (e) {
    console.error("Enroll error:", e);
    return errorResponse("Failed to enroll", StatusCode.INTERNAL_SERVER_ERROR);
  }
}

export async function DELETE(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    if (user.role !== "STUDENT") {
      return errorResponse(
        "Only students can unregister",
        StatusCode.FORBIDDEN
      );
    }

    // Registration is one-way (per product requirement).
    // If you need admin-only removal later, add a separate admin endpoint.
    return errorResponse("Unregister is disabled", StatusCode.FORBIDDEN);
  } catch (e) {
    console.error("Unregister error:", e);
    return errorResponse(
      "Failed to unregister",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
