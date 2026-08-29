import { QuotesTable } from "@/components/quotes-table";
import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";
import { formatBRL } from "@/lib/format";
import { recentQuotes } from "@/lib/mock";

export const metadata = {
  title: "Orçamentos",
};

export default function QuotesPage() {
  const total = recentQuotes.reduce((sum, q) => sum + q.amount, 0);
  const open = recentQuotes.filter((q) =>
    ["enviado", "aprovado", "cobrado"].includes(q.status),
  ).length;
  const paid = recentQuotes.filter((q) => q.status === "pago").length;

  return (
    <PageStack>
      <DashGrid cols={3}>
        <StatCard label="Total listado" value={formatBRL(total)} />
        <StatCard label="Em andamento" value={String(open)} />
        <StatCard label="Pagos" value={String(paid)} />
      </DashGrid>

      <Card padding="none">
        <CardBody>
          <QuotesTable quotes={recentQuotes} />
        </CardBody>
      </Card>
    </PageStack>
  );
}
