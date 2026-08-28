import { cn } from "@/lib/cn";

type MetricProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function Metric({ label, value, hint, className }: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
