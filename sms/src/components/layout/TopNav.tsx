"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Avoid duplicating navigation inside the existing /app dashboard shell.
  if (pathname?.startsWith("/app")) return null;

  return (
    <header className="border-b border-foreground/10 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="font-medium text-foreground" href="/">
            Home
          </Link>
          {isAuthenticated ? (
            <Link
              className="text-foreground/80 hover:text-foreground"
              href="/app"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="text-foreground/80 hover:text-foreground"
              href="/login"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-foreground/70">
                {user.firstName || user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-md border border-foreground/10 px-3 py-1.5 text-foreground/80 hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              className="rounded-md border border-foreground/10 px-3 py-1.5 text-foreground/80 hover:text-foreground"
              href="/login"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
