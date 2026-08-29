import { handle, readJson, requireString, created, errors } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";
import {
  createSession,
  hashPassword,
  issueVerificationToken,
  setSessionCookie,
} from "@/lib/server/auth";
import { newId, nowIso, slugify, isEmail } from "@/lib/server/util";
import { rateLimit, clientKey } from "@/lib/server/ratelimit";
import { DEFAULT_TEMPLATE } from "@/lib/server/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/signup — creates a user, their org (free plan) and a session. */
export function POST(req: Request) {
  return handle(async () => {
    rateLimit(clientKey(req, "signup"), { limit: 10, windowMs: 60 * 60_000 });
    const body = await readJson(req);
    const name = requireString(body, "name", "nome");
    const email = requireString(body, "email").toLowerCase();
    const password = requireString(body, "password", "senha");
    if (!isEmail(email)) throw errors.badRequest("E-mail inválido.");
    if (password.length < 6)
      throw errors.badRequest("A senha precisa ter ao menos 6 caracteres.");

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) throw errors.conflict("E-mail já cadastrado.");

    const businessName =
      requireOptional(body, "businessName") || `Negócio de ${name.split(" ")[0]}`;
    const now = nowIso();
    const userId = newId("usr");
    const orgId = newId("org");
    let slug = slugify(businessName) || "negocio";
    if (db.prepare("SELECT id FROM orgs WHERE slug = ?").get(slug)) {
      slug = `${slug}-${orgId.slice(-4)}`;
    }

    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(userId, name, email, hashPassword(password), now);

    db.prepare(
      `INSERT INTO orgs (id, name, slug, whatsapp, email, message_template, plan, plan_cycle, plan_since, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'free', 'monthly', ?, ?)`,
    ).run(orgId, businessName, slug, null, email, DEFAULT_TEMPLATE, now, now);

    db.prepare(
      "INSERT INTO memberships (id, org_id, user_id, name, email, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'owner', 'active', ?)",
    ).run(newId("mem"), orgId, userId, name, email, now);

    const verificationToken = issueVerificationToken(userId);
    const token = createSession(userId);
    await setSessionCookie(token);
    return created({
      user: { id: userId, name, email, emailVerified: false },
      org: { id: orgId, name: businessName, slug, plan: "free" },
      // No mailer is wired: the token is returned so the flow is testable.
      // In production, email this instead of returning it.
      verificationToken,
    });
  });
}

function requireOptional(body: Record<string, unknown>, key: string): string {
  const v = body[key];
  return typeof v === "string" ? v.trim() : "";
}
