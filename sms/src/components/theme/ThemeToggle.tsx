"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`rounded-md border border-foreground/10 px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground ${className}`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
