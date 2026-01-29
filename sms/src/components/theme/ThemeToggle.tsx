"use client";

import { useUI } from "@/hooks/useUI";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useUI();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`inline-flex h-10 items-center justify-center rounded-md border border-foreground/10 bg-background px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground ${className}`}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
