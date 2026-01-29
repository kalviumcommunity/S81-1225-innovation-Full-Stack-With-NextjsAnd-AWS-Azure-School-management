import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import { createSubmissionSchema } from "@/types/submission";
import {
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  successResponse,
  validationError,
  StatusCode,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    const where: any = {};
    if (taskId) where.taskId = taskId;

    if (user.role === "STUDENT") {
      where.studentId = user.userId;
    } else if (user.role === "TEACHER") {
      // teacher can view submissions only for tasks in courses they created
      where.task = { project: { createdBy: user.userId } };
    } else if (user.role !== "ADMIN") {
      return forbiddenResponse();
    }

    const submissions = await prisma.submission.findMany({
      where,
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
      orderBy: { updatedAt: "desc" },
    });

    return successResponse(submissions, "Submissions fetched successfully");
  } catch (e) {
    console.error("Get submissions error:", e);
    return errorResponse(
      "Failed to fetch submissions",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    if (user.role !== "STUDENT") {
      return forbiddenResponse("Only students can submit assignments");
    }

    const body = await request.json();
    const validation = validateData(createSubmissionSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { taskId, content, fileUrl } = validation.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: { select: { role: true } },
      },
    });

    if (!task) return notFoundResponse("Assignment not found");

    const createdByStaff =
      task.creator?.role === "TEACHER" || task.creator?.role === "ADMIN";

    if (task.assignedTo !== user.userId || !createdByStaff) {
      return forbiddenResponse("You are not assigned to this assignment");
    }

    const submission = await prisma.submission.upsert({
      where: {
        taskId_studentId: {
          taskId,
          studentId: user.userId,
        },
      },
      create: {
        taskId,
        studentId: user.userId,
        content,
        fileUrl,
      },
      update: {
        content,
        fileUrl,
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

    return successResponse(submission, "Submission saved", StatusCode.CREATED);
  } catch (e) {
    console.error("Create submission error:", e);
    return errorResponse(
      "Failed to submit assignment",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
