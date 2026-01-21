"use client";

import { useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const ctx = useAuthContext();

  return useMemo(
    () => ({
      ...ctx,
      isAuthenticated: !!ctx.token && !!ctx.user,
      displayName: ctx.user ? ctx.user.firstName || ctx.user.email : "",
    }),
    [ctx]
  );
}
