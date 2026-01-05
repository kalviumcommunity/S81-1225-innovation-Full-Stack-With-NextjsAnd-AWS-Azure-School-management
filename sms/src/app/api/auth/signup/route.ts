import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { validateData } from "@/lib/validation";
import { signupSchema } from "@/types/auth";
import {
  successResponse,
  validationError,
  errorResponse,
  StatusCode,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(signupSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("Email already registered", StatusCode.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "STUDENT", // Default role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return successResponse(
      {
        user,
        token,
      },
      "User registered successfully",
      StatusCode.CREATED
    );
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse(
      "Failed to register user",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
