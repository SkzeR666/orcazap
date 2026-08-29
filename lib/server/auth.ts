import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { errors } from "./http";
import { newToken, nowIso } from "./util";
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
  email_verified: number;
  verification_token: string | null;
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
    .get(token) as
    | { user_id: string; expires_at: string; active_org_id: string | null }
    | undefined;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.user_id) as UserRow | undefined;
  if (!user) return null;

  // Prefer the session's active org (when the user still belongs to it),
  // otherwise fall back to the earliest active membership.
  let membership: MembershipRow | undefined;
  if (session.active_org_id) {
    membership = db
      .prepare(
        "SELECT * FROM memberships WHERE user_id = ? AND org_id = ? AND status = 'active' LIMIT 1",
      )
      .get(user.id, session.active_org_id) as MembershipRow | undefined;
  }
  if (!membership) {
    membership = db
      .prepare(
        "SELECT * FROM memberships WHERE user_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1",
      )
      .get(user.id) as MembershipRow | undefined;
  }
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

// ---- multi-org (join / switch) ---------------------------------------------

/** Orgs the user actively belongs to, with their role in each. */
export function listUserOrgs(userId: string) {
  return getDb()
    .prepare(
      `SELECT o.id, o.name, o.slug, o.plan, m.role
       FROM memberships m JOIN orgs o ON o.id = m.org_id
       WHERE m.user_id = ? AND m.status = 'active'
       ORDER BY m.created_at ASC`,
    )
    .all(userId) as {
    id: string;
    name: string;
    slug: string;
    plan: string;
    role: string;
  }[];
}

/** Points the current session at another org the user belongs to. */
export async function setActiveOrg(userId: string, orgId: string): Promise<boolean> {
  const db = getDb();
  const member = db
    .prepare(
      "SELECT id FROM memberships WHERE user_id = ? AND org_id = ? AND status = 'active'",
    )
    .get(userId, orgId);
  if (!member) return false;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  db.prepare("UPDATE sessions SET active_org_id = ? WHERE token = ?").run(orgId, token);
  return true;
}

// ---- email verification -----------------------------------------------------

export function issueVerificationToken(userId: string): string {
  const token = newToken();
  getDb()
    .prepare("UPDATE users SET verification_token = ? WHERE id = ?")
    .run(token, userId);
  return token;
}

export function verifyEmailByToken(token: string): boolean {
  const db = getDb();
  const user = db
    .prepare("SELECT id FROM users WHERE verification_token = ?")
    .get(token) as { id: string } | undefined;
  if (!user) return false;
  db.prepare(
    "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?",
  ).run(user.id);
  return true;
}

// ---- password reset ---------------------------------------------------------

const RESET_TTL_MIN = 30;

/** Creates a single-use reset token (returned to the caller to deliver). */
export function createPasswordReset(email: string): string | null {
  const db = getDb();
  const user = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email.toLowerCase()) as { id: string } | undefined;
  if (!user) return null;
  const token = newToken();
  const now = Date.now();
  db.prepare(
    "INSERT INTO password_resets (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(
    token,
    user.id,
    new Date(now).toISOString(),
    new Date(now + RESET_TTL_MIN * 60_000).toISOString(),
  );
  return token;
}

/** Consumes a reset token and sets a new password, revoking all sessions. */
export function consumePasswordReset(token: string, newPassword: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM password_resets WHERE token = ?")
    .get(token) as
    | { token: string; user_id: string; expires_at: string; used_at: string | null }
    | undefined;
  if (!row || row.used_at) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hashPassword(newPassword),
    row.user_id,
  );
  db.prepare("UPDATE password_resets SET used_at = ? WHERE token = ?").run(
    nowIso(),
    token,
  );
  // Invalidate every existing session for safety.
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(row.user_id);
  return true;
}
