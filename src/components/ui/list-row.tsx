type ListRowProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListRow({ children, className = "" }: ListRowProps) {
  return (
    <div
      className={[
        "flex items-start gap-4 border-b border-slate-200 px-4 py-3 sm:px-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

type ListRowTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListRowTitle({ children, className = "" }: ListRowTitleProps) {
  return (
    <span className={["text-sm font-medium text-slate-950", className].join(" ")}>
      {children}
    </span>
  );
}

type ListRowMetaProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListRowMeta({ children, className = "" }: ListRowMetaProps) {
  return (
    <span className={["text-xs text-slate-500", className].join(" ")}>
      {children}
    </span>
  );
}
