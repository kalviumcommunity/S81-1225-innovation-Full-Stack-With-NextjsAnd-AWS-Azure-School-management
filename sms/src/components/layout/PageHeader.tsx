import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-1 text-xs text-foreground/60"
          >
            <ol className="flex flex-wrap items-center gap-1">
              {breadcrumbs.map((c, idx) => (
                <li
                  key={`${c.label}-${idx}`}
                  className="flex items-center gap-1"
                >
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="text-foreground/60 hover:text-foreground hover:underline"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/70">{c.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 ? (
                    <span aria-hidden="true">/</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}
