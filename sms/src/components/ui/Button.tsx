import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

function classes(variant: ButtonVariant): string {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

  if (variant === "secondary") {
    return `${base} border border-foreground/15 bg-background text-foreground hover:bg-foreground/5`;
  }

  if (variant === "danger") {
    return `${base} bg-red-600 text-white hover:bg-red-700`;
  }

  return `${base} bg-brand text-white shadow-sm shadow-black/5 hover:bg-brand/90 dark:shadow-black/20`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={`${classes(variant)} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: LinkButtonProps) {
  return <Link className={`${classes(variant)} ${className}`} {...props} />;
}
