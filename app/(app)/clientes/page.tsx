import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";
import { formatBRL } from "@/lib/format";
import { mockClients } from "@/lib/mock";

export const metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <PageStack>
      <DashGrid cols={3}>
        <StatCard label="Clientes" value={String(mockClients.length)} />
        <StatCard label="Ativos no mês" value="4" />
        <StatCard label="Ticket médio" value={formatBRL(412)} />
      </DashGrid>
      <Card padding="none">
        <CardBody>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="py-3 font-semibold">WhatsApp</th>
                <th className="py-3 font-semibold">Orçamentos</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-hover)]"
                >
                  <td className="px-4 py-3.5 font-medium text-[var(--dash-ink)]">
                    {c.name}
                  </td>
                  <td className="py-3.5 text-[var(--dash-muted)]">{c.phone}</td>
                  <td className="py-3.5 tabular-nums text-[var(--dash-fg)]">
                    {c.quotes}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium tabular-nums text-[var(--dash-ink)]">
                    {formatBRL(c.total)}
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
