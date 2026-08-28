import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Metric } from "@/components/metric";
import { QuoteRow } from "@/components/quote-row";
import { formatBRL, formatPercent } from "@/lib/format";
import { dashboardMetrics, recentQuotes } from "@/lib/mock";

export const metadata = {
  title: "Visão geral",
};

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Visão geral
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            O essencial da operação: receber, acompanhar e converter.
          </p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--forest)] hover:underline"
        >
          Novo orçamento
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <section className="grid gap-8 border-y border-[var(--line)] py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Recebido hoje"
          value={formatBRL(dashboardMetrics.receivedToday)}
        />
        <Metric
          label="Em aberto"
          value={formatBRL(dashboardMetrics.openAmount)}
          hint={`${dashboardMetrics.chargesCount} cobranças`}
        />
        <Metric
          label="Conversão"
          value={formatPercent(dashboardMetrics.conversion)}
          hint="Orçamentos aprovados"
        />
        <Metric
          label="Recebido no mês"
          value={formatBRL(dashboardMetrics.receivedMonth)}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
            Últimos orçamentos
          </h2>
          <Link
            href="/orcamentos"
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Ver todos
          </Link>
        </div>
        <div>
          {recentQuotes.slice(0, 4).map((quote) => (
            <QuoteRow key={quote.id} quote={quote} />
          ))}
        </div>
      </section>
    </div>
  );
}
