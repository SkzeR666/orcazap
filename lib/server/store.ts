import { getDb } from "./db";
import { errors } from "./http";
import {
  daysAgoIso,
  fromCents,
  newId,
  newPublicId,
  nowIso,
  toCents,
} from "./util";
import type { OrgRow, RequestContext } from "./auth";
import { buildBrCode, makeTxid } from "./pix";

// ---- status model -----------------------------------------------------------

export const QUOTE_STATUSES = [
  "rascunho",
  "enviado",
  "aprovado",
  "cobrado",
  "pago",
  "recusado",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

const STATUS_LABELS: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  cobrado: "Cobrado",
  pago: "Pago",
  recusado: "Recusado",
};

export function statusLabelOf(status: string): string {
  return STATUS_LABELS[status as QuoteStatus] ?? status;
}

export function isQuoteStatus(v: unknown): v is QuoteStatus {
  return typeof v === "string" && (QUOTE_STATUSES as readonly string[]).includes(v);
}

/** Allowed forward transitions (recusado reachable from any open state). */
const TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  rascunho: ["enviado", "recusado"],
  enviado: ["aprovado", "recusado", "cobrado"],
  aprovado: ["cobrado", "pago", "recusado"],
  cobrado: ["pago", "recusado"],
  pago: [],
  recusado: ["enviado"],
};

// ---- row types --------------------------------------------------------------

export type ClientRow = {
  id: string;
  org_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  org_id: string;
  name: string;
  price: number;
  unit: string | null;
  created_at: string;
};

export type QuoteRow = {
  id: string;
  org_id: string;
  public_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  service_name: string;
  amount: number;
  status: string;
  notes: string | null;
  valid_days: number;
  live: number;
  live_step: number;
  created_at: string;
  updated_at: string;
};

export type ChargeRow = {
  id: string;
  org_id: string;
  quote_id: string | null;
  method: string;
  amount: number;
  status: string;
  brcode: string | null;
  txid: string | null;
  pix_key: string | null;
  created_at: string;
  paid_at: string | null;
};

export type TemplateRow = {
  id: string;
  org_id: string;
  name: string;
  body: string;
  created_at: string;
};

// ---- serializers (cents -> reais, snake -> camel) ---------------------------

export function serializeClient(r: ClientRow) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

export function serializeService(r: ServiceRow) {
  return {
    id: r.id,
    name: r.name,
    price: fromCents(r.price),
    priceCents: r.price,
    unit: r.unit,
    createdAt: r.created_at,
  };
}

export function serializeQuote(r: QuoteRow) {
  return {
    id: r.id,
    publicId: r.public_id,
    clientId: r.client_id,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    serviceName: r.service_name,
    amount: fromCents(r.amount),
    amountCents: r.amount,
    status: r.status,
    statusLabel: statusLabelOf(r.status),
    notes: r.notes,
    validDays: r.valid_days,
    live: Boolean(r.live),
    liveStep: r.live_step,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function serializeCharge(r: ChargeRow) {
  return {
    id: r.id,
    quoteId: r.quote_id,
    method: r.method,
    amount: fromCents(r.amount),
    amountCents: r.amount,
    status: r.status,
    brcode: r.brcode,
    txid: r.txid,
    pixKey: r.pix_key,
    createdAt: r.created_at,
    paidAt: r.paid_at,
  };
}

// ---- amount coercion --------------------------------------------------------

/** Reads `amountCents` (int) or `amount` (reais) from a body into cents. */
export function readAmountCents(
  body: Record<string, unknown>,
  { required = true }: { required?: boolean } = {},
): number {
  if (typeof body.amountCents === "number") return Math.round(body.amountCents);
  if (typeof body.amount === "number") return toCents(body.amount);
  if (typeof body.amount === "string" && body.amount.trim())
    return toCents(body.amount);
  if (required) throw errors.badRequest('Campo "amount" é obrigatório.');
  return 0;
}

// ---- history retention ------------------------------------------------------

/** Free plan only sees the last N days; paid plans see everything. */
function historyFloor(ctx: RequestContext): string | null {
  const days = ctx.plan.limits.historyDays;
  return days == null ? null : daysAgoIso(days);
}

// ---- limit counters ---------------------------------------------------------

function monthStartIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export function counts(orgId: string) {
  const db = getDb();
  const one = (sql: string, ...args: unknown[]) =>
    (db.prepare(sql).get(...(args as never[])) as { c: number }).c;
  return {
    clients: one("SELECT COUNT(*) c FROM clients WHERE org_id = ?", orgId),
    services: one("SELECT COUNT(*) c FROM services WHERE org_id = ?", orgId),
    users: one(
      "SELECT COUNT(*) c FROM memberships WHERE org_id = ? AND status = 'active'",
      orgId,
    ),
    quotesThisMonth: one(
      "SELECT COUNT(*) c FROM quotes WHERE org_id = ? AND created_at >= ?",
      orgId,
      monthStartIso(),
    ),
    quotesTotal: one("SELECT COUNT(*) c FROM quotes WHERE org_id = ?", orgId),
  };
}

function assertUnderLimit(
  used: number,
  limit: number | null,
  resource: string,
) {
  if (limit != null && used >= limit) {
    throw errors.planLimit(
      `Limite do plano atingido: ${resource} (${limit}). Faça upgrade para continuar.`,
      { resource, limit, used },
    );
  }
}

// ---- clients ----------------------------------------------------------------

export function listClients(ctx: RequestContext): ClientRow[] {
  return getDb()
    .prepare("SELECT * FROM clients WHERE org_id = ? ORDER BY name ASC")
    .all(ctx.org.id) as ClientRow[];
}

export function getClient(ctx: RequestContext, id: string): ClientRow {
  const row = getDb()
    .prepare("SELECT * FROM clients WHERE org_id = ? AND id = ?")
    .get(ctx.org.id, id) as ClientRow | undefined;
  if (!row) throw errors.notFound("Cliente não encontrado.");
  return row;
}

export function createClient(
  ctx: RequestContext,
  data: { name: string; phone?: string; email?: string; notes?: string },
): ClientRow {
  assertUnderLimit(counts(ctx.org.id).clients, ctx.plan.limits.clients, "clientes");
  const id = newId("cli");
  getDb()
    .prepare(
      "INSERT INTO clients (id, org_id, name, phone, email, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(id, ctx.org.id, data.name, data.phone ?? null, data.email ?? null, data.notes ?? null, nowIso());
  return getClient(ctx, id);
}

export function updateClient(
  ctx: RequestContext,
  id: string,
  data: Partial<{ name: string; phone: string; email: string; notes: string }>,
): ClientRow {
  const cur = getClient(ctx, id);
  getDb()
    .prepare("UPDATE clients SET name=?, phone=?, email=?, notes=? WHERE id=?")
    .run(
      data.name ?? cur.name,
      data.phone ?? cur.phone,
      data.email ?? cur.email,
      data.notes ?? cur.notes,
      id,
    );
  return getClient(ctx, id);
}

export function deleteClient(ctx: RequestContext, id: string): void {
  getClient(ctx, id);
  getDb().prepare("DELETE FROM clients WHERE id = ?").run(id);
}

// ---- services ---------------------------------------------------------------

export function listServices(ctx: RequestContext): ServiceRow[] {
  return getDb()
    .prepare("SELECT * FROM services WHERE org_id = ? ORDER BY name ASC")
    .all(ctx.org.id) as ServiceRow[];
}

export function getService(ctx: RequestContext, id: string): ServiceRow {
  const row = getDb()
    .prepare("SELECT * FROM services WHERE org_id = ? AND id = ?")
    .get(ctx.org.id, id) as ServiceRow | undefined;
  if (!row) throw errors.notFound("Serviço não encontrado.");
  return row;
}

export function createService(
  ctx: RequestContext,
  data: { name: string; priceCents: number; unit?: string },
): ServiceRow {
  assertUnderLimit(counts(ctx.org.id).services, ctx.plan.limits.services, "serviços");
  const id = newId("svc");
  getDb()
    .prepare(
      "INSERT INTO services (id, org_id, name, price, unit, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(id, ctx.org.id, data.name, data.priceCents, data.unit ?? null, nowIso());
  return getService(ctx, id);
}

export function updateService(
  ctx: RequestContext,
  id: string,
  data: Partial<{ name: string; priceCents: number; unit: string }>,
): ServiceRow {
  const cur = getService(ctx, id);
  getDb()
    .prepare("UPDATE services SET name=?, price=?, unit=? WHERE id=?")
    .run(
      data.name ?? cur.name,
      data.priceCents ?? cur.price,
      data.unit ?? cur.unit,
      id,
    );
  return getService(ctx, id);
}

export function deleteService(ctx: RequestContext, id: string): void {
  getService(ctx, id);
  getDb().prepare("DELETE FROM services WHERE id = ?").run(id);
}

// ---- quotes -----------------------------------------------------------------

export function listQuotes(
  ctx: RequestContext,
  filter?: { status?: string },
): QuoteRow[] {
  const db = getDb();
  const floor = historyFloor(ctx);
  const clauses = ["org_id = ?"];
  const args: unknown[] = [ctx.org.id];
  if (floor) {
    clauses.push("created_at >= ?");
    args.push(floor);
  }
  if (filter?.status) {
    clauses.push("status = ?");
    args.push(filter.status);
  }
  return db
    .prepare(
      `SELECT * FROM quotes WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
    )
    .all(...(args as never[])) as QuoteRow[];
}

export function getQuote(ctx: RequestContext, id: string): QuoteRow {
  const row = getDb()
    .prepare("SELECT * FROM quotes WHERE org_id = ? AND (id = ? OR public_id = ?)")
    .get(ctx.org.id, id, id) as QuoteRow | undefined;
  if (!row) throw errors.notFound("Orçamento não encontrado.");
  return row;
}

function logEvent(
  quoteId: string,
  orgId: string,
  type: string,
  fromStatus: string | null,
  toStatus: string | null,
  note?: string,
) {
  getDb()
    .prepare(
      "INSERT INTO quote_events (id, quote_id, org_id, type, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(newId("evt"), quoteId, orgId, type, fromStatus, toStatus, note ?? null, nowIso());
}

export function listQuoteEvents(ctx: RequestContext, quoteId: string) {
  const q = getQuote(ctx, quoteId);
  return getDb()
    .prepare("SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at ASC")
    .all(q.id) as {
    id: string;
    type: string;
    from_status: string | null;
    to_status: string | null;
    note: string | null;
    created_at: string;
  }[];
}

export function createQuote(
  ctx: RequestContext,
  data: {
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    serviceName: string;
    amountCents: number;
    notes?: string;
    validDays?: number;
    live?: boolean;
    status?: QuoteStatus;
  },
): QuoteRow {
  const c = counts(ctx.org.id);
  assertUnderLimit(c.quotesThisMonth, ctx.plan.limits.quotesPerMonth, "orçamentos/mês");

  if (data.live && !ctx.plan.features.liveStatus) {
    throw errors.planLimit(
      "Acompanhamento ao vivo é um recurso dos planos Pro e Negócio.",
      { feature: "liveStatus" },
    );
  }

  // Resolve client
  let clientId: string | null = null;
  let clientName = data.clientName?.trim() ?? "";
  let clientPhone = data.clientPhone?.trim() ?? "";
  if (data.clientId) {
    const client = getClient(ctx, data.clientId);
    clientId = client.id;
    clientName = clientName || client.name;
    clientPhone = clientPhone || client.phone || "";
  }
  if (!clientName) clientName = "Cliente";

  const id = newId("orc");
  const publicId = newPublicId();
  const status = data.status ?? "rascunho";
  const now = nowIso();
  getDb()
    .prepare(
      `INSERT INTO quotes
        (id, org_id, public_id, client_id, client_name, client_phone, service_name, amount, status, notes, valid_days, live, live_step, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .run(
      id,
      ctx.org.id,
      publicId,
      clientId,
      clientName,
      clientPhone || null,
      data.serviceName,
      data.amountCents,
      status,
      data.notes ?? null,
      data.validDays ?? ctx.org.quote_valid_days ?? 7,
      data.live ? 1 : 0,
      now,
      now,
    );
  logEvent(id, ctx.org.id, "created", null, status);
  return getQuote(ctx, id);
}

export function updateQuote(
  ctx: RequestContext,
  id: string,
  data: Partial<{
    serviceName: string;
    amountCents: number;
    notes: string;
    validDays: number;
    clientName: string;
    clientPhone: string;
    live: boolean;
  }>,
): QuoteRow {
  const cur = getQuote(ctx, id);
  if (data.live && !ctx.plan.features.liveStatus) {
    throw errors.planLimit(
      "Acompanhamento ao vivo é um recurso dos planos Pro e Negócio.",
      { feature: "liveStatus" },
    );
  }
  getDb()
    .prepare(
      "UPDATE quotes SET service_name=?, amount=?, notes=?, valid_days=?, client_name=?, client_phone=?, live=?, updated_at=? WHERE id=?",
    )
    .run(
      data.serviceName ?? cur.service_name,
      data.amountCents ?? cur.amount,
      data.notes ?? cur.notes,
      data.validDays ?? cur.valid_days,
      data.clientName ?? cur.client_name,
      data.clientPhone ?? cur.client_phone,
      data.live == null ? cur.live : data.live ? 1 : 0,
      nowIso(),
      cur.id,
    );
  return getQuote(ctx, cur.id);
}

export function setQuoteStatus(
  ctx: RequestContext,
  id: string,
  target: QuoteStatus,
  opts: { note?: string; force?: boolean } = {},
): QuoteRow {
  const cur = getQuote(ctx, id);
  const from = cur.status as QuoteStatus;
  if (from === target) return cur;
  const allowed = TRANSITIONS[from] ?? [];
  if (!opts.force && !allowed.includes(target)) {
    throw errors.badRequest(
      `Transição inválida: ${statusLabelOf(from)} → ${statusLabelOf(target)}.`,
      { from, target, allowed },
    );
  }
  getDb()
    .prepare("UPDATE quotes SET status=?, updated_at=? WHERE id=?")
    .run(target, nowIso(), cur.id);
  logEvent(cur.id, ctx.org.id, "status", from, target, opts.note);
  return getQuote(ctx, cur.id);
}

export function advanceLive(ctx: RequestContext, id: string, step: number): QuoteRow {
  const cur = getQuote(ctx, id);
  if (!ctx.plan.features.liveStatus) {
    throw errors.planLimit("Acompanhamento ao vivo indisponível no plano atual.");
  }
  getDb()
    .prepare("UPDATE quotes SET live=1, live_step=?, updated_at=? WHERE id=?")
    .run(Math.max(0, step), nowIso(), cur.id);
  return getQuote(ctx, cur.id);
}

export function deleteQuote(ctx: RequestContext, id: string): void {
  const cur = getQuote(ctx, id);
  getDb().prepare("DELETE FROM quotes WHERE id = ?").run(cur.id);
}

// ---- charges (Pix) ----------------------------------------------------------

export function listCharges(ctx: RequestContext): ChargeRow[] {
  const floor = historyFloor(ctx);
  const clauses = ["org_id = ?"];
  const args: unknown[] = [ctx.org.id];
  if (floor) {
    clauses.push("created_at >= ?");
    args.push(floor);
  }
  return getDb()
    .prepare(
      `SELECT * FROM charges WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
    )
    .all(...(args as never[])) as ChargeRow[];
}

export function getCharge(ctx: RequestContext, id: string): ChargeRow {
  const row = getDb()
    .prepare("SELECT * FROM charges WHERE org_id = ? AND id = ?")
    .get(ctx.org.id, id) as ChargeRow | undefined;
  if (!row) throw errors.notFound("Cobrança não encontrada.");
  return row;
}

/** Creates a Pix charge, generating a real BR Code, and marks quote as cobrado. */
export function createCharge(
  ctx: RequestContext,
  data: { quoteId?: string; amountCents?: number; pixKey?: string },
): ChargeRow {
  let quote: QuoteRow | null = null;
  let amount = data.amountCents ?? 0;
  if (data.quoteId) {
    quote = getQuote(ctx, data.quoteId);
    if (!amount) amount = quote.amount;
  }
  if (!amount || amount <= 0) throw errors.badRequest("Valor da cobrança inválido.");

  const pixKey = (data.pixKey ?? ctx.org.pix_key ?? "").trim();
  if (!pixKey) {
    throw errors.badRequest(
      "Configure uma chave Pix no negócio antes de gerar cobranças.",
    );
  }

  const id = newId("chg");
  const txid = makeTxid(id);
  const brcode = buildBrCode({
    key: pixKey,
    amountCents: amount,
    merchantName: ctx.org.name,
    merchantCity: ctx.org.pix_city || ctx.org.city || "SAO PAULO",
    txid,
  });

  getDb()
    .prepare(
      "INSERT INTO charges (id, org_id, quote_id, method, amount, status, brcode, txid, pix_key, created_at) VALUES (?, ?, ?, 'pix', ?, 'pendente', ?, ?, ?, ?)",
    )
    .run(id, ctx.org.id, quote?.id ?? null, amount, brcode, txid, pixKey, nowIso());

  if (quote && (quote.status === "aprovado" || quote.status === "enviado")) {
    setQuoteStatus(ctx, quote.id, "cobrado", { note: "Cobrança Pix gerada" });
  }
  return getCharge(ctx, id);
}

export function markChargePaid(ctx: RequestContext, id: string): ChargeRow {
  const cur = getCharge(ctx, id);
  if (cur.status !== "pago") {
    getDb()
      .prepare("UPDATE charges SET status='pago', paid_at=? WHERE id=?")
      .run(nowIso(), cur.id);
    if (cur.quote_id) {
      const q = getDb()
        .prepare("SELECT * FROM quotes WHERE id = ?")
        .get(cur.quote_id) as QuoteRow | undefined;
      if (q && q.status !== "pago") {
        setQuoteStatus(ctx, q.id, "pago", { note: "Pix confirmado", force: true });
      }
    }
  }
  return getCharge(ctx, cur.id);
}

// ---- reports ----------------------------------------------------------------

export function buildReport(ctx: RequestContext) {
  if (ctx.plan.features.reports === "none") {
    throw errors.planLimit(
      "Relatórios estão disponíveis nos planos Pro e Negócio.",
      { feature: "reports" },
    );
  }
  const db = getDb();
  const orgId = ctx.org.id;
  const monthStart = monthStartIso();

  const sum = (sql: string, ...a: unknown[]) =>
    (db.prepare(sql).get(...(a as never[])) as { s: number | null }).s ?? 0;
  const cnt = (sql: string, ...a: unknown[]) =>
    (db.prepare(sql).get(...(a as never[])) as { c: number }).c;

  const receivedMonth = sum(
    "SELECT SUM(amount) s FROM charges WHERE org_id=? AND status='pago' AND paid_at >= ?",
    orgId,
    monthStart,
  );
  const openAmount = sum(
    "SELECT SUM(amount) s FROM charges WHERE org_id=? AND status='pendente'",
    orgId,
  );
  const quotesMonth = cnt(
    "SELECT COUNT(*) c FROM quotes WHERE org_id=? AND created_at >= ?",
    orgId,
    monthStart,
  );
  const paidMonth = cnt(
    "SELECT COUNT(*) c FROM quotes WHERE org_id=? AND status='pago' AND created_at >= ?",
    orgId,
    monthStart,
  );

  const basic = {
    level: ctx.plan.features.reports,
    receivedMonth: fromCents(receivedMonth),
    openAmount: fromCents(openAmount),
    quotesMonth,
    conversion: quotesMonth ? Math.round((paidMonth / quotesMonth) * 100) / 100 : 0,
  };

  if (ctx.plan.features.reports === "basic") return basic;

  // complete report (Negócio): status funnel + top clients + monthly series
  const funnel = QUOTE_STATUSES.map((s) => ({
    status: s,
    label: statusLabelOf(s),
    count: cnt("SELECT COUNT(*) c FROM quotes WHERE org_id=? AND status=?", orgId, s),
  }));

  const topClients = db
    .prepare(
      `SELECT client_name AS name, COUNT(*) c, SUM(amount) s
       FROM quotes WHERE org_id=? GROUP BY client_name ORDER BY s DESC LIMIT 5`,
    )
    .all(orgId) as { name: string; c: number; s: number }[];

  const avgTicket = (() => {
    const row = db
      .prepare("SELECT AVG(amount) a FROM quotes WHERE org_id=? AND status='pago'")
      .get(orgId) as { a: number | null };
    return fromCents(Math.round(row.a ?? 0));
  })();

  return {
    ...basic,
    avgTicket,
    funnel,
    topClients: topClients.map((t) => ({
      name: t.name,
      quotes: t.c,
      total: fromCents(t.s),
    })),
  };
}

// ---- subscription -----------------------------------------------------------

export function recordSubscription(
  org: OrgRow,
  plan: string,
  cycle: string,
  amountCents: number,
  note?: string,
) {
  getDb()
    .prepare(
      "INSERT INTO subscription_events (id, org_id, plan, cycle, amount, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(newId("sub"), org.id, plan, cycle, amountCents, note ?? null, nowIso());
}
