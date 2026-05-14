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
  default: "bg-paper-muted text-ink-muted",
  submitted: "bg-paper-muted text-ink-muted",
  under_review: "bg-civic-orange-light text-civic-orange",
  eligible: "bg-civic-blue-light text-civic-blue",
  in_voting: "bg-purple-50 text-purple-700",
  selected: "bg-civic-teal-light text-civic-teal",
  in_progress: "bg-civic-blue-light text-civic-blue",
  completed: "bg-civic-teal-light text-civic-teal",
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
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
