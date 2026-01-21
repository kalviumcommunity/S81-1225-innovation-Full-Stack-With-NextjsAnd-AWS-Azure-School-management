"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Avoid duplicating navigation inside the existing /app dashboard shell.
  if (pathname?.startsWith("/app")) return null;

  return (
    <header className="border-b border-foreground/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link className="font-medium text-foreground" href="/">
            Home
          </Link>
          <Link
            className="text-foreground/80 hover:text-foreground"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="text-foreground/80 hover:text-foreground"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-foreground/80 hover:text-foreground"
            href="/users"
          >
            Users
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
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
