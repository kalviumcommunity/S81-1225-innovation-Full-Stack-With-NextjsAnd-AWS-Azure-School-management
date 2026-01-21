"use client";

// Back-compat re-exports.
// Existing app code imports from `@/components/auth/AuthProvider`.
// Lesson code uses `src/context/*` + `src/hooks/*`.

export { AuthProvider, useAuthContext } from "@/context/AuthContext";
export { useAuth } from "@/hooks/useAuth";
