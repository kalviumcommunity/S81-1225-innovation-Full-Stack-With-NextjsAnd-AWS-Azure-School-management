"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type CreateUserResult = {
  user: UserRow;
  tempPassword: string | null;
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

  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState<CreateUserResult | null>(
    null
  );

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

  async function createTeacher() {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setCreateSubmitting(true);
    setCreateResult(null);

    const toastId = toast.loading("Creating teacher…");

    const res = await apiFetch<CreateUserResult>("/users", {
      token,
      method: "POST",
      body: {
        email: createEmail.trim(),
        firstName: createFirstName.trim(),
        lastName: createLastName.trim(),
        role: "TEACHER",
        password: createPassword.trim() ? createPassword : undefined,
      },
    });

    if (!res.success || !res.data) {
      toast.error(res.message || "Failed to create teacher", { id: toastId });
      setCreateSubmitting(false);
      return;
    }

    const created = res.data;
    setCreateResult(created);
    setUsers((prev) => [created.user, ...prev]);
    toast.success("Teacher created", { id: toastId });
    setCreateSubmitting(false);
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }

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
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Student & Staff Directory"
          subtitle="Admin-only directory (cached via Redis)."
        />

        <Dialog.Root
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (open) {
              setCreateResult(null);
            }
          }}
        >
          <Dialog.Trigger asChild>
            <Button type="button">Add teacher</Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/15 bg-background p-5 shadow-lg focus:outline-none">
              <Dialog.Title className="text-base font-semibold">
                Add teacher
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-foreground/70">
                Create a teacher account. You can set a password, or leave it
                blank to generate a temporary one.
              </Dialog.Description>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="teacher@email.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>

                <Input
                  value={createFirstName}
                  onChange={(e) => setCreateFirstName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />

                <Input
                  value={createLastName}
                  onChange={(e) => setCreateLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />

                <div className="md:col-span-2">
                  <Input
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Password (optional, min 8 chars)"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {createResult ? (
                <div className="mt-4 rounded-md border border-foreground/10 bg-foreground/5 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">
                        Created: {createResult.user.email}
                      </div>
                      <div className="text-foreground/70">
                        Role: {createResult.user.role}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void copyToClipboard(createResult.user.email)
                      }
                    >
                      Copy email
                    </Button>
                  </div>

                  {createResult.tempPassword ? (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-foreground">
                          Temporary password
                        </div>
                        <div className="font-mono text-foreground/80">
                          {createResult.tempPassword}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          void copyToClipboard(createResult.tempPassword || "")
                        }
                      >
                        Copy password
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 text-foreground/70">
                      Password was set by admin (not shown).
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  disabled={createSubmitting}
                  onClick={() => void createTeacher()}
                >
                  Create teacher
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

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
