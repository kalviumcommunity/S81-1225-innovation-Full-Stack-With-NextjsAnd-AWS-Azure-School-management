"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";

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

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Admin-only user directory (cached via Redis).
        </p>
      </div>

      <Card>
        <CardHeader
          title="All users"
          description={loading ? "Loading…" : `${users.length} total`}
        />
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-foreground/70">
              <tr className="border-b border-foreground/10">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-foreground/10">
                  <td className="py-2 pr-4 text-foreground">
                    {(u.firstName || "") + " " + (u.lastName || "")}
                  </td>
                  <td className="py-2 pr-4 text-foreground/70">{u.email}</td>
                  <td className="py-2 pr-4 text-foreground/70">{u.role}</td>
                  <td className="py-2 pr-4 text-foreground/70">
                    {u.isActive ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 ? (
                <tr>
                  <td className="py-3 text-foreground/60" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
