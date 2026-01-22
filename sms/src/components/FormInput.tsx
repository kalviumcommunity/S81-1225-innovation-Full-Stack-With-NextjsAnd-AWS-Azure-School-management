import { Input, Textarea } from "@/components/ui/Input";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type FormInputProps<TFieldValues extends FieldValues> = {
  label: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  error?: string;
  type?: React.ComponentProps<"input">["type"];
  placeholder?: string;
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
};

export default function FormInput<TFieldValues extends FieldValues>({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  autoComplete,
  multiline = false,
  rows,
}: FormInputProps<TFieldValues>) {
  const id = String(name);
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      {multiline ? (
        <Textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...register(name)}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...register(name)}
        />
      )}

      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
