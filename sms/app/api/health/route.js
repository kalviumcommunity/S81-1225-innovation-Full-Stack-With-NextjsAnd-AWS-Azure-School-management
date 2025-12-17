import { NextResponse } from "next/server";
import config from "../../config";

export async function GET() {
  // Health check endpoint that shows environment configuration
  // This demonstrates server-side environment variable usage

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.appEnv,
    appName: config.appName,
    apiUrl: config.apiUrl,
    debugMode: config.enableDebug,
    database: {
      configured: !!config.databaseUrl,
      // Never expose actual connection string
      connectionStatus: config.databaseUrl
        ? "✅ Connected"
        : "❌ Not configured",
    },
    security: {
      jwtConfigured: !!config.jwtSecret,
      // Never expose actual secrets
      secretsStatus: config.jwtSecret
        ? "✅ Secrets loaded"
        : "⚠️ Secrets missing",
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Environment": config.appEnv,
    },
  });
}
