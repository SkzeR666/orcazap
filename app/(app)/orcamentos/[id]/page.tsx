import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, QrCode } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import { recentQuotes, statusLabel } from "@/lib/mock";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const quote = recentQuotes.find((item) => item.id === id);
  return {
    title: quote ? `Orçamento ${quote.client}` : "Orçamento",
  };
}

const flow = ["rascunho", "enviado", "aprovado", "cobrado", "pago"] as const;

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;
  const quote = recentQuotes.find((item) => item.id === id);
  if (!quote) notFound();

  const currentIndex = flow.indexOf(
    quote.status === "recusado" ? "enviado" : (quote.status as (typeof flow)[number]),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <Link
          href="/orcamentos"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Orçamentos
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          {quote.client}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{quote.service}</p>
      </div>

      <section className="grid gap-6 border-y border-[var(--line)] py-8 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Valor</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--ink)]">
            {formatBRL(quote.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">Status</p>
          <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
            {statusLabel[quote.status]}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">Criado em</p>
          <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
            {formatDate(quote.createdAt)}
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
          Fluxo
        </h2>
        <ol className="mt-4 flex flex-wrap gap-2">
          {flow.map((step, index) => {
            const done = currentIndex >= index && quote.status !== "recusado";
            return (
              <li
                key={step}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  done
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "bg-[var(--mist)] text-[var(--muted)]"
                }`}
              >
                {statusLabel[step]}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--zap)] px-5 py-3 text-sm font-semibold text-[var(--ink)]"
        >
          <MessageCircle className="size-4" />
          Enviar no WhatsApp
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--ink)]"
        >
          <QrCode className="size-4" />
          Gerar cobrança Pix
        </button>
      </section>
    </div>
  );
}
