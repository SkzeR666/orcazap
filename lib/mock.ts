export type QuoteStatus =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "cobrado"
  | "pago"
  | "recusado";

export type Quote = {
  id: string;
  client: string;
  service: string;
  amount: number;
  status: QuoteStatus;
  createdAt: string;
  channel: "whatsapp";
};

export const dashboardMetrics = {
  receivedToday: 1430,
  openAmount: 2180,
  conversion: 0.68,
  receivedMonth: 7840,
  chargesCount: 12,
};

export const recentQuotes: Quote[] = [
  {
    id: "orc-1042",
    client: "Marina Costa",
    service: "Limpeza pós-obra (apto 2 quartos)",
    amount: 680,
    status: "pago",
    createdAt: "2026-08-28T10:20:00",
    channel: "whatsapp",
  },
  {
    id: "orc-1041",
    client: "João Ferreira",
    service: "Instalação de ar-condicionado",
    amount: 450,
    status: "cobrado",
    createdAt: "2026-08-28T09:05:00",
    channel: "whatsapp",
  },
  {
    id: "orc-1040",
    client: "Ana Beatriz",
    service: "Manutenção elétrica residencial",
    amount: 320,
    status: "aprovado",
    createdAt: "2026-08-27T18:40:00",
    channel: "whatsapp",
  },
  {
    id: "orc-1039",
    client: "Carlos Eduardo",
    service: "Pintura de sala + corredor",
    amount: 1200,
    status: "enviado",
    createdAt: "2026-08-27T15:10:00",
    channel: "whatsapp",
  },
  {
    id: "orc-1038",
    client: "Patrícia Alves",
    service: "Reparo hidráulico",
    amount: 280,
    status: "recusado",
    createdAt: "2026-08-26T11:30:00",
    channel: "whatsapp",
  },
];

export const catalogServices = [
  { id: "svc-1", name: "Limpeza residencial", price: 220 },
  { id: "svc-2", name: "Limpeza pós-obra", price: 680 },
  { id: "svc-3", name: "Instalação de ar-condicionado", price: 450 },
  { id: "svc-4", name: "Manutenção elétrica", price: 320 },
  { id: "svc-5", name: "Pintura (por cômodo)", price: 400 },
];

export const statusLabel: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  cobrado: "Cobrado",
  pago: "Pago",
  recusado: "Recusado",
};
