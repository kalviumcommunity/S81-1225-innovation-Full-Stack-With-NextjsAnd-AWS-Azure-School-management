import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import { createTaskSchema } from "@/types/task";
import {
  successResponse,
  validationError,
  errorResponse,
  notFoundResponse,
  StatusCode,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where: { projectId?: string } = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(tasks, "Tasks fetched successfully");
  } catch (error) {
    console.error("Get tasks error:", error);
    return errorResponse(
      "Failed to fetch tasks",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    const body = await request.json();

    // Validate input
    const validation = validateData(createTaskSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { title, description, priority, dueDate, projectId, assignedTo } =
      validation.data;

    // Verify project exists and user is authorized
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse("Project not found");
    }

    if (project.createdBy !== user.userId && user.role !== "ADMIN") {
      return errorResponse(
        "Not authorized to create tasks in this project",
        StatusCode.FORBIDDEN
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        createdBy: user.userId,
        assignedTo,
      },
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

    return successResponse(
      task,
      "Task created successfully",
      StatusCode.CREATED
    );
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse(
      "Failed to create task",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
