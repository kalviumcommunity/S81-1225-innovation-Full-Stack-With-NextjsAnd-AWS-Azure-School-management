import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/jwt";
import { errorResponse, StatusCode } from "@/lib/api-response";
import { prisma } from "@/lib/db";

/**
 * Authenticate request and extract user from JWT token
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JwtPayload | null; error: NextResponse | null }> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        user: null,
        error: errorResponse(
          "Missing or invalid token",
          StatusCode.UNAUTHORIZED
        ),
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);

    if (!payload) {
      return {
        user: null,
        error: errorResponse(
          "Invalid or expired token",
          StatusCode.UNAUTHORIZED
        ),
      };
    }

    // Validate token is still active in sessions table
    const activeSession = await prisma.session.findUnique({
      where: { token },
      select: { expiresAt: true },
    });

    if (!activeSession || activeSession.expiresAt.getTime() < Date.now()) {
      return {
        user: null,
        error: errorResponse("Session expired", StatusCode.UNAUTHORIZED),
      };
    }

    return { user: payload, error: null };
  } catch {
    return {
      user: null,
      error: errorResponse("Authentication failed", StatusCode.UNAUTHORIZED),
    };
  }
}

/**
 * Authorize based on user role
 */
export function authorizeRole(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Middleware to check authorization
 */
export function withAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateRequest(request);

    if (error) {
      return error;
    }

    if (!user) {
      return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);
    }

    if (allowedRoles && !authorizeRole(user.role, allowedRoles)) {
      return errorResponse("Forbidden", StatusCode.FORBIDDEN);
    }

    return null;
  };
}
