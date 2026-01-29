"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiFetch } from "@/utils/api-client";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: number;
  dueDate?: string | null;
  createdAt?: string;
  project?: { id: string; title: string } | null;
  creator?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  } | null;
};

function taskStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "IN_PROGRESS":
      return "warning" as const;
    case "CANCELLED":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export default function StudentAssignmentsPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const isStudent = user?.role === "STUDENT";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const t = await apiFetch<Task[]>("/tasks", { token });
      if (!mounted) return;

      if (!t.success) {
        setError(t.message);
        setTasks([]);
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

  const filtered = useMemo(() => {
    if (!query) return tasks;

    return (tasks || []).filter((t) => {
      const haystack = [t.title, t.status, t.project?.title || ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [tasks, query]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { projectId: string; projectTitle: string; tasks: Task[] }
    >();

    for (const t of filtered) {
      const projectId = t.project?.id || "unknown";
      const projectTitle = t.project?.title || "Unknown course";
      const existing = map.get(projectId);
      if (existing) {
        existing.tasks.push(t);
      } else {
        map.set(projectId, { projectId, projectTitle, tasks: [t] });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.projectTitle.localeCompare(b.projectTitle)
    );
  }, [filtered]);

  const columns = useMemo(() => {
    const cols: Column<Task>[] = [
      {
        key: "title",
        header: "Assignment",
        widthClassName: "min-w-[260px]",
        cell: (t) => (
          <Link
            href={`/app/assignments/${t.id}`}
            className="block min-w-0 truncate font-medium text-foreground hover:underline"
            title={t.title}
          >
            {t.title}
          </Link>
        ),
      },
      {
        key: "description",
        header: "Description",
        widthClassName: "min-w-[260px]",
        cell: (t) => (
          <span
            className="block min-w-0 truncate text-foreground/70"
            title={t.description || ""}
          >
            {t.description || "—"}
          </span>
        ),
      },
      {
        key: "due",
        header: "Due",
        widthClassName: "min-w-[120px]",
        cell: (t) => {
          const due = t.dueDate ? new Date(t.dueDate) : null;
          const dueLabel = due ? due.toLocaleDateString() : "—";

          const isOverdue =
            !!due &&
            !Number.isNaN(due.getTime()) &&
            due.getTime() < Date.now() &&
            t.status !== "COMPLETED";

          return (
            <span className={isOverdue ? "text-red-600" : "text-foreground/70"}>
              {dueLabel}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        widthClassName: "min-w-[140px]",
        cell: (t) => (
          <StatusBadge variant={taskStatusVariant(t.status)}>
            {t.status}
          </StatusBadge>
        ),
      },
    ];

    return cols;
  }, []);

  if (!isStudent) {
    return (
      <Card>
        <CardHeader
          title="Assignments"
          description="This view is intended for students."
        />
        <p className="text-sm text-foreground/70">
          Teachers can manage assignments from{" "}
          <Link href="/app/tasks" className="underline">
            Assignments
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle={
          query
            ? `Filtered by: ${query}`
            : "Assignments from your registered courses"
        }
        actions={<StatusBadge variant="neutral">{filtered.length}</StatusBadge>}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <Card>
          <CardHeader title="Assignments" description="Loading…" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ) : grouped.length === 0 ? (
        <Card>
          <CardHeader
            title="No assignments"
            description={
              query
                ? "No assignments match your search."
                : "Register for a course to see its assignments."
            }
          />
          <p className="text-sm text-foreground/70">
            Browse courses in{" "}
            <Link href="/app" className="underline">
              Home
            </Link>{" "}
            or{" "}
            <Link href="/app/projects" className="underline">
              Courses
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <Card key={g.projectId}>
              <CardHeader
                title={g.projectTitle}
                description={`${g.tasks.length} assignment${
                  g.tasks.length === 1 ? "" : "s"
                }`}
              />
              <DataTable
                columns={columns}
                rows={g.tasks}
                emptyMessage="No assignments in this course."
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
