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
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-50 disabled:pointer-events-none";

  if (variant === "secondary") {
    return `${base} border border-foreground/15 bg-background text-foreground hover:bg-foreground/5`;
  }

  if (variant === "danger") {
    return `${base} bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300/40`;
  }

  return `${base} bg-foreground text-background hover:bg-foreground/90`;
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
