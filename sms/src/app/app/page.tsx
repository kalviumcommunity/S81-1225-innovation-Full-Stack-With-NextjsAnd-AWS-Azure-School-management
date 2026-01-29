"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiFetch } from "@/utils/api-client";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

type Project = {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  isEnrolled?: boolean;
  createdAt?: string;
  _count?: { tasks?: number; enrollments?: number };
};

type Task = {
  id: string;
  title: string;
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

function accentForCourse(title: string): {
  strip: string;
  dot: string;
} {
  const accents = [
    {
      strip: "bg-linear-to-r from-brand/45 via-sky-400/25 to-emerald-400/25",
      dot: "bg-brand",
    },
    {
      strip: "bg-linear-to-r from-emerald-500/40 via-teal-400/25 to-sky-400/25",
      dot: "bg-emerald-600",
    },
    {
      strip: "bg-linear-to-r from-indigo-500/40 via-brand/25 to-amber-400/25",
      dot: "bg-indigo-600",
    },
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }

  const idx = Math.abs(hash) % accents.length;
  return accents[idx];
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const isStudent = user?.role === "STUDENT";
  const canManageCourses = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = useMemo(() => user?.firstName || user?.email || "", [user]);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      if (isStudent) {
        const p = await apiFetch<Project[]>("/projects", { token });
        if (!mounted) return;
        if (!p.success) {
          setError(p.message);
          setProjects([]);
        } else {
          setProjects(p.data || []);
        }
        setTasks([]);
        setLoading(false);
        return;
      }

      if (!canManageCourses) {
        setProjects([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      const [p, t] = await Promise.all([
        apiFetch<Project[]>("/projects", { token }),
        apiFetch<Task[]>("/tasks", { token }),
      ]);

      if (!mounted) return;

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

    load();
    return () => {
      mounted = false;
    };
  }, [token, canManageCourses, isStudent]);

  const studentCourses = useMemo(() => {
    if (!isStudent) return [];
    if (!query) return projects;

    return (projects || []).filter((p) => {
      const haystack = [p.title, p.description || "", p.status || ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [isStudent, projects, query]);

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-foreground/10 bg-linear-to-r from-brand/10 via-(--surface) to-emerald-500/10 p-4 shadow-sm shadow-black/5 dark:border-foreground/15 dark:bg-linear-to-r dark:from-brand/15 dark:via-foreground/5 dark:to-emerald-500/10 sm:p-6">
        <PageHeader
          title="Home"
          subtitle={`Welcome back, ${firstName}.`}
          actions={
            <StatusBadge variant="neutral">{user?.role || "—"}</StatusBadge>
          }
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {isStudent ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">
              Available courses
            </h2>
            <Link
              href="/app/assignments"
              className="text-sm text-brand hover:text-brand-dark hover:underline"
            >
              View my assignments
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </Card>
              <Card>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </Card>
              <Card>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </Card>
            </div>
          ) : studentCourses.length === 0 ? (
            <Card>
              <CardHeader
                title="No courses"
                description={
                  query
                    ? "No courses match your search."
                    : "No courses are available right now."
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {studentCourses.map((c) => (
                <Card
                  key={c.id}
                  className="flex flex-col overflow-hidden shadow-md shadow-black/10 transition-shadow hover:shadow-lg hover:shadow-black/15"
                >
                  <div
                    className={`-mx-6 -mt-6 mb-4 h-1.5 ${
                      accentForCourse(c.title).strip
                    }`}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            accentForCourse(c.title).dot
                          }`}
                        />
                        <div className="truncate text-base font-semibold text-foreground">
                          {c.title}
                        </div>
                      </div>
                      {c.description ? (
                        <div className="mt-1 line-clamp-2 text-sm text-foreground/70">
                          {c.description}
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-foreground/60">
                          No description.
                        </div>
                      )}
                    </div>
                    <StatusBadge
                      variant={c.status === "ACTIVE" ? "success" : "neutral"}
                    >
                      {c.status || "—"}
                    </StatusBadge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/70">
                    <span className="text-brand-dark dark:text-brand-light">
                      {c._count?.tasks ?? 0} assignments
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-300">
                      {c._count?.enrollments ?? 0} registered
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant={c.isEnrolled ? "secondary" : "primary"}
                      disabled={
                        !!c.isEnrolled ||
                        (!c.isEnrolled && c.status !== "ACTIVE")
                      }
                      onClick={() => void enroll(c.id)}
                    >
                      {c.isEnrolled ? "Registered" : "Register"}
                    </Button>

                    <Link
                      href="/app/projects"
                      className="text-sm text-brand hover:text-brand-dark hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {canManageCourses ? (
              <>
                <Card>
                  <CardHeader
                    title="Courses"
                    description={
                      loading ? "Loading…" : `${projects.length} total`
                    }
                  />
                  {loading ? <Skeleton className="h-6 w-24" /> : null}
                </Card>
                <Card>
                  <CardHeader
                    title="Assignments"
                    description={loading ? "Loading…" : `${tasks.length} total`}
                  />
                  {loading ? <Skeleton className="h-6 w-24" /> : null}
                </Card>
                <Card>
                  <CardHeader
                    title="Registrations"
                    description={
                      loading
                        ? "Loading…"
                        : `${(projects || []).reduce(
                            (acc, p) => acc + (p._count?.enrollments ?? 0),
                            0
                          )} total`
                    }
                  />
                  {loading ? <Skeleton className="h-6 w-24" /> : null}
                </Card>
              </>
            ) : (
              <Card className="md:col-span-2">
                <CardHeader
                  title="Teacher-only"
                  description="Courses and assignments are available to teachers."
                />
                <p className="text-sm text-foreground/70">
                  Contact an admin if you need teacher access.
                </p>
              </Card>
            )}
          </div>

          {canManageCourses ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader title="Recent courses" />
                <ul className="space-y-2">
                  {(projects || []).slice(0, 5).map((p) => (
                    <li
                      key={p.id}
                      className="flex min-w-0 items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {p.title}
                      </span>
                      <span className="shrink-0 text-foreground/60">
                        {p._count?.enrollments ?? 0} students •{" "}
                        {p._count?.tasks ?? 0} tasks
                      </span>
                    </li>
                  ))}
                  {!loading && projects.length === 0 ? (
                    <li className="text-sm text-foreground/60">
                      No courses yet.
                    </li>
                  ) : null}
                  {loading ? (
                    <li className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </li>
                  ) : null}
                </ul>
              </Card>

              <Card>
                <CardHeader title="Recent assignments" />
                <ul className="space-y-2">
                  {(tasks || []).slice(0, 5).map((t) => (
                    <li
                      key={t.id}
                      className="flex min-w-0 items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {t.title}
                      </span>
                      <span className="shrink-0 text-foreground/60">
                        {t.status}
                      </span>
                    </li>
                  ))}
                  {!loading && tasks.length === 0 ? (
                    <li className="text-sm text-foreground/60">
                      No assignments yet.
                    </li>
                  ) : null}
                  {loading ? (
                    <li className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </li>
                  ) : null}
                </ul>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
