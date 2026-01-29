import { forwardRef, type ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

type TextareaProps = ComponentProps<"textarea">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-10 w-full rounded-md border border-foreground/15 bg-background px-3 text-sm text-foreground placeholder:text-foreground/50 transition-colors hover:border-foreground/25 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`min-h-24 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 transition-colors hover:border-foreground/25 ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
