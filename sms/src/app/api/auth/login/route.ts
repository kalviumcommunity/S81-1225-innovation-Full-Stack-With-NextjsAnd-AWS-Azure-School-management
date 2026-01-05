import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { validateData } from "@/lib/validation";
import { loginSchema } from "@/types/auth";
import {
  successResponse,
  validationError,
  errorResponse,
  unauthorizedResponse,
  StatusCode,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("User account is disabled", StatusCode.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: {
          userId: user.id,
          expiresAt: { lt: new Date() },
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      }),
    ]);

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Failed to login", StatusCode.INTERNAL_SERVER_ERROR);
  }
}
