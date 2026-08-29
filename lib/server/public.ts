import { getDb } from "./db";
import { errors } from "./http";
import { fromCents, newId, nowIso } from "./util";
import { getPlan } from "./plans";
import { statusLabelOf, type QuoteRow } from "./store";
import type { OrgRow } from "./auth";

const LIVE_STEPS = [
  "Diagnóstico iniciado",
  "Peça confirmada",
  "Em execução",
  "Testes finais",
  "Concluído",
] as const;

function loadByPublicId(publicId: string): { quote: QuoteRow; org: OrgRow } {
  const db = getDb();
  const quote = db
    .prepare("SELECT * FROM quotes WHERE public_id = ?")
    .get(publicId) as QuoteRow | undefined;
  if (!quote) throw errors.notFound("Orçamento não encontrado.");
  const org = db.prepare("SELECT * FROM orgs WHERE id = ?").get(quote.org_id) as
    | OrgRow
    | undefined;
  if (!org) throw errors.notFound("Orçamento não encontrado.");
  return { quote, org };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Serializes the public, client-facing view of a quote (no auth required). */
export function getPublicQuote(publicId: string) {
  const { quote, org } = loadByPublicId(publicId);
  const plan = getPlan(org.plan);
  const brandingRemoved = Boolean(org.branding_removed) && plan.features.removeBranding;

  const charge = getDb()
    .prepare(
      "SELECT * FROM charges WHERE quote_id = ? ORDER BY created_at DESC LIMIT 1",
    )
    .get(quote.id) as { brcode: string | null; status: string } | undefined;

  return {
    id: quote.public_id,
    service: quote.service_name,
    client: quote.client_name,
    amount: fromCents(quote.amount),
    amountCents: quote.amount,
    status: quote.status,
    statusLabel: statusLabelOf(quote.status),
    notes: quote.notes,
    validDays: quote.valid_days,
    live: Boolean(quote.live) && plan.features.liveStatus,
    liveStep: quote.live_step,
    liveSteps: LIVE_STEPS,
    createdAt: quote.created_at,
    business: {
      name: org.name,
      initials: initials(org.name),
      city: org.city,
      whatsapp: org.whatsapp,
    },
    pixKey: org.pix_key,
    brcode: charge?.brcode ?? null,
    brandingRemoved,
  };
}

function logEvent(quote: QuoteRow, type: string, from: string, to: string, note?: string) {
  getDb()
    .prepare(
      "INSERT INTO quote_events (id, quote_id, org_id, type, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(newId("evt"), quote.id, quote.org_id, type, from, to, note ?? null, nowIso());
}

function setStatus(quote: QuoteRow, to: string, note?: string) {
  getDb()
    .prepare("UPDATE quotes SET status=?, updated_at=? WHERE id=?")
    .run(to, nowIso(), quote.id);
  logEvent(quote, "public", quote.status, to, note);
}

export type PublicAction = "approve" | "refuse" | "pay" | "confirm";

/** Applies a client-initiated action from the public quote page. */
export function applyPublicAction(publicId: string, action: PublicAction) {
  const { quote } = loadByPublicId(publicId);

  switch (action) {
    case "approve":
      if (quote.status === "rascunho" || quote.status === "enviado") {
        setStatus(quote, "aprovado", "Cliente aprovou");
      }
      break;
    case "refuse":
      if (quote.status !== "pago") setStatus(quote, "recusado", "Cliente recusou");
      break;
    case "pay": {
      const db = getDb();
      const charge = db
        .prepare(
          "SELECT * FROM charges WHERE quote_id = ? AND status = 'pendente' ORDER BY created_at DESC LIMIT 1",
        )
        .get(quote.id) as { id: string } | undefined;
      if (charge) {
        db.prepare("UPDATE charges SET status='pago', paid_at=? WHERE id=?").run(
          nowIso(),
          charge.id,
        );
      }
      if (quote.status !== "pago") setStatus(quote, "pago", "Pagamento confirmado");
      break;
    }
    case "confirm":
      getDb()
        .prepare("UPDATE quotes SET live_step=?, updated_at=? WHERE id=?")
        .run(LIVE_STEPS.length - 1, nowIso(), quote.id);
      break;
    default:
      throw errors.badRequest("Ação inválida.");
  }
  return getPublicQuote(publicId);
}
