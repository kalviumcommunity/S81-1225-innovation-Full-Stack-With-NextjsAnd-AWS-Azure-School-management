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

type Project = {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
  createdAt?: string;
  _count?: { tasks: number };
};

function toIsoDateTimeLocal(value: string): string {
  // input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
  // Next expects ISO string; new Date(value).toISOString() is okay here.
  return new Date(value).toISOString();
}

export default function ProjectsPage() {
  const { token } = useAuth();
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

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function load() {
    if (!token) return;
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
    if (!token) return;

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
        key: "tasks",
        header: "Assignments",
        widthClassName: "w-[140px]",
        cell: (p) => (
          <span className="text-foreground/70">{p._count?.tasks ?? 0}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Create and manage courses (stored as projects)."
      />

      <Card>
        <CardHeader
          title="Create project"
          description="This creates a project under your account."
        />
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
              {submitting ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Your courses"
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
    </div>
  );
}
