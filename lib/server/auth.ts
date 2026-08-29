import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { errors } from "./http";
import { newId, newToken, nowIso } from "./util";
import { getPlan, type Plan } from "./plans";

const SESSION_COOKIE = "oz_session";
const SESSION_TTL_DAYS = 30;

// ---- password hashing (scrypt, no external deps) ----------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---- session lifecycle ------------------------------------------------------

export function createSession(userId: string): string {
  const db = getDb();
  const token = newToken();
  const now = Date.now();
  const expires = new Date(now + SESSION_TTL_DAYS * 86_400_000).toISOString();
  db.prepare(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(token, userId, new Date(now).toISOString(), expires);
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  store.delete(SESSION_COOKIE);
}

// ---- context resolution -----------------------------------------------------

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type OrgRow = {
  id: string;
  name: string;
  slug: string;
  segment: string | null;
  city: string | null;
  whatsapp: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  logo: string | null;
  branding_removed: number;
  message_template: string | null;
  quote_tone: string;
  quote_valid_days: number;
  quote_cta: number;
  quote_reminder: number;
  pix_type: string;
  pix_key: string | null;
  pix_holder: string | null;
  pix_city: string | null;
  pix_auto: number;
  pix_qr: number;
  plan: string;
  plan_cycle: string;
  plan_since: string | null;
  created_at: string;
};

export type MembershipRow = {
  id: string;
  org_id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
  invite_token: string | null;
  created_at: string;
};

export type RequestContext = {
  user: UserRow;
  org: OrgRow;
  membership: MembershipRow;
  plan: Plan;
};

export async function getContext(): Promise<RequestContext | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const session = db
    .prepare("SELECT * FROM sessions WHERE token = ?")
    .get(token) as { user_id: string; expires_at: string } | undefined;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.user_id) as UserRow | undefined;
  if (!user) return null;

  const membership = db
    .prepare(
      "SELECT * FROM memberships WHERE user_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1",
    )
    .get(user.id) as MembershipRow | undefined;
  if (!membership) return null;

  const org = db
    .prepare("SELECT * FROM orgs WHERE id = ?")
    .get(membership.org_id) as OrgRow | undefined;
  if (!org) return null;

  return { user, org, membership, plan: getPlan(org.plan) };
}

/** Like getContext but throws 401 when unauthenticated. */
export async function requireContext(): Promise<RequestContext> {
  const ctx = await getContext();
  if (!ctx) throw errors.unauthorized();
  return ctx;
}

/** Throws 403 unless the current membership is owner or admin. */
export function requireAdmin(ctx: RequestContext): void {
  if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin") {
    throw errors.forbidden("Ação restrita ao dono ou administrador.");
  }
}
