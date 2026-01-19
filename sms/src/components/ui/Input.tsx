import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

type TextareaProps = ComponentProps<"textarea">;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${className}`}
      {...props}
    />
  );
}
