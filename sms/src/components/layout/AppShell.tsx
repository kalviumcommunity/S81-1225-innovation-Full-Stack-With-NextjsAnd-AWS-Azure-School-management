"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

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
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-sm font-semibold text-foreground">
              School Management System
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/app/projects" label="Projects" />
              <NavLink href="/app/tasks" label="Tasks" />
              <NavLink href="/app/users" label="Users" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-medium text-foreground">
                {user?.firstName || user?.email}
              </div>
              <div className="text-xs text-foreground/60">{user?.role}</div>
            </div>
            <Button variant="secondary" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
