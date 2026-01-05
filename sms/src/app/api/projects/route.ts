import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import { createProjectSchema } from "@/types/project";
import {
  successResponse,
  validationError,
  errorResponse,
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

    const projects = await prisma.project.findMany({
      where: {
        createdBy: user.userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(projects, "Projects fetched successfully");
  } catch (error) {
    console.error("Get projects error:", error);
    return errorResponse(
      "Failed to fetch projects",
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
    const validation = validateData(createProjectSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { title, description, startDate, endDate } = validation.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user.userId,
      },
    });

    return successResponse(
      project,
      "Project created successfully",
      StatusCode.CREATED
    );
  } catch (error) {
    console.error("Create project error:", error);
    return errorResponse(
      "Failed to create project",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
