import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/format";
import { statusLabel, type Quote } from "@/lib/mock";
import { cn } from "@/lib/cn";

const statusTone: Record<Quote["status"], string> = {
  rascunho: "bg-[var(--mist)] text-[var(--muted)]",
  enviado: "bg-[#e8f0ff] text-[#2a4d8c]",
  aprovado: "bg-[#e8f8ef] text-[#1f6b45]",
  cobrado: "bg-[#fff4d8] text-[#8a5b00]",
  pago: "bg-[color-mix(in_oklab,var(--zap)_45%,white)] text-[var(--ink)]",
  recusado: "bg-[#fde8e8] text-[#8f2f2f]",
};

export function QuoteRow({ quote }: { quote: Quote }) {
  return (
    <Link
      href={`/orcamentos/${quote.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line)] py-4 transition-colors last:border-b-0 hover:bg-[var(--mist)]/60 sm:grid-cols-[1.2fr_1.4fr_auto_auto]"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-[var(--ink)]">{quote.client}</p>
        <p className="text-xs text-[var(--muted)] sm:hidden">
          {formatDate(quote.createdAt)}
        </p>
      </div>
      <p className="hidden truncate text-sm text-[var(--muted)] sm:block">
        {quote.service}
      </p>
      <span
        className={cn(
          "hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex",
          statusTone[quote.status],
        )}
      >
        {statusLabel[quote.status]}
      </span>
      <div className="text-right">
        <p className="font-semibold text-[var(--ink)]">
          {formatBRL(quote.amount)}
        </p>
        <p className="hidden text-xs text-[var(--muted)] sm:block">
          {formatDate(quote.createdAt)}
        </p>
        <span
          className={cn(
            "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium sm:hidden",
            statusTone[quote.status],
          )}
        >
          {statusLabel[quote.status]}
        </span>
      </div>
    </Link>
  );
}
