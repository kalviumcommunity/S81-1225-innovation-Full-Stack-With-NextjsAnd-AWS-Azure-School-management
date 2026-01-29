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

    // Students can view assignments for courses they are registered in.
    // - Includes course-wide assignments (assignedTo = null)
    // - Includes assignments assigned specifically to them (assignedTo = their id)
    // - Excludes assignments assigned to other students
    // Teachers can view assignments for courses they created.
    // Admins can view all assignments.

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    if (user.role === "STUDENT") {
      where.OR = [{ assignedTo: user.userId }, { assignedTo: null }];
      where.project = {
        ...(where.project ?? {}),
        enrollments: {
          some: {
            userId: user.userId,
          },
        },
      };
      // Only show assignments created by staff (teacher/admin)
      where.creator = { role: { in: ["TEACHER", "ADMIN"] } };
    } else if (user.role === "TEACHER") {
      where.project = { createdBy: user.userId };
    } else if (user.role !== "ADMIN") {
      return errorResponse("Forbidden", StatusCode.FORBIDDEN);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
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
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
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

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return errorResponse(
        "Assignments are available to teachers only",
        StatusCode.FORBIDDEN
      );
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

    // If assigning to a student, ensure the student is enrolled in this course.
    if (assignedTo) {
      const isEnrolled = await prisma.projectEnrollment.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: assignedTo,
          },
        },
        select: { id: true },
      });

      if (!isEnrolled) {
        return errorResponse(
          "Student is not registered for this course",
          StatusCode.BAD_REQUEST
        );
      }
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
        project: {
          select: { id: true, title: true },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
