import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./auth";
import { buildBrCode, makeTxid } from "./pix";
import { newId, newPublicId, nowIso, toCents } from "./util";
import { DEFAULT_TEMPLATE } from "./whatsapp";

/**
 * Seeds a demo tenant so a fresh database is immediately usable and mirrors the
 * front-end mock (Estúdio Limpeza Pro / Marina Costa). Idempotent: runs only
 * when there are no users yet.
 *
 * Demo login:  demo@orcazap.app  /  orcazap123
 */
export function ensureSeed(db: DatabaseSync): void {
  const existing = (
    db.prepare("SELECT COUNT(*) c FROM users").get() as { c: number }
  ).c;
  if (existing > 0) return;

  const now = nowIso();
  const userId = newId("usr");
  const orgId = newId("org");

  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(userId, "Marina Costa", "demo@orcazap.app", hashPassword("orcazap123"), now);

  db.prepare(
    `INSERT INTO orgs
      (id, name, slug, segment, city, whatsapp, email, logo, branding_removed, message_template,
       quote_tone, quote_valid_days, quote_cta, quote_reminder,
       pix_type, pix_key, pix_holder, pix_city, pix_auto, pix_qr,
       plan, plan_cycle, plan_since, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, ?, 'proximo', 7, 1, 1, 'email', ?, ?, ?, 1, 1, 'pro', 'monthly', ?, ?)`,
  ).run(
    orgId,
    "Estúdio Limpeza Pro",
    "estudio-limpeza-pro",
    "Limpeza",
    "São Paulo, SP",
    "(11) 90000-0000",
    "estudio@limpezapro.com.br",
    DEFAULT_TEMPLATE,
    "estudio@limpezapro.com.br",
    "Estúdio Limpeza Pro",
    "SAO PAULO",
    now,
    now,
  );

  db.prepare(
    "INSERT INTO memberships (id, org_id, user_id, name, email, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'owner', 'active', ?)",
  ).run(newId("mem"), orgId, userId, "Marina Costa", "demo@orcazap.app", now);

  const clients: [string, string][] = [
    ["Marina Costa", "(11) 98888-1200"],
    ["João Ferreira", "(11) 97777-3344"],
    ["Ana Beatriz", "(21) 96666-5511"],
    ["Carlos Eduardo", "(11) 95555-0099"],
    ["Patrícia Alves", "(31) 94444-7788"],
  ];
  const clientIds = new Map<string, string>();
  for (const [name, phone] of clients) {
    const id = newId("cli");
    clientIds.set(name, id);
    db.prepare(
      "INSERT INTO clients (id, org_id, name, phone, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(id, orgId, name, phone, now);
  }

  const services: [string, number][] = [
    ["Limpeza residencial", 220],
    ["Limpeza pós-obra", 680],
    ["Instalação de ar-condicionado", 450],
    ["Manutenção elétrica", 320],
    ["Pintura (por cômodo)", 400],
  ];
  for (const [name, price] of services) {
    db.prepare(
      "INSERT INTO services (id, org_id, name, price, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(newId("svc"), orgId, name, toCents(price), now);
  }

  const quotes: {
    client: string;
    service: string;
    amount: number;
    status: string;
    at: string;
  }[] = [
    { client: "Marina Costa", service: "Limpeza pós-obra (apto 2 quartos)", amount: 680, status: "pago", at: "2026-08-28T10:20:00" },
    { client: "João Ferreira", service: "Instalação de ar-condicionado", amount: 450, status: "cobrado", at: "2026-08-28T09:05:00" },
    { client: "Ana Beatriz", service: "Manutenção elétrica residencial", amount: 320, status: "aprovado", at: "2026-08-27T18:40:00" },
    { client: "Carlos Eduardo", service: "Pintura de sala + corredor", amount: 1200, status: "enviado", at: "2026-08-27T15:10:00" },
    { client: "Patrícia Alves", service: "Reparo hidráulico", amount: 280, status: "recusado", at: "2026-08-26T11:30:00" },
    { client: "Ricardo Mendes", service: "Limpeza residencial semanal", amount: 220, status: "pago", at: "2026-08-26T09:00:00" },
    { client: "Fernanda Lima", service: "Instalação de ventilador", amount: 180, status: "cobrado", at: "2026-08-25T16:45:00" },
  ];

  for (const q of quotes) {
    const id = newId("orc");
    const at = new Date(q.at).toISOString();
    const clientId = clientIds.get(q.client) ?? null;
    const amountCents = toCents(q.amount);
    db.prepare(
      `INSERT INTO quotes
        (id, org_id, public_id, client_id, client_name, service_name, amount, status, valid_days, live, live_step, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 7, 0, 0, ?, ?)`,
    ).run(id, orgId, newPublicId(), clientId, q.client, q.service, amountCents, q.status, at, at);
    db.prepare(
      "INSERT INTO quote_events (id, quote_id, org_id, type, from_status, to_status, created_at) VALUES (?, ?, ?, 'created', NULL, ?, ?)",
    ).run(newId("evt"), id, orgId, q.status, at);

    if (q.status === "cobrado" || q.status === "pago") {
      const chgId = newId("chg");
      const txid = makeTxid(chgId);
      const brcode = buildBrCode({
        key: "estudio@limpezapro.com.br",
        amountCents,
        merchantName: "Estúdio Limpeza Pro",
        merchantCity: "SAO PAULO",
        txid,
      });
      db.prepare(
        "INSERT INTO charges (id, org_id, quote_id, method, amount, status, brcode, txid, pix_key, created_at, paid_at) VALUES (?, ?, ?, 'pix', ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        chgId,
        orgId,
        id,
        amountCents,
        q.status === "pago" ? "pago" : "pendente",
        brcode,
        txid,
        "estudio@limpezapro.com.br",
        at,
        q.status === "pago" ? at : null,
      );
    }
  }
}
