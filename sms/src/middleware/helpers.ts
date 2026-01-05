import { NextRequest } from "next/server";

/**
 * Get user ID from request
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    // In a real app, decode and verify the token
    const token = authHeader.substring(7);
    // This is simplified - you'd decode the JWT properly
    return token;
  } catch {
    return null;
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}
