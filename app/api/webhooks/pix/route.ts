import { handle, ok, readJson, errors } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";
import { newId, nowIso } from "@/lib/server/util";
import type { QuoteRow, ChargeRow } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/pix — provider callback confirming a Pix payment.
 * Body: { txid, status? }. If ORCAZAP_WEBHOOK_SECRET is set, the request must
 * carry a matching `x-webhook-secret` header.
 */
export function POST(req: Request) {
  return handle(async () => {
    const secret = process.env.ORCAZAP_WEBHOOK_SECRET;
    if (secret && req.headers.get("x-webhook-secret") !== secret) {
      throw errors.unauthorized("Assinatura de webhook inválida.");
    }

    const body = await readJson(req);
    const txid = typeof body.txid === "string" ? body.txid.trim() : "";
    if (!txid) throw errors.badRequest('"txid" é obrigatório.');
    const status = typeof body.status === "string" ? body.status : "pago";

    const db = getDb();
    db.prepare(
      "INSERT INTO webhook_events (id, source, kind, payload, created_at) VALUES (?, 'pix', ?, ?, ?)",
    ).run(newId("wh"), status, JSON.stringify(body), nowIso());

    const charge = db
      .prepare("SELECT * FROM charges WHERE txid = ?")
      .get(txid) as ChargeRow | undefined;
    if (!charge) throw errors.notFound("Cobrança não encontrada para o txid.");

    if (status === "pago" && charge.status !== "pago") {
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
    return ok({ received: true, txid });
  });
}
