type Variant = "neutral" | "success" | "warning" | "danger";

const styles: Record<Variant, string> = {
  neutral:
    "bg-foreground/5 text-foreground border-foreground/10 dark:bg-white/10 dark:text-slate-50 dark:border-white/15",
  success:
    "bg-emerald-500/12 text-emerald-800 border-emerald-500/25 dark:bg-emerald-400/15 dark:text-emerald-100 dark:border-emerald-300/25",
  warning:
    "bg-amber-500/12 text-amber-900 border-amber-500/25 dark:bg-amber-400/15 dark:text-amber-100 dark:border-amber-300/25",
  danger:
    "bg-rose-500/12 text-rose-800 border-rose-500/25 dark:bg-rose-400/15 dark:text-rose-100 dark:border-rose-300/25",
};

export function StatusBadge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
