import { cn } from "@/lib/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "none";
};

const paddingMap = {
  none: "",
  sm: "p-[var(--space)]",
  md: "p-[var(--space-lg)]",
};

/** Always fill grid cell + column flex so footers/bodies align. */
export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] transition-colors duration-150",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  /** @deprecated microtext removido */
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-[var(--space)] flex h-6 shrink-0 items-center justify-between gap-[var(--space)]">
      <h2 className="truncate text-[11px] font-semibold tracking-[0.14em] text-[var(--dash-muted)] uppercase">
        {title}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto shrink-0 border-t border-[var(--dash-border)] pt-[var(--space)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
