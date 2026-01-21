"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api-client";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SearchKind = "person" | "course" | "assignment";

type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
};

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
};

type ProjectRow = {
  id: string;
  title: string;
  description?: string | null;
  _count?: { tasks: number };
};

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: number;
};

function platformHint(): string {
  if (typeof navigator === "undefined") return "Ctrl K";
  return navigator.platform.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K";
}

function kindLabel(kind: SearchKind): string {
  switch (kind) {
    case "person":
      return "People";
    case "course":
      return "Courses";
    case "assignment":
      return "Assignments";
  }
}

function kindBadge(kind: SearchKind): "neutral" | "success" | "warning" {
  switch (kind) {
    case "person":
      return "neutral";
    case "course":
      return "success";
    case "assignment":
      return "warning";
  }
}

export function CommandPalette(props: {
  token: string | null;
  role?: string | null;
}) {
  const { token, role } = props;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const hint = useMemo(() => platformHint(), []);

  const canIndexUsers = role === "ADMIN";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        setOpen(true);
      }

      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => a + 1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        // handled in effect below when results computed
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!token) return;
    if (items.length > 0) return;

    let mounted = true;

    async function buildIndex() {
      setIndexLoading(true);
      setIndexError(null);

      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        canIndexUsers ? apiFetch<UserRow[]>("/users", { token }) : null,
        apiFetch<ProjectRow[]>("/projects", { token }),
        apiFetch<TaskRow[]>("/tasks", { token }),
      ]);
      if (!mounted) return;

      const next: SearchItem[] = [];

      if (canIndexUsers) {
        if (!usersRes?.success) {
          setIndexError(usersRes?.message || "Failed to index users");
        } else {
          for (const u of usersRes.data || []) {
            const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
            const title = name || u.email;
            next.push({
              id: `user:${u.id}`,
              kind: "person",
              title,
              subtitle: `${u.email} · ${u.role}${u.isActive ? "" : " · Inactive"}`,
              href: `/app/users?q=${encodeURIComponent(title)}`,
            });
          }
        }
      }

      if (!projectsRes?.success) {
        setIndexError(projectsRes?.message || "Failed to index courses");
      } else {
        for (const p of projectsRes.data || []) {
          next.push({
            id: `project:${p.id}`,
            kind: "course",
            title: p.title,
            subtitle:
              typeof p._count?.tasks === "number"
                ? `${p._count.tasks} assignments`
                : undefined,
            href: `/app/projects?q=${encodeURIComponent(p.title)}`,
          });
        }
      }

      if (!tasksRes?.success) {
        setIndexError(tasksRes?.message || "Failed to index assignments");
      } else {
        for (const t of tasksRes.data || []) {
          next.push({
            id: `task:${t.id}`,
            kind: "assignment",
            title: t.title,
            subtitle: `${t.status} · Priority ${t.priority}`,
            href: `/app/tasks?q=${encodeURIComponent(t.title)}`,
          });
        }
      }

      // Prefer stable order: Courses → Assignments → People
      const order: Record<SearchKind, number> = {
        course: 1,
        assignment: 2,
        person: 3,
      };

      next.sort((a, b) => {
        const byKind = order[a.kind] - order[b.kind];
        if (byKind !== 0) return byKind;
        return a.title.localeCompare(b.title);
      });

      setItems(next);
      setIndexLoading(false);
    }

    buildIndex().catch((err) => {
      console.error(err);
      if (!mounted) return;
      setIndexError("Failed to build search index");
      setIndexLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [open, token, items.length, canIndexUsers]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 12);

    const scored = items
      .map((it) => {
        const hay = `${it.title} ${it.subtitle || ""}`.toLowerCase();
        const idx = hay.indexOf(q);
        return { it, idx };
      })
      .filter((x) => x.idx !== -1)
      .sort((a, b) => a.idx - b.idx || a.it.title.localeCompare(b.it.title))
      .map((x) => x.it);

    return scored.slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setActive(0);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    if (results.length === 0) {
      setActive(0);
      return;
    }
    setActive((a) => Math.min(a, results.length - 1));
  }, [open, results.length]);

  useEffect(() => {
    if (!open) return;

    function onEnter(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      if (results.length === 0) return;

      const target = results[Math.min(active, results.length - 1)];
      if (!target) return;

      router.push(target.href);
      setOpen(false);
    }

    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [open, results, active, router]);

  if (!token) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 text-foreground/80 hover:text-foreground md:hidden"
        aria-label="Search"
      >
        🔎
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground/80 hover:text-foreground md:inline-flex"
      >
        Search
        <span className="ml-2 rounded border border-foreground/10 px-1.5 py-0.5 text-xs text-foreground/60">
          {hint}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-1/2 top-20 w-[92vw] max-w-2xl -translate-x-1/2 rounded-xl border border-foreground/10 bg-background shadow-2xl">
            <div className="border-b border-foreground/10 p-3">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, teachers, courses, assignments…"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
                <span>Tip: {hint} to open, Esc to close</span>
                <span>{items.length > 0 ? `${items.length} indexed` : ""}</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-auto p-2">
              {indexLoading ? (
                <div className="p-3 text-sm text-foreground/70">Indexing…</div>
              ) : indexError ? (
                <div className="p-3 text-sm text-red-600">{indexError}</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-sm text-foreground/70">
                  No matches.
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => {
                        router.push(r.href);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                        idx === active
                          ? "bg-foreground/5"
                          : "hover:bg-foreground/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {r.title}
                        </div>
                        {r.subtitle ? (
                          <div className="truncate text-xs text-foreground/60">
                            {r.subtitle}
                          </div>
                        ) : null}
                      </div>

                      <div className="ml-3 flex items-center gap-2">
                        <StatusBadge variant={kindBadge(r.kind)}>
                          {kindLabel(r.kind)}
                        </StatusBadge>
                        <span className="text-xs text-foreground/50">↵</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
