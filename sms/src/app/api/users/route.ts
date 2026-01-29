import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import {
  errorResponse,
  StatusCode,
  successResponse,
  validationError,
} from "@/lib/api-response";
import type { ApiResponse } from "@/lib/api-response";
import { cacheDel, cacheGetJson, cacheSetJson } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { validateData } from "@/lib/validation";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;
  if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden", StatusCode.FORBIDDEN);
  }

  const cached = await cacheGetJson<ApiResponse>(CACHE_KEYS.usersList);
  if (cached) {
    console.log("Cache Hit");
    return NextResponse.json(cached, { status: cached.statusCode ?? 200 });
  }

  console.log("Cache Miss - Fetching from DB");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const responseBody: ApiResponse<typeof users> = {
    success: true,
    statusCode: StatusCode.OK,
    message: "Users fetched successfully",
    data: users,
  };

  await cacheSetJson(CACHE_KEYS.usersList, responseBody, 60);
  return NextResponse.json(responseBody, { status: StatusCode.OK });
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    if (user.role !== "ADMIN") {
      return errorResponse("Forbidden", StatusCode.FORBIDDEN);
    }

    const body = await request.json();
    const validation = validateData(createUserSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { email, firstName, lastName, role, password } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already registered", StatusCode.CONFLICT);
    }

    const desiredRole = role ?? "STUDENT";

    // Admin can either set an explicit password, or let the system generate a temporary one.
    const generatedTempPassword = crypto.randomBytes(18).toString("base64url");
    const plainPassword = password ?? generatedTempPassword;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const created = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: desiredRole,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await cacheDel(CACHE_KEYS.usersList);

    return successResponse(
      {
        user: created,
        tempPassword: password ? null : generatedTempPassword,
      },
      "User created successfully",
      StatusCode.CREATED
    );
  } catch (e) {
    console.error("Create user error:", e);
    return errorResponse(
      "Failed to create user",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
