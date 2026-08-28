import { formatBRL, formatDate } from "@/lib/format";
import { recentQuotes, statusLabel } from "@/lib/mock";

export const metadata = {
  title: "Cobranças",
};

export default function ChargesPage() {
  const charges = recentQuotes.filter((quote) =>
    ["cobrado", "pago", "aprovado"].includes(quote.status),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          Cobranças
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Acompanhe o que está em aberto e o que já caiu.
        </p>
      </div>

      <div>
        {charges.map((charge) => (
          <div
            key={charge.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line)] py-4 last:border-b-0 sm:grid-cols-[1.2fr_1fr_auto_auto]"
          >
            <div>
              <p className="font-medium text-[var(--ink)]">{charge.client}</p>
              <p className="text-xs text-[var(--muted)] sm:hidden">
                {statusLabel[charge.status]}
              </p>
            </div>
            <p className="hidden truncate text-sm text-[var(--muted)] sm:block">
              {charge.service}
            </p>
            <p className="hidden text-sm text-[var(--muted)] sm:block">
              {statusLabel[charge.status]} · {formatDate(charge.createdAt)}
            </p>
            <p className="text-right font-semibold text-[var(--ink)]">
              {formatBRL(charge.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
