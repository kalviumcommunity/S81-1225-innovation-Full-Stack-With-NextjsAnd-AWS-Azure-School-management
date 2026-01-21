"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;

      setLoading(true);
      setError(null);

      const res = await apiFetch<UserRow[]>("/users", { token });

      if (!mounted) return;

      if (!res.success) {
        setError(res.message);
        setUsers([]);
      } else {
        setUsers(res.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users
      .filter((u) => {
        if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
        if (activeFilter === "ACTIVE" && !u.isActive) return false;
        if (activeFilter === "INACTIVE" && u.isActive) return false;

        if (!q) return true;
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return (
          name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [users, query, roleFilter, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, activeFilter]);

  const columns = useMemo<Column<UserRow>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (u) => (
          <div>
            <div className="font-medium text-foreground">
              {(u.firstName || "") + " " + (u.lastName || "")}
            </div>
            <div className="text-xs text-foreground/60">{u.email}</div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        widthClassName: "w-[120px]",
        cell: (u) => <StatusBadge variant="neutral">{u.role}</StatusBadge>,
      },
      {
        key: "status",
        header: "Status",
        widthClassName: "w-[120px]",
        cell: (u) => (
          <StatusBadge variant={u.isActive ? "success" : "danger"}>
            {u.isActive ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
    ],
    []
  );

  if (user?.role !== "ADMIN") {
    return (
      <Card>
        <CardHeader title="Users" description="Admin access required." />
        <p className="text-sm text-foreground/70">
          You do not have permission to view this page.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student & Staff Directory"
        subtitle="Admin-only directory (cached via Redis)."
      />

      <Card>
        <CardHeader
          title="All users"
          description={loading ? "Loading…" : `${filtered.length} matching`}
        />
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role…"
          />

          <select
            className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
          </select>

          <select
            className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          rows={pageRows}
          emptyMessage={loading ? "Loading…" : "No users match your filters."}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-foreground/60">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-foreground/10 px-3 py-1.5 text-sm text-foreground/80 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-md border border-foreground/10 px-3 py-1.5 text-sm text-foreground/80 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
