import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-field">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${inputId}-hint` : undefined}
        className={cn("input-field", error && "border-red-500/60 ring-1 ring-red-500/30", className)}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-[var(--text-tertiary)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
