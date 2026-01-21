type Variant = "neutral" | "success" | "warning" | "danger";

const styles: Record<Variant, string> = {
  neutral: "bg-foreground/5 text-foreground border-foreground/10",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  danger: "bg-red-500/10 text-red-700 border-red-500/20",
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
