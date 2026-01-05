import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import { updateTaskStatusSchema } from "@/types/task";
import {
  successResponse,
  validationError,
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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return notFoundResponse("Task not found");
    }

    return successResponse(task, "Task fetched successfully");
  } catch (error) {
    console.error("Get task error:", error);
    return errorResponse(
      "Failed to fetch task",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PATCH(
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
    const body = await request.json();

    // Validate input
    const validation = validateData(updateTaskStatusSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { status } = validation.data;

    // Find task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse("Task not found");
    }

    // Check authorization
    if (
      task.createdBy !== user.userId &&
      task.assignedTo !== user.userId &&
      user.role !== "ADMIN"
    ) {
      return forbiddenResponse();
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(updatedTask, "Task updated successfully");
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse(
      "Failed to update task",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
