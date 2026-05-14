import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || (label ? `input-${autoId}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
          {props.required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          "block w-full rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-paper-muted disabled:text-ink-muted",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
