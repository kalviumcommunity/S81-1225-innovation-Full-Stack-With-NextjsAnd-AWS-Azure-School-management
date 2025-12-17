// Environment Configuration Utility
// This file demonstrates how to safely access environment variables

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "School Management System",

  // Feature Flags
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true",

  // Server-only variables (never exposed to browser)
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

// Helper function to check current environment
export const isDevelopment = () => config.appEnv === "development";
export const isStaging = () => config.appEnv === "staging";
export const isProduction = () => config.appEnv === "production";

// Log environment on server startup (server-side only)
if (typeof window === "undefined") {
  console.log("🚀 Application Configuration:");
  console.log(`   Environment: ${config.appEnv}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   App Name: ${config.appName}`);
  console.log(`   Debug Mode: ${config.enableDebug}`);
  console.log(
    `   Database: ${config.databaseUrl ? "✅ Configured" : "❌ Not configured"}`
  );
}

export default config;
