"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Project = {
  id: string;
  title: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: number;
  projectId: string;
  createdAt?: string;
};

function toIsoDateTimeLocal(value: string): string {
  return new Date(value).toISOString();
}

export default function TasksPage() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canCreate = useMemo(() => !!title && !!projectId, [title, projectId]);

  async function loadAll() {
    if (!token) return;

    setLoading(true);
    setError(null);

    const [p, t] = await Promise.all([
      apiFetch<Project[]>("/projects", { token }),
      apiFetch<Task[]>("/tasks", { token }),
    ]);

    if (!p.success) {
      setError(p.message);
      setProjects([]);
    } else {
      setProjects(p.data || []);
    }

    if (!t.success) {
      setError(t.message);
      setTasks([]);
    } else {
      setTasks(t.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !canCreate) return;

    setSubmitting(true);
    setError(null);

    const body: any = {
      title,
      description: description || undefined,
      priority,
      projectId,
      dueDate: dueDate ? toIsoDateTimeLocal(dueDate) : undefined,
    };

    const res = await apiFetch<Task>("/tasks", { method: "POST", token, body });
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setTitle("");
    setDescription("");
    setPriority(1);
    setProjectId("");
    setDueDate("");
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Create and track tasks across projects.
        </p>
      </div>

      <Card>
        <CardHeader title="Create task" />
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={onCreate}
        >
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Project
            </label>
            <select
              className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Priority (1–5)
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Due date (optional)
            </label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            {error ? (
              <p className="mb-2 text-sm text-red-600">{error}</p>
            ) : null}
            <Button type="submit" disabled={submitting || !canCreate}>
              {submitting ? "Creating…" : "Create task"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Recent tasks"
          description={loading ? "Loading…" : `${tasks.length} total`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-foreground/70">
              <tr className="border-b border-foreground/10">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-foreground/10">
                  <td className="py-2 pr-4 text-foreground">{t.title}</td>
                  <td className="py-2 pr-4 text-foreground/70">{t.status}</td>
                  <td className="py-2 pr-4 text-foreground/70">{t.priority}</td>
                </tr>
              ))}
              {!loading && tasks.length === 0 ? (
                <tr>
                  <td className="py-3 text-foreground/60" colSpan={3}>
                    No tasks found.
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
