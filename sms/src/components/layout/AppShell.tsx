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
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground/5 text-foreground"
          : "text-foreground/70 hover:bg-foreground/5"
      }`}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const { sidebarOpen, openSidebar, closeSidebar } = useUI();

  const displayName = useMemo(
    () => user?.firstName || user?.email || "",
    [user]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 text-foreground/80 hover:text-foreground md:hidden"
              onClick={openSidebar}
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link href="/app" className="text-sm font-semibold text-foreground">
              SMS Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette token={token} role={user?.role} />
            <ThemeToggle className="hidden sm:inline-flex" />
            <div className="hidden items-center gap-2 md:flex">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {displayName}
                </div>
                <div className="text-xs text-foreground/60">{user?.role}</div>
              </div>
              <StatusBadge variant="neutral">{user?.role || "—"}</StatusBadge>
            </div>
            <Button variant="secondary" onClick={() => logout()}>
              Logout
            </Button>
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
              <NavLink href="/app" label="Overview" />
              <NavLink href="/app/projects" label="Courses" />
              <NavLink href="/app/tasks" label="Assignments" />
              <NavLink href="/app/users" label="Users" />
            </div>

            <div className="mt-6">
              <ThemeToggle className="w-full justify-center" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
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
              <NavLink href="/app" label="Overview" />
              <NavLink href="/app/projects" label="Courses" />
              <NavLink href="/app/tasks" label="Assignments" />
              <NavLink href="/app/users" label="Users" />
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
