import type { PropsWithChildren } from "react";

export function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-xl border border-foreground/10 bg-background p-5 shadow-sm shadow-black/5 dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-foreground/70">{description}</p>
      ) : null}
    </div>
  );
}
