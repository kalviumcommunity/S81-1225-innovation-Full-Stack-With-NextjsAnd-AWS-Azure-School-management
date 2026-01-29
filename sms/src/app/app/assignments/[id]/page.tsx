"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/utils/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
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
  createdAt?: string;
  project?: { id: string; title: string } | null;
  creator?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  } | null;
  comments?: Array<{
    id: string;
    content?: string | null;
    createdAt?: string;
    user?: { id: string; firstName?: string | null; lastName?: string | null };
  }>;
};

type Submission = {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  fileUrl?: string | null;
  grade?: number | null;
  feedback?: string | null;
  updatedAt?: string;
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

export default function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token } = useAuth();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const res = await apiFetch<TaskDetail>(`/tasks/${id}`, { token });

      if (!mounted) return;

      if (!res.success) {
        setError(res.message);
        setTask(null);
      } else {
        setTask(res.data || null);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token, id]);

  useEffect(() => {
    let mounted = true;

    async function loadSubmission() {
      setSubmissionLoading(true);
      setSubmissionError(null);

      const res = await apiFetch<Submission[]>(
        `/submissions?taskId=${encodeURIComponent(id)}`,
        { token }
      );

      if (!mounted) return;

      if (!res.success) {
        setSubmissionError(res.message);
        setSubmission(null);
        setContent("");
        setFileUrl("");
      } else {
        const first = (res.data || [])[0] || null;
        setSubmission(first);
        setContent(first?.content || "");
        setFileUrl(first?.fileUrl || "");
      }

      setSubmissionLoading(false);
    }

    loadSubmission();
    return () => {
      mounted = false;
    };
  }, [token, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setSubmissionError(null);

    const toastId = toast.loading("Submitting…");

    const res = await apiFetch<Submission>("/submissions", {
      method: "POST",
      token,
      body: {
        taskId: id,
        content: content.trim(),
        fileUrl: fileUrl.trim() ? fileUrl.trim() : undefined,
      },
    });

    setSubmitting(false);

    if (!res.success) {
      setSubmissionError(res.message);
      toast.error(res.message || "Failed to submit", { id: toastId });
      return;
    }

    toast.success("Submitted", { id: toastId });
    setSubmission(res.data || null);
  }

  const dueLabel = useMemo(() => {
    if (!task?.dueDate) return "—";
    const d = new Date(task.dueDate);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
  }, [task?.dueDate]);

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
        <CardHeader
          title="Details"
          description={
            loading
              ? "Loading…"
              : task
                ? `Assigned by: ${formatName(task.creator)}`
                : "—"
          }
        />

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
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
                href="/app/assignments"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                Back to My assignments
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/70">Assignment not found.</p>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Your submission"
          description={
            submissionLoading
              ? "Loading…"
              : submission
                ? "You can update and resubmit anytime."
                : "Submit your work below."
          }
        />

        {submissionError ? (
          <p className="mb-3 text-sm text-red-600">{submissionError}</p>
        ) : null}

        {submissionLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            {submission?.grade !== null && submission?.grade !== undefined ? (
              <div className="text-sm">
                <span className="text-foreground/60">Grade: </span>
                <span className="text-foreground font-medium">
                  {submission.grade}
                </span>
              </div>
            ) : null}

            {submission?.feedback ? (
              <div className="text-sm">
                <div className="text-foreground/60">Teacher feedback</div>
                <div className="mt-1 whitespace-pre-wrap text-foreground">
                  {submission.feedback}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Submission text
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your answer / notes here…"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                File URL (optional)
              </label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Paste a file link (optional)"
              />
              <p className="text-xs text-foreground/60">
                Tip: we can integrate the built-in upload flow next.
              </p>
            </div>

            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" />
                  Submitting…
                </span>
              ) : submission ? (
                "Update submission"
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
