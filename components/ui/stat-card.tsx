import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  className?: string;
};

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[108px] flex-col rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] p-4",
        className,
      )}
    >
      <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-[26px] font-semibold leading-none tracking-tight tabular-nums text-[var(--dash-ink)]">
        {value}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-auto pt-3 truncate text-[12px]",
            deltaTone === "up" && "text-[var(--dash-success)]",
            deltaTone === "down" && "text-[var(--dash-danger)]",
            deltaTone === "neutral" && "text-[var(--dash-muted)]",
          )}
        >
          {delta}
        </p>
      ) : (
        <span className="mt-auto" />
      )}
    </div>
  );
}
