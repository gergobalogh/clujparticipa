import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink/90 focus-visible:ring-ink",
  secondary:
    "bg-paper text-ink border border-ink/15 hover:bg-paper-muted focus-visible:ring-ink/40",
  danger:
    "bg-paper text-red-700 border border-red-300 hover:bg-red-50 focus-visible:ring-red-400",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
