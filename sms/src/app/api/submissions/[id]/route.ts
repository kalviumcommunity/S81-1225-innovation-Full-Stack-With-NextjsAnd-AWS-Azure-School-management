import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import { gradeSubmissionSchema } from "@/types/submission";
import {
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  successResponse,
  validationError,
  StatusCode,
} from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { id } = await context.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            project: { select: { id: true, title: true, createdBy: true } },
          },
        },
      },
    });

    if (!submission) return notFoundResponse("Submission not found");

    if (user.role === "STUDENT") {
      if (submission.studentId !== user.userId) return forbiddenResponse();
    } else if (user.role === "TEACHER") {
      if (submission.task.project.createdBy !== user.userId)
        return forbiddenResponse();
    } else if (user.role !== "ADMIN") {
      return forbiddenResponse();
    }

    return successResponse(submission, "Submission fetched successfully");
  } catch (e) {
    console.error("Get submission error:", e);
    return errorResponse(
      "Failed to fetch submission",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return forbiddenResponse("Only teachers can grade submissions");
    }

    const { id } = await context.params;
    const body = await request.json();

    const validation = validateData(gradeSubmissionSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const existing = await prisma.submission.findUnique({
      where: { id },
      include: {
        task: {
          select: { project: { select: { createdBy: true } } },
        },
      },
    });

    if (!existing) return notFoundResponse("Submission not found");

    if (
      user.role === "TEACHER" &&
      existing.task.project.createdBy !== user.userId
    ) {
      return forbiddenResponse();
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        grade: validation.data.grade ?? existing.grade,
        feedback: validation.data.feedback ?? existing.feedback,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            project: { select: { id: true, title: true } },
          },
        },
      },
    });

    return successResponse(updated, "Submission graded successfully");
  } catch (e) {
    console.error("Grade submission error:", e);
    return errorResponse(
      "Failed to grade submission",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
