"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

type TaskDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: number;
  dueDate?: string | null;
  project?: { id: string; title: string; createdBy?: string } | null;
  assignee?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

type SubmissionRow = {
  id: string;
  content: string;
  fileUrl?: string | null;
  grade?: number | null;
  feedback?: string | null;
  updatedAt?: string;
  student: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

function formatName(
  u?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  } | null
) {
  const first = (u?.firstName || "").trim();
  const last = (u?.lastName || "").trim();
  const combined = `${first} ${last}`.trim();
  return combined || u?.email || "—";
}

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

export default function TeacherTaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { token } = useAuth();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === gradingId) || null,
    [submissions, gradingId]
  );

  async function loadAll() {
    setLoading(true);
    setError(null);

    const [tRes, sRes] = await Promise.all([
      apiFetch<TaskDetail>(`/tasks/${params.id}`, { token }),
      apiFetch<any[]>(`/submissions?taskId=${encodeURIComponent(params.id)}`, {
        token,
      }),
    ]);

    if (!tRes.success) {
      setError(tRes.message);
      setTask(null);
    } else {
      setTask(tRes.data || null);
    }

    if (!sRes.success) {
      setError(sRes.message);
      setSubmissions([]);
    } else {
      const rows = (sRes.data || []).map((s: any) => ({
        id: s.id,
        content: s.content,
        fileUrl: s.fileUrl,
        grade: s.grade,
        feedback: s.feedback,
        updatedAt: s.updatedAt,
        student: s.student,
      })) as SubmissionRow[];
      setSubmissions(rows);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.id]);

  const dueLabel = useMemo(() => {
    if (!task?.dueDate) return "—";
    const d = new Date(task.dueDate);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
  }, [task?.dueDate]);

  const columns = useMemo<Column<SubmissionRow>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        widthClassName: "min-w-[220px]",
        cell: (s) => (
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {formatName(s.student)}
            </div>
            <div className="truncate text-xs text-foreground/60">
              {s.student.email}
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
        widthClassName: "w-[120px]",
        cell: (s) => (
          <StatusBadge variant={s.grade != null ? "success" : "neutral"}>
            {s.grade != null ? s.grade : "Ungraded"}
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
            onClick={() => {
              setGradingId(s.id);
              setGrade(s.grade == null ? "" : String(s.grade));
              setFeedback(s.feedback || "");
            }}
          >
            Grade
          </Button>
        ),
      },
    ],
    []
  );

  async function onSaveGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingId) return;

    setSaving(true);
    const toastId = toast.loading("Saving grade…");

    const parsedGrade = grade.trim() === "" ? null : Number(grade);
    if (
      parsedGrade !== null &&
      (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100)
    ) {
      toast.error("Grade must be 0–100", { id: toastId });
      setSaving(false);
      return;
    }

    const res = await apiFetch(`/submissions/${gradingId}`, {
      method: "PATCH",
      token,
      body: {
        grade: parsedGrade,
        feedback: feedback.trim() ? feedback.trim() : null,
      },
    });

    setSaving(false);

    if (!res.success) {
      toast.error(res.message || "Failed to save grade", { id: toastId });
      return;
    }

    toast.success("Saved", { id: toastId });
    setGradingId(null);
    setGrade("");
    setFeedback("");
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={task?.title || "Assignment"}
        subtitle={task?.project?.title ? `Course: ${task.project.title}` : ""}
        actions={
          task ? (
            <StatusBadge variant={taskStatusVariant(task.status)}>
              {task.status}
            </StatusBadge>
          ) : null
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader title="Details" description={loading ? "Loading…" : ""} />
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : task ? (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-foreground/60">Due: </span>
              <span className="text-foreground">{dueLabel}</span>
            </div>
            <div>
              <span className="text-foreground/60">Priority: </span>
              <span className="text-foreground">{task.priority ?? "—"}</span>
            </div>
            <div>
              <span className="text-foreground/60">Assignee: </span>
              <span className="text-foreground">
                {formatName(task.assignee)}
              </span>
            </div>
            {task.description ? (
              <div>
                <div className="text-foreground/60">Description</div>
                <div className="mt-1 whitespace-pre-wrap text-foreground">
                  {task.description}
                </div>
              </div>
            ) : null}
            <div className="pt-2">
              <Link
                href="/app/tasks"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                Back to Assignments
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/70">Assignment not found.</p>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Submissions"
          description={loading ? "Loading…" : `${submissions.length} received`}
        />
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={submissions}
            emptyMessage="No submissions yet."
          />
        )}
      </Card>

      {gradingId ? (
        <Card>
          <CardHeader title="Grade submission" />

          {selectedSubmission ? (
            <div className="mb-4 space-y-2 text-sm">
              <div className="text-foreground/70">
                Student:{" "}
                <span className="text-foreground">
                  {formatName(selectedSubmission.student)}
                </span>
              </div>
              {selectedSubmission.fileUrl ? (
                <div className="text-foreground/70">
                  File:{" "}
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground hover:underline"
                  >
                    Open
                  </a>
                </div>
              ) : null}
              <div>
                <div className="text-foreground/70">Submission</div>
                <div className="mt-1 whitespace-pre-wrap rounded-md border border-foreground/10 bg-foreground/5 p-3 text-foreground">
                  {selectedSubmission.content || "(empty)"}
                </div>
              </div>
            </div>
          ) : null}

          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={onSaveGrade}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Grade (0–100)
              </label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Feedback (optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Write feedback for the student…"
              />
            </div>

            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                    Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setGradingId(null);
                  setGrade("");
                  setFeedback("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
