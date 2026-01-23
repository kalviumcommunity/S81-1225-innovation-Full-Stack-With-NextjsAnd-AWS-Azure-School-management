"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";

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
  const searchParams = useSearchParams();

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

    const toastId = toast.loading("Creating assignment…");
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
      toast.error(res.message || "Failed to create assignment", {
        id: toastId,
      });
      return;
    }

    toast.success("Assignment created", { id: toastId });

    setTitle("");
    setDescription("");
    setPriority(1);
    setProjectId("");
    setDueDate("");
    await loadAll();
  }

  async function onDeleteTask(taskId: string) {
    if (!token) return;

    const toastId = toast.loading("Deleting assignment…");
    setDeleting(true);
    setError(null);

    const res = await apiFetch<{ id: string }>(`/tasks/${taskId}`, {
      method: "DELETE",
      token,
    });

    setDeleting(false);

    if (!res.success) {
      setError(res.message);
      toast.error(res.message || "Failed to delete assignment", {
        id: toastId,
      });
      return;
    }

    toast.success("Assignment deleted", { id: toastId });
    setDeletingId(null);
    await loadAll();
  }

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [tasks, query, statusFilter]);

  const columns = useMemo<Column<Task>[]>(
    () => [
      {
        key: "title",
        header: "Assignment",
        cell: (t) => (
          <span className="font-medium text-foreground">{t.title}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        widthClassName: "w-[140px]",
        cell: (t) => (
          <StatusBadge
            variant={
              t.status === "COMPLETED"
                ? "success"
                : t.status === "IN_PROGRESS"
                  ? "warning"
                  : "neutral"
            }
          >
            {t.status}
          </StatusBadge>
        ),
      },
      {
        key: "priority",
        header: "Priority",
        widthClassName: "w-[120px]",
        cell: (t) => <span className="text-foreground/70">{t.priority}</span>,
      },
      {
        key: "actions",
        header: "",
        widthClassName: "w-[140px]",
        cell: (t) => (
          <ConfirmDialog
            open={deletingId === t.id}
            onOpenChange={(open) => setDeletingId(open ? t.id : null)}
            title="Delete assignment?"
            description="This action cannot be undone."
            confirmLabel={
              deletingId === t.id && deleting ? "Deleting…" : "Delete"
            }
            confirmVariant="danger"
            confirmDisabled={deleting}
            onConfirm={() => onDeleteTask(t.id)}
          >
            <Button variant="secondary" type="button" className="px-3">
              Delete
            </Button>
          </ConfirmDialog>
        ),
      },
    ],
    [deletingId, deleting, token]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Create and track assignments across courses (stored as tasks)."
      />

      <Card>
        <CardHeader title="Create task" />
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={onCreate}
        >
          {submitting ? (
            <p role="status" aria-live="polite" className="sr-only">
              Creating assignment…
            </p>
          ) : null}

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
            <Button
              type="submit"
              disabled={submitting || !canCreate}
              aria-busy={submitting}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" />
                  Creating…
                </span>
              ) : (
                "Create task"
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Recent assignments"
          description={loading ? "Loading…" : `${filteredTasks.length} shown`}
        />

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assignments…"
          />
          <select
            className="h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <div />
        </div>

        <DataTable
          columns={columns}
          rows={filteredTasks}
          emptyMessage={loading ? "Loading…" : "No assignments found."}
        />
      </Card>
    </div>
  );
}
