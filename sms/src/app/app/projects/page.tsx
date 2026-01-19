"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Projects</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Create and manage projects.
        </p>
      </div>

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
          title="Your projects"
          description={loading ? "Loading…" : `${projects.length} total`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-foreground/70">
              <tr className="border-b border-foreground/10">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-foreground/10">
                  <td className="py-2 pr-4 text-foreground">{p.title}</td>
                  <td className="py-2 pr-4 text-foreground/70">
                    {p._count?.tasks ?? 0}
                  </td>
                </tr>
              ))}
              {!loading && projects.length === 0 ? (
                <tr>
                  <td className="py-3 text-foreground/60" colSpan={2}>
                    No projects found.
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
