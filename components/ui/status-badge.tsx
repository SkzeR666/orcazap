import { cn } from "@/lib/cn";
import { statusLabel, type QuoteStatus } from "@/lib/mock";

const tones: Record<QuoteStatus, string> = {
  rascunho: "bg-[var(--dash-hover)] text-[var(--dash-muted)]",
  enviado: "bg-[color-mix(in_srgb,#38bdf8_16%,transparent)] text-[#7dd3fc]",
  aprovado: "bg-[color-mix(in_srgb,var(--dash-success)_16%,transparent)] text-[var(--dash-success)]",
  cobrado: "bg-[color-mix(in_srgb,#e0c07a_16%,transparent)] text-[#e0c07a]",
  pago: "bg-[color-mix(in_srgb,var(--dash-accent)_16%,transparent)] text-[var(--dash-accent)]",
  recusado: "bg-[color-mix(in_srgb,var(--dash-danger)_16%,transparent)] text-[var(--dash-danger)]",
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-[3px] px-1.5 py-0.5 text-[11px] font-medium",
        tones[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
