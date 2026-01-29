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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
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

    // Authorization:
    // - Students can view tasks for courses they are registered in and created by staff.
    //   Includes course-wide tasks (assignedTo = null) and tasks assigned to them.
    // - Teachers can view tasks for courses they created.
    // - Admins can view all tasks.
    if (user.role === "STUDENT") {
      const createdByStaff =
        task.creator?.role === "TEACHER" || task.creator?.role === "ADMIN";

      if (!createdByStaff) return forbiddenResponse();

      // If the task is assigned to someone else, students cannot view it.
      if (task.assignedTo && task.assignedTo !== user.userId) {
        return forbiddenResponse();
      }

      // Student must be registered in the task's course.
      const enrollment = await prisma.projectEnrollment.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: user.userId,
          },
        },
        select: { id: true },
      });

      if (!enrollment) return forbiddenResponse();
    } else if (user.role === "TEACHER") {
      if (task.project?.createdBy !== user.userId) {
        return forbiddenResponse();
      }
    } else if (user.role !== "ADMIN") {
      return forbiddenResponse();
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { id } = await context.params;
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse("Task not found");
    }

    // Only the creator (teacher/admin) or an admin can delete an assignment.
    if (task.createdBy !== user.userId && user.role !== "ADMIN") {
      return forbiddenResponse();
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({ id }, "Task deleted successfully");
  } catch (error) {
    console.error("Delete task error:", error);
    return errorResponse(
      "Failed to delete task",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
