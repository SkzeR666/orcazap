import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";
import { FunnelChart, RevenueChart, StatusPieChart } from "@/components/charts";
import { QuotesTable } from "@/components/quotes-table";
import { formatBRL, formatPercent } from "@/lib/format";
import { dashboardMetrics, recentQuotes, statusBreakdown } from "@/lib/mock";

export const metadata = {
  title: "Visão geral",
};

export default function DashboardPage() {
  return (
    <PageStack>
      <DashGrid cols={4} equal>
        <StatCard
          label="Recebido hoje"
          value={formatBRL(dashboardMetrics.receivedToday)}
          delta="+12% vs ontem"
          deltaTone="up"
        />
        <StatCard
          label="Em aberto"
          value={formatBRL(dashboardMetrics.openAmount)}
          delta={`${dashboardMetrics.chargesCount} cobranças`}
        />
        <StatCard
          label="Conversão"
          value={formatPercent(dashboardMetrics.conversion)}
          delta="Orçamentos → pagos"
          deltaTone="up"
        />
        <StatCard
          label="Recebido no mês"
          value={formatBRL(dashboardMetrics.receivedMonth)}
          delta={`Ticket médio ${formatBRL(dashboardMetrics.avgTicket)}`}
        />
      </DashGrid>

      <DashGrid cols={2} equal>
        <Card>
          <CardHeader title="Recebido × em aberto" />
          <CardBody>
            <RevenueChart />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Funil do mês" />
          <CardBody>
            <FunnelChart />
          </CardBody>
        </Card>
      </DashGrid>

      <DashGrid cols={2} equal>
        <Card>
          <CardHeader title="Status" />
          <CardBody className="gap-3">
            <StatusPieChart />
            <ul className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[var(--dash-border)] pt-3">
              {statusBreakdown.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-2 text-[12px]"
                >
                  <span className="flex min-w-0 items-center gap-1.5 truncate text-[var(--dash-fg)]">
                    <span
                      className="size-1.5 shrink-0 rounded-[1px]"
                      style={{ background: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--dash-muted)]">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Últimos orçamentos"
            action={
              <Link
                href="/orcamentos"
                className="text-[12px] text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
              >
                Ver todos
              </Link>
            }
          />
          <CardBody>
            <QuotesTable quotes={recentQuotes.slice(0, 5)} dense />
          </CardBody>
        </Card>
      </DashGrid>
    </PageStack>
  );
}
