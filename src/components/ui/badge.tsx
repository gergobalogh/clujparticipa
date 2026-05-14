export type BadgeVariant =
  | "default"
  | "submitted"
  | "under_review"
  | "eligible"
  | "in_voting"
  | "selected"
  | "in_progress"
  | "completed"
  | "rejected";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  submitted: "bg-slate-100 text-slate-700",
  under_review: "bg-yellow-50 text-yellow-800",
  eligible: "bg-indigo-50 text-indigo-700",
  in_voting: "bg-purple-50 text-purple-700",
  selected: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      role="status"
      className={[
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
