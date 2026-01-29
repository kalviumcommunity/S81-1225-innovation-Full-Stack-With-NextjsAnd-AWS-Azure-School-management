import type { ComponentProps } from "react";

type SpinnerProps = ComponentProps<"span"> & {
  size?: "sm" | "md";
};

function sizeClasses(size: SpinnerProps["size"]): string {
  if (size === "sm") return "h-4 w-4";
  return "h-5 w-5";
}

export function Spinner({
  size = "md",
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-brand/25 border-t-brand ${sizeClasses(
        size
      )} ${className}`}
      {...props}
    />
  );
}
