import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Equipe" };

const members = [
  {
    name: "Marina Costa",
    role: "Dona",
    email: "marina@limpezapro.com.br",
    status: "Ativo",
  },
  {
    name: "Pedro Santos",
    role: "Operador",
    email: "pedro@limpezapro.com.br",
    status: "Ativo",
  },
  {
    name: "Julia Rocha",
    role: "Operador",
    email: "julia@limpezapro.com.br",
    status: "Convite",
  },
];

export default function EquipePage() {
  return (
    <PageStack>
      <DashGrid cols={3} equal>
        <StatCard label="Membros" value="3" />
        <StatCard label="Ativos" value="2" />
        <StatCard label="Convites" value="1" />
      </DashGrid>
      <Card padding="none">
        <CardBody>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-[11px] font-semibold tracking-[0.12em] text-[var(--dash-muted)] uppercase">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="py-3 font-semibold">Papel</th>
                <th className="py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.email}
                  className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-hover)]"
                >
                  <td className="px-4 py-3.5 font-medium text-[var(--dash-ink)]">
                    {m.name}
                  </td>
                  <td className="py-3.5 text-[var(--dash-fg)]">{m.role}</td>
                  <td className="py-3.5 text-[var(--dash-muted)]">{m.email}</td>
                  <td className="px-4 py-3.5 text-right text-[12px] text-[var(--dash-muted)]">
                    {m.status}
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
