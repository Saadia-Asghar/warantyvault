import { cn } from "@/lib/utils";

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function SelectField({ label, hint, error, className, id, children, ...props }: SelectFieldProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-field">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn("input-field", error && "border-red-500/60 ring-1 ring-red-500/30", className)}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{hint}</p>
      ) : null}
    </div>
  );
}
