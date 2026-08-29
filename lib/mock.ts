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
  quotesMonth: 47,
  avgTicket: 412,
};

export const revenueSeries = [
  { day: "01", recebido: 220, aberto: 180 },
  { day: "04", recebido: 340, aberto: 210 },
  { day: "07", recebido: 180, aberto: 260 },
  { day: "10", recebido: 520, aberto: 190 },
  { day: "13", recebido: 410, aberto: 320 },
  { day: "16", recebido: 290, aberto: 240 },
  { day: "19", recebido: 610, aberto: 280 },
  { day: "22", recebido: 480, aberto: 350 },
  { day: "25", recebido: 730, aberto: 210 },
  { day: "28", recebido: 650, aberto: 180 },
];

export const funnelSeries = [
  { stage: "Criados", value: 47 },
  { stage: "Enviados", value: 41 },
  { stage: "Aprovados", value: 32 },
  { stage: "Cobrados", value: 28 },
  { stage: "Pagos", value: 22 },
];

export const statusBreakdown = [
  { name: "Pago", value: 22, color: "#c8f542" },
  { name: "Cobrado", value: 6, color: "#e0c07a" },
  { name: "Aprovado", value: 4, color: "#5ecf8a" },
  { name: "Enviado", value: 9, color: "#6b7280" },
  { name: "Recusado", value: 6, color: "#e07a7a" },
];

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
  {
    id: "orc-1037",
    client: "Ricardo Mendes",
    service: "Limpeza residencial semanal",
    amount: 220,
    status: "pago",
    createdAt: "2026-08-26T09:00:00",
    channel: "whatsapp",
  },
  {
    id: "orc-1036",
    client: "Fernanda Lima",
    service: "Instalação de ventilador",
    amount: 180,
    status: "cobrado",
    createdAt: "2026-08-25T16:45:00",
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

export const mockClients = [
  { id: "cli-1", name: "Marina Costa", phone: "(11) 98888-1200", quotes: 8, total: 4120 },
  { id: "cli-2", name: "João Ferreira", phone: "(11) 97777-3344", quotes: 3, total: 1350 },
  { id: "cli-3", name: "Ana Beatriz", phone: "(21) 96666-5511", quotes: 5, total: 2180 },
  { id: "cli-4", name: "Carlos Eduardo", phone: "(11) 95555-0099", quotes: 2, total: 2400 },
  { id: "cli-5", name: "Patrícia Alves", phone: "(31) 94444-7788", quotes: 4, total: 980 },
];

export const statusLabel: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  cobrado: "Cobrado",
  pago: "Pago",
  recusado: "Recusado",
};

export type PublicQuote = {
  id: string;
  client: string;
  service: string;
  amount: number;
  status: QuoteStatus;
  notes?: string;
  validDays: number;
  live: boolean;
  liveStep: number;
  business: {
    name: string;
    initials: string;
    city: string;
    whatsapp: string;
  };
  pixKey: string;
  createdAt: string;
};

export const LIVE_STEPS = [
  "Diagnóstico iniciado",
  "Peça confirmada",
  "Em execução",
  "Testes finais",
  "Concluído",
] as const;

export const publicQuotes: PublicQuote[] = [
  {
    id: "preview",
    client: "Cliente",
    service: "Limpeza residencial",
    amount: 220,
    status: "enviado",
    notes: "Inclui produtos · 3h estimadas",
    validDays: 7,
    live: true,
    liveStep: 0,
    business: {
      name: "Estúdio Limpeza Pro",
      initials: "EL",
      city: "São Paulo, SP",
      whatsapp: "(11) 90000-0000",
    },
    pixKey: "estudio@limpezapro.com.br",
    createdAt: "2026-08-28T12:00:00",
  },
  {
    id: "orc-1042",
    client: "Marina Costa",
    service: "Limpeza pós-obra (apto 2 quartos)",
    amount: 680,
    status: "pago",
    notes: "Acesso pela portaria · deixar chave com o síndico",
    validDays: 7,
    live: false,
    liveStep: 4,
    business: {
      name: "Estúdio Limpeza Pro",
      initials: "EL",
      city: "São Paulo, SP",
      whatsapp: "(11) 90000-0000",
    },
    pixKey: "estudio@limpezapro.com.br",
    createdAt: "2026-08-28T10:20:00",
  },
  {
    id: "orc-1041",
    client: "João Ferreira",
    service: "Instalação de ar-condicionado",
    amount: 450,
    status: "cobrado",
    notes: "Unidade split 12k BTUs · sala",
    validDays: 7,
    live: true,
    liveStep: 2,
    business: {
      name: "Estúdio Limpeza Pro",
      initials: "EL",
      city: "São Paulo, SP",
      whatsapp: "(11) 90000-0000",
    },
    pixKey: "estudio@limpezapro.com.br",
    createdAt: "2026-08-28T09:05:00",
  },
];

export function getPublicQuote(id: string) {
  return publicQuotes.find((q) => q.id === id);
}
