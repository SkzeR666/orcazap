import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/format";
import type { Quote } from "@/lib/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";

export function QuotesTable({
  quotes,
  dense = false,
}: {
  quotes: Quote[];
  dense?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--dash-border)] text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
            <th className="px-4 py-3 font-semibold">Cliente</th>
            <th className="py-3 pr-3 font-semibold">Serviço</th>
            <th className="py-3 pr-3 font-semibold">Status</th>
            <th className="py-3 pr-3 font-semibold">Data</th>
            <th className="px-4 py-3 text-right font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr
              key={quote.id}
              className="border-b border-[var(--dash-border)] last:border-b-0 transition-colors hover:bg-[var(--dash-hover)]"
            >
              <td className={cn("px-4", dense ? "py-2.5" : "py-3.5")}>
                <Link
                  href={`/orcamentos/${quote.id}`}
                  className="font-medium text-[var(--dash-ink)] hover:underline"
                >
                  {quote.client}
                </Link>
                <p className="text-[11px] text-[var(--dash-muted)]">{quote.id}</p>
              </td>
              <td className={cn("max-w-[220px] truncate pr-3 text-[var(--dash-fg)]", dense ? "py-2.5" : "py-3.5")}>
                {quote.service}
              </td>
              <td className={cn("pr-3", dense ? "py-2.5" : "py-3.5")}>
                <StatusBadge status={quote.status} />
              </td>
              <td className={cn("pr-3 text-[var(--dash-muted)]", dense ? "py-2.5" : "py-3.5")}>
                {formatDate(quote.createdAt)}
              </td>
              <td
                className={cn(
                  "px-4 text-right font-medium tabular-nums text-[var(--dash-ink)]",
                  dense ? "py-2.5" : "py-3.5",
                )}
              >
                {formatBRL(quote.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
