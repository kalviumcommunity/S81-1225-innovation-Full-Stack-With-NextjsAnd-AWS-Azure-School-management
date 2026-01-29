import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function isDbUnavailableError(error: unknown): boolean {
  const anyError = error as {
    code?: unknown;
    message?: unknown;
    errorCode?: unknown;
  };
  const code =
    typeof anyError?.code === "string"
      ? anyError.code
      : typeof anyError?.errorCode === "string"
        ? anyError.errorCode
        : "";

  // Prisma codes that commonly indicate connectivity or pool exhaustion
  if (
    code === "P1000" || // Authentication failed
    code === "P1001" || // Can't reach database server
    code === "P1017" || // Server has closed the connection
    code === "P2024" // Timed out fetching a new connection from the pool
  ) {
    return true;
  }

  const message = typeof anyError?.message === "string" ? anyError.message : "";
  return (
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("socket hang up") ||
    message.includes("Connection terminated unexpectedly")
  );
}
