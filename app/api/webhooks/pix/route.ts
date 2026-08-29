import { handle, ok, errors, json } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";
import { newId, nowIso } from "@/lib/server/util";
import { getProvider } from "@/lib/server/psp";
import type { QuoteRow, ChargeRow } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/pix — provider callback confirming a Pix payment.
 * Body: { txid, status?, id? }. Authenticity is checked by the provider
 * (HMAC signature or shared secret). Idempotent on the event id.
 */
export function POST(req: Request) {
  return handle(async () => {
    const provider = getProvider();
    const raw = await req.text();

    if (!provider.verify(raw, req.headers)) {
      throw errors.unauthorized("Assinatura de webhook inválida.");
    }

    let body: Record<string, unknown>;
    try {
      body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      throw errors.badRequest("Corpo JSON inválido.");
    }

    const event = provider.parse(body);
    if (!event.txid) throw errors.badRequest('"txid" é obrigatório.');

    const db = getDb();

    // Idempotency: skip if this event id was already processed.
    if (event.eventId) {
      const seen = db
        .prepare("SELECT id FROM webhook_events WHERE event_id = ?")
        .get(event.eventId);
      if (seen) return ok({ received: true, duplicate: true });
    }

    try {
      db.prepare(
        "INSERT INTO webhook_events (id, source, kind, payload, event_id, created_at) VALUES (?, 'pix', ?, ?, ?, ?)",
      ).run(newId("wh"), event.status, raw.slice(0, 8000), event.eventId, nowIso());
    } catch (err) {
      if (/UNIQUE constraint/i.test(String(err))) {
        return ok({ received: true, duplicate: true });
      }
      throw err;
    }

    const charge = db
      .prepare("SELECT * FROM charges WHERE txid = ?")
      .get(event.txid) as ChargeRow | undefined;
    if (!charge) {
      return json({ received: true, matched: false }, 202);
    }

    if (event.status === "pago" && charge.status !== "pago") {
      db.prepare("UPDATE charges SET status='pago', paid_at=? WHERE id=?").run(
        nowIso(),
        charge.id,
      );
      if (charge.quote_id) {
        const q = db
          .prepare("SELECT * FROM quotes WHERE id = ?")
          .get(charge.quote_id) as QuoteRow | undefined;
        if (q && q.status !== "pago") {
          db.prepare("UPDATE quotes SET status='pago', updated_at=? WHERE id=?").run(
            nowIso(),
            q.id,
          );
          db.prepare(
            "INSERT INTO quote_events (id, quote_id, org_id, type, from_status, to_status, note, created_at) VALUES (?, ?, ?, 'webhook', ?, 'pago', 'Pix confirmado via webhook', ?)",
          ).run(newId("evt"), q.id, q.org_id, q.status, nowIso());
        }
      }
    }
    return ok({ received: true, matched: true, txid: event.txid });
  });
}
