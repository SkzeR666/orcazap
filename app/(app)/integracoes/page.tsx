import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { MessageCircle, Plug, Webhook } from "lucide-react";

export const metadata = { title: "Integrações" };

const integrations = [
  {
    id: "wa",
    name: "WhatsApp",
    desc: "Abrir conversa com orçamento e link de pagamento.",
    status: "Conectado",
    icon: MessageCircle,
    tone: "ok" as const,
  },
  {
    id: "pix",
    name: "Pix (provedor)",
    desc: "Confirmação automática de pagamento.",
    status: "Pendente",
    icon: Plug,
    tone: "warn" as const,
  },
  {
    id: "hook",
    name: "Webhooks",
    desc: "Eventos de aprovado / pago pro seu sistema.",
    status: "Off",
    icon: Webhook,
    tone: "muted" as const,
  },
];

export default function IntegracoesPage() {
  return (
    <PageStack>
      <DashGrid cols={3}>
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id}>
              <CardBody className="gap-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[3px] bg-[var(--dash-hover)] text-[var(--dash-muted)]">
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={
                      item.tone === "ok"
                        ? "text-[11px] text-[var(--dash-success)]"
                        : item.tone === "warn"
                          ? "text-[11px] text-[#8a5b00]"
                          : "text-[11px] text-[var(--dash-muted)]"
                    }
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--dash-ink)]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--dash-fg)]">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn dash-btn-ghost mt-auto w-full"
                >
                  Configurar
                </button>
              </CardBody>
            </Card>
          );
        })}
      </DashGrid>
    </PageStack>
  );
}
