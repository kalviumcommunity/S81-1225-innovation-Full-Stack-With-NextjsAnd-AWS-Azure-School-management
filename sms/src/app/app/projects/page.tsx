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
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import * as Dialog from "@radix-ui/react-dialog";

type Project = {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  startDate?: string;
  endDate?: string | null;
  createdAt?: string;
  isEnrolled?: boolean;
  creator?: { firstName: string; lastName: string; email: string };
  _count?: { tasks?: number; enrollments?: number };
};

function toIsoDateTimeLocal(value: string): string {
  // input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
  // Next expects ISO string; new Date(value).toISOString() is okay here.
  return new Date(value).toISOString();
}

export default function ProjectsPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  const isStudent = user?.role === "STUDENT";
  const canCreate = user?.role === "TEACHER" || user?.role === "ADMIN";

  type EnrolledStudent = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    enrolledAt: string;
  };

  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentsCourse, setStudentsCourse] = useState<Project | null>(null);
  const [studentsList, setStudentsList] = useState<EnrolledStudent[]>([]);

  async function openStudents(course: Project) {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setStudentsCourse(course);
    setStudentsOpen(true);
    setStudentsError(null);
    setStudentsList([]);
    setStudentsLoading(true);

    const res = await apiFetch<EnrolledStudent[]>(
      `/projects/${course.id}/students`,
      { token }
    );

    if (!res.success) {
      setStudentsError(res.message || "Failed to load students");
      setStudentsList([]);
    } else {
      setStudentsError(null);
      setStudentsList(res.data || []);
    }

    setStudentsLoading(false);
  }

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function load() {
    setLoading(true);
    const res = await apiFetch<Project[]>("/projects", { token });
    if (!res.success) {
      setError(res.message);
      setProjects([]);
    } else {
      setError(null);
      setProjects(res.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canCreate) {
      setError("You do not have permission to create courses.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const body: any = {
      title,
      description: description || undefined,
      startDate: toIsoDateTimeLocal(startDate),
      endDate: endDate ? toIsoDateTimeLocal(endDate) : undefined,
    };

    const res = await apiFetch<Project>("/projects", {
      method: "POST",
      token,
      body,
    });
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    await load();
  }

  async function enroll(projectId: string) {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const toastId = toast.loading("Registering…");

    const res = await apiFetch<{ id?: string; projectId: string }>(
      `/projects/${projectId}/enroll`,
      {
        token,
        method: "POST",
      }
    );

    if (!res.success) {
      toast.error(res.message || "Failed", { id: toastId });
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              isEnrolled: true,
              _count: {
                ...p._count,
                enrollments: Math.max(0, (p._count?.enrollments ?? 0) + 1),
              },
            }
      )
    );

    toast.success("Registered", { id: toastId });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);

  const columns = useMemo<Column<Project>[]>(
    () => [
      {
        key: "title",
        header: "Course / Project",
        cell: (p) => (
          <div>
            <div className="font-medium text-foreground">{p.title}</div>
            {p.description ? (
              <div className="mt-0.5 text-xs text-foreground/60 line-clamp-2">
                {p.description}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        widthClassName: "w-[140px]",
        cell: (p) => (
          <StatusBadge
            variant={
              p.status === "ACTIVE"
                ? "success"
                : p.status === "COMPLETED"
                  ? "neutral"
                  : "warning"
            }
          >
            {p.status || ""}
          </StatusBadge>
        ),
      },
      {
        key: "tasks",
        header: "Assignments",
        widthClassName: "w-[140px]",
        cell: (p) => (
          <span className="text-foreground/70">{p._count?.tasks ?? 0}</span>
        ),
      },
      {
        key: "students",
        header: "Students",
        widthClassName: "w-[120px]",
        cell: (p) => (
          <span className="text-foreground/70">
            {p._count?.enrollments ?? 0}
          </span>
        ),
      },
      ...(isStudent
        ? ([
            {
              key: "actions",
              header: "",
              widthClassName: "w-[160px]",
              cell: (p) => (
                <Button
                  type="button"
                  variant={p.isEnrolled ? "secondary" : "primary"}
                  onClick={() => void enroll(p.id)}
                  disabled={
                    !!p.isEnrolled || (!p.isEnrolled && p.status !== "ACTIVE")
                  }
                >
                  {p.isEnrolled ? "Registered" : "Register"}
                </Button>
              ),
            },
          ] as Column<Project>[])
        : []),
      ...(!isStudent
        ? ([
            {
              key: "view",
              header: "",
              widthClassName: "w-[160px]",
              cell: (p) => (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void openStudents(p)}
                >
                  View students
                </Button>
              ),
            },
          ] as Column<Project>[])
        : []),
    ],
    [isStudent]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle={
          isStudent
            ? "Browse courses and register (projects are used as courses)."
            : "Create and manage courses (stored as projects)."
        }
      />

      {canCreate ? (
        <Card>
          <CardHeader
            title="Create course"
            description="This creates a course (project) under your account."
          />
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={onCreate}
          >
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-foreground">
                Start date
              </label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
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
                End date (optional)
              </label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              {error ? (
                <p className="mb-2 text-sm text-red-600">{error}</p>
              ) : null}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create course"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title={isStudent ? "Available courses" : "Your courses"}
          description={loading ? "Loading…" : `${filtered.length} shown`}
        />

        <div className="mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
          />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          emptyMessage={loading ? "Loading…" : "No courses found."}
        />
      </Card>

      <Dialog.Root open={studentsOpen} onOpenChange={setStudentsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/15 bg-background p-5 shadow-lg focus:outline-none">
            <Dialog.Title className="text-base font-semibold">
              Registered students
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-foreground/70">
              {studentsCourse ? studentsCourse.title : "Course"}
            </Dialog.Description>

            <div className="mt-4">
              {studentsError ? (
                <p className="text-sm text-red-600">{studentsError}</p>
              ) : null}

              {studentsLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-foreground/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
                </div>
              ) : studentsList.length === 0 ? (
                <p className="text-sm text-foreground/70">
                  No students registered yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {studentsList.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-foreground/10 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {(s.firstName || "") + " " + (s.lastName || "")}
                        </div>
                        <div className="truncate text-xs text-foreground/60">
                          {s.email}
                        </div>
                      </div>
                      <StatusBadge variant={s.isActive ? "success" : "danger"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
