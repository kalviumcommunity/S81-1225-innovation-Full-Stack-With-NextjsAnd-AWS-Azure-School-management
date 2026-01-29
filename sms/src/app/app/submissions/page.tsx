"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";

import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { apiFetch } from "@/utils/api-client";
import { toast } from "sonner";

type SubmissionRow = {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  fileUrl?: string | null;
  grade?: number | null;
  feedback?: string | null;
  updatedAt?: string;
  student?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  task?: {
    id: string;
    title: string;
    project?: { id: string; title: string };
  };
};

function formatName(u?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const first = (u?.firstName || "").trim();
  const last = (u?.lastName || "").trim();
  const combined = `${first} ${last}`.trim();
  return combined || u?.email || "—";
}

export default function SubmissionsPage() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const canGrade = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const [gradingOpen, setGradingOpen] = useState(false);
  const [grading, setGrading] = useState<SubmissionRow | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);

      const res = await apiFetch<SubmissionRow[]>("/submissions", { token });
      if (!mounted) return;

      if (!res.success) {
        setError(res.message || "Failed to load submissions");
        setRows([]);
      } else {
        setRows(res.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((s) => {
      const haystack = [
        s.task?.title || "",
        s.task?.project?.title || "",
        formatName(s.student),
        s.student?.email || "",
        String(s.grade ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, q]);

  const columns = useMemo<Column<SubmissionRow>[]>(
    () => [
      {
        key: "assignment",
        header: "Assignment",
        widthClassName: "min-w-[260px]",
        cell: (s) => (
          <div className="min-w-0">
            <div
              className="truncate font-medium text-foreground"
              title={s.task?.title || ""}
            >
              {s.task?.title || "—"}
            </div>
            <div className="mt-0.5 truncate text-xs text-foreground/60">
              {s.task?.project?.title || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        widthClassName: "min-w-[200px]",
        cell: (s) => (
          <div className="min-w-0">
            <div className="truncate text-foreground">
              {formatName(s.student)}
            </div>
            <div className="mt-0.5 truncate text-xs text-foreground/60">
              {s.student?.email || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "updated",
        header: "Submitted",
        widthClassName: "min-w-[160px]",
        cell: (s) => {
          const d = s.updatedAt ? new Date(s.updatedAt) : null;
          return (
            <span className="text-foreground/70">
              {d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : "—"}
            </span>
          );
        },
      },
      {
        key: "grade",
        header: "Grade",
        widthClassName: "min-w-[120px]",
        cell: (s) => (
          <StatusBadge variant={s.grade == null ? "neutral" : "success"}>
            {s.grade == null ? "Ungraded" : s.grade}
          </StatusBadge>
        ),
      },
      {
        key: "actions",
        header: "",
        widthClassName: "w-[140px]",
        cell: (s) => (
          <Button
            type="button"
            variant="secondary"
            disabled={!canGrade}
            onClick={() => {
              setGrading(s);
              setGrade(s.grade == null ? "" : String(s.grade));
              setFeedback(s.feedback || "");
              setGradingOpen(true);
            }}
          >
            Grade
          </Button>
        ),
      },
    ],
    [canGrade]
  );

  async function saveGrade() {
    if (!token || !grading) return;

    const n = grade.trim() ? Number(grade.trim()) : null;
    if (grade.trim() && Number.isNaN(n)) {
      toast.error("Grade must be a number");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving…");

    const res = await apiFetch<SubmissionRow>(`/submissions/${grading.id}`, {
      method: "PATCH",
      token,
      body: {
        grade: n,
        feedback: feedback.trim() ? feedback.trim() : null,
      },
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.message || "Failed to save", { id: toastId });
      return;
    }

    toast.success("Saved", { id: toastId });
    const updated = res.data;

    setRows((prev) =>
      prev.map((r) => (r.id === grading.id ? { ...r, ...updated } : r))
    );

    setGradingOpen(false);
    setGrading(null);
  }

  if (!canGrade) {
    return (
      <Card>
        <CardHeader
          title="Submissions"
          description="This page is for teachers and admins."
        />
        <p className="text-sm text-foreground/70">
          Students can view their submission on each assignment detail page.
        </p>
        <p className="mt-3 text-sm">
          Go to{" "}
          <Link href="/app/assignments" className="underline">
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
        title="Submissions"
        subtitle={q ? `Filtered by: ${q}` : "Review, grade, and give feedback"}
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Submissions" },
        ]}
        actions={<StatusBadge variant="neutral">{filtered.length}</StatusBadge>}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader
          title="All submissions"
          description={loading ? "Loading…" : `${filtered.length} shown`}
        />

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <DataTable columns={columns} rows={filtered} pageSize={10} />
        )}
      </Card>

      <Dialog.Root open={gradingOpen} onOpenChange={setGradingOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/15 bg-background p-5 shadow-lg focus:outline-none">
            <Dialog.Title className="text-base font-semibold">
              Grade submission
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-foreground/70">
              {grading?.task?.title ? `Assignment: ${grading.task.title}` : ""}
            </Dialog.Description>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Grade
                </label>
                <Input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 95"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Feedback
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional feedback for the student"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={saving}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={() => void saveGrade()}
                disabled={saving}
              >
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
