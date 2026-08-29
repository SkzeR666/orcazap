import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, QrCode } from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatusBadge } from "@/components/ui/status-badge";
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
    quote.status === "recusado"
      ? "enviado"
      : (quote.status as (typeof flow)[number]),
  );

  return (
    <PageStack>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/orcamentos"
            className="text-[12px] text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
          >
            ← Orçamentos
          </Link>
          <p className="mt-1 truncate text-[18px] font-semibold text-[var(--dash-ink)]">
            {quote.client}
          </p>
          <p className="truncate text-[12px] text-[var(--dash-muted)]">
            {quote.service}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/o/${quote.id}`} className="dash-btn dash-btn-ghost">
            Ver página do cliente
          </Link>
          <button type="button" className="dash-btn dash-btn-primary">
            <MessageCircle className="size-3.5" />
            WhatsApp
          </button>
          <button type="button" className="dash-btn dash-btn-ghost">
            <QrCode className="size-3.5" />
            Pix
          </button>
        </div>
      </div>

      <DashGrid cols={3}>
        <Card>
          <CardBody className="justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
              Valor
            </p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-[var(--dash-ink)]">
              {formatBRL(quote.amount)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
              Status
            </p>
            <StatusBadge status={quote.status} />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
              Criado em
            </p>
            <p className="text-[15px] font-medium text-[var(--dash-ink)]">
              {formatDate(quote.createdAt)}
            </p>
          </CardBody>
        </Card>
      </DashGrid>

      <Card>
        <CardBody>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
            Fluxo
          </p>
          <ol className="flex flex-wrap gap-1.5">
            {flow.map((step, index) => {
              const done =
                currentIndex >= index && quote.status !== "recusado";
              return (
                <li
                  key={step}
                  className={`rounded-[var(--radius)] px-2.5 py-1 text-[12px] ${
                    done
                      ? "bg-[color-mix(in_srgb,var(--dash-accent)_18%,transparent)] font-medium text-[var(--dash-accent)]"
                      : "bg-[var(--dash-hover)] text-[var(--dash-muted)]"
                  }`}
                >
                  {statusLabel[step]}
                </li>
              );
            })}
          </ol>
        </CardBody>
        <CardFooter className="flex flex-wrap gap-2">
          <button type="button" className="dash-btn dash-btn-primary">
            <MessageCircle className="size-3.5" />
            Enviar no WhatsApp
          </button>
          <button type="button" className="dash-btn dash-btn-ghost">
            <QrCode className="size-3.5" />
            Gerar cobrança Pix
          </button>
        </CardFooter>
      </Card>
    </PageStack>
  );
}
