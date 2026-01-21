"use client";

import { useMemo } from "react";
import { useUIContext } from "@/context/UIContext";

export function useUI() {
  const ctx = useUIContext();

  return useMemo(
    () => ({
      ...ctx,
      isDark: ctx.theme === "dark",
    }),
    [ctx]
  );
}
