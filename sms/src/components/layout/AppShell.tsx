"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useUI } from "@/hooks/useUI";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`block w-full rounded-md px-3 py-2 text-sm font-medium leading-5 transition-colors ${
        active
          ? "bg-foreground/5 text-foreground"
          : "text-foreground/70 hover:bg-foreground/5"
      }`}
    >
      <span className="block truncate">{label}</span>
    </Link>
  );
}

function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const value = (first + last).toUpperCase();
  return value || "?";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const { sidebarOpen, openSidebar, closeSidebar } = useUI();

  const displayName = useMemo(
    () => user?.firstName || user?.email || "",
    [user]
  );

  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  const navItems = useMemo(() => {
    const base = [{ href: "/app", label: "Home" }];

    if (user?.role === "STUDENT") {
      base.push({ href: "/app/assignments", label: "My Assignments" });
    }

    if (user?.role === "TEACHER" || user?.role === "ADMIN") {
      base.push(
        { href: "/app/projects", label: "Courses" },
        { href: "/app/tasks", label: "Assignments" }
      );
    }

    if (user?.role === "ADMIN") {
      base.push({ href: "/app/users", label: "Users" });
    }

    return base;
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 text-foreground/80 hover:text-foreground md:hidden"
              onClick={openSidebar}
              aria-label="Open menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <Link href="/app" className="text-sm font-semibold text-foreground">
              SMS Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette token={token} role={user?.role} />
            <ThemeToggle className="hidden sm:inline-flex" />

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-xs font-semibold text-foreground">
                  {initials}
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {displayName}
                  </div>
                  <div className="text-xs text-foreground/60">{user?.role}</div>
                </div>
                <StatusBadge variant="neutral">{user?.role || "—"}</StatusBadge>
              </div>

              <Button
                variant="secondary"
                onClick={() => logout()}
                aria-label="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="inline sm:hidden" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={closeSidebar}
            aria-label="Close menu"
          />
          <div className="relative h-full w-72 border-r border-foreground/10 bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Menu</div>
              <button
                type="button"
                className="rounded-md border border-foreground/10 px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground"
                onClick={closeSidebar}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>

            <div className="mt-6">
              <ThemeToggle className="w-full justify-center" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-16 space-y-2">
            <div className="rounded-lg border border-foreground/10 bg-background p-3">
              <div className="text-sm font-medium text-foreground">
                {displayName}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge variant="neutral">{user?.role || "—"}</StatusBadge>
                <span className="text-xs text-foreground/60">Account</span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
