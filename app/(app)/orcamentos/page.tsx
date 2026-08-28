import Link from "next/link";
import { Plus } from "lucide-react";
import { QuoteRow } from "@/components/quote-row";
import { recentQuotes } from "@/lib/mock";

export const metadata = {
  title: "Orçamentos",
};

export default function QuotesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Orçamentos
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Do rascunho ao pagamento — um fluxo só.
          </p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)]"
        >
          <Plus className="size-4" />
          Novo
        </Link>
      </div>

      <div>
        {recentQuotes.map((quote) => (
          <QuoteRow key={quote.id} quote={quote} />
        ))}
      </div>
    </div>
  );
}
