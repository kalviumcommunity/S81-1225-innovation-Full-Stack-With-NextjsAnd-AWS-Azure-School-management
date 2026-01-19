"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";

type Project = {
  id: string;
  title: string;
  description?: string | null;
  createdAt?: string;
  _count?: { tasks: number };
};

type Task = {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = useMemo(() => user?.firstName || user?.email || "", [user]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);

      const [p, t] = await Promise.all([
        apiFetch<Project[]>("/projects", { token }),
        apiFetch<Task[]>("/tasks", { token }),
      ]);

      if (!mounted) return;

      if (!p.success) {
        setError(p.message);
      } else {
        setProjects(p.data || []);
      }

      if (!t.success) {
        setError(t.message);
      } else {
        setTasks(t.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Welcome back, {firstName}.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader
            title="Projects"
            description={loading ? "Loading…" : `${projects.length} total`}
          />
        </Card>
        <Card>
          <CardHeader
            title="Tasks"
            description={loading ? "Loading…" : `${tasks.length} total`}
          />
        </Card>
        <Card>
          <CardHeader title="Role" description={user?.role || "—"} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Recent projects" />
          <ul className="space-y-2">
            {(projects || []).slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{p.title}</span>
                <span className="text-foreground/60">
                  {p._count?.tasks ?? 0} tasks
                </span>
              </li>
            ))}
            {!loading && projects.length === 0 ? (
              <li className="text-sm text-foreground/60">No projects yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent tasks" />
          <ul className="space-y-2">
            {(tasks || []).slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{t.title}</span>
                <span className="text-foreground/60">{t.status}</span>
              </li>
            ))}
            {!loading && tasks.length === 0 ? (
              <li className="text-sm text-foreground/60">No tasks yet.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
