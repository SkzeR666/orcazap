import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBRL, formatDate } from "@/lib/format";
import { recentQuotes } from "@/lib/mock";

export const metadata = {
  title: "Cobranças",
};

export default function ChargesPage() {
  const charges = recentQuotes.filter((quote) =>
    ["cobrado", "pago", "aprovado"].includes(quote.status),
  );
  const open = charges
    .filter((c) => c.status !== "pago")
    .reduce((s, c) => s + c.amount, 0);
  const paid = charges
    .filter((c) => c.status === "pago")
    .reduce((s, c) => s + c.amount, 0);

  return (
    <PageStack>
      <DashGrid cols={3}>
        <StatCard label="Em aberto" value={formatBRL(open)} />
        <StatCard label="Recebido" value={formatBRL(paid)} deltaTone="up" />
        <StatCard label="Cobranças" value={String(charges.length)} />
      </DashGrid>

      <Card padding="none">
        <CardBody>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="py-3 font-semibold">Serviço</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Data</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr
                  key={charge.id}
                  className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-hover)]"
                >
                  <td className="px-4 py-3.5 font-medium text-[var(--dash-ink)]">
                    {charge.client}
                  </td>
                  <td className="max-w-[220px] truncate py-3.5 text-[var(--dash-fg)]">
                    {charge.service}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={charge.status} />
                  </td>
                  <td className="py-3.5 text-[var(--dash-muted)]">
                    {formatDate(charge.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium tabular-nums text-[var(--dash-ink)]">
                    {formatBRL(charge.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </PageStack>
  );
}
