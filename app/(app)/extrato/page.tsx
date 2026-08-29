import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";
import { formatBRL, formatDate } from "@/lib/format";
import { recentQuotes } from "@/lib/mock";

export const metadata = { title: "Extrato" };

export default function ExtratoPage() {
  const entries = recentQuotes
    .filter((q) => q.status === "pago")
    .map((q) => ({
      id: q.id,
      label: q.client,
      detail: q.service,
      amount: q.amount,
      at: q.createdAt,
    }));

  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <PageStack>
      <DashGrid cols={2}>
        <StatCard label="Entradas" value={String(entries.length)} />
        <StatCard
          label="Total recebido"
          value={formatBRL(total)}
          deltaTone="up"
        />
      </DashGrid>
      <Card padding="none">
        <CardBody>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="py-3 font-semibold">Data</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-hover)]"
                >
                  <td className="px-4 py-3.5">
                    <p className="truncate font-medium text-[var(--dash-ink)]">
                      {e.label}
                    </p>
                    <p className="truncate text-[12px] text-[var(--dash-muted)]">
                      {e.detail}
                    </p>
                  </td>
                  <td className="py-3.5 text-[var(--dash-muted)]">
                    {formatDate(e.at)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium tabular-nums text-[var(--dash-success)]">
                    +{formatBRL(e.amount)}
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
