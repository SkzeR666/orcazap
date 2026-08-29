import { getDb } from "./db";
import { errors } from "./http";
import { newId, nowIso, isEmail } from "./util";
import { getPlan } from "./plans";
import { createSession, hashPassword, type MembershipRow } from "./auth";

type InviteRow = MembershipRow & { org_id: string };

function loadInvite(token: string): InviteRow {
  const row = getDb()
    .prepare(
      "SELECT * FROM memberships WHERE invite_token = ? AND status = 'invited'",
    )
    .get(token) as InviteRow | undefined;
  if (!row) throw errors.notFound("Convite inválido ou já utilizado.");
  return row;
}

/** Public, pre-accept view of an invite (org name + role + target email). */
export function inspectInvite(token: string) {
  const invite = loadInvite(token);
  const org = getDb()
    .prepare("SELECT name, slug FROM orgs WHERE id = ?")
    .get(invite.org_id) as { name: string; slug: string } | undefined;
  return {
    email: invite.email,
    name: invite.name,
    role: invite.role,
    org: org ? { name: org.name, slug: org.slug } : null,
  };
}

function activeUsers(orgId: string): number {
  return (
    getDb()
      .prepare(
        "SELECT COUNT(*) c FROM memberships WHERE org_id = ? AND status = 'active'",
      )
      .get(orgId) as { c: number }
  ).c;
}

/**
 * Accepts an invite: links an existing user (by email) or creates one, marks the
 * membership active, opens a session pointed at the org. Re-checks the plan's
 * user cap at accept time so a downgrade between invite and accept is honored.
 */
export function acceptInvite(
  token: string,
  data: { name?: string; password?: string },
): { userId: string; orgId: string; sessionToken: string } {
  const db = getDb();
  const invite = loadInvite(token);

  const org = db.prepare("SELECT plan FROM orgs WHERE id = ?").get(invite.org_id) as
    | { plan: string }
    | undefined;
  if (!org) throw errors.notFound("Negócio não encontrado.");
  const plan = getPlan(org.plan);
  if (activeUsers(invite.org_id) >= plan.limits.users) {
    throw errors.planLimit(
      `O plano deste negócio permite ${plan.limits.users} usuário(s). Peça um upgrade ao administrador.`,
      { limit: plan.limits.users },
    );
  }

  let user = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(invite.email) as { id: string } | undefined;

  if (!user) {
    if (!data.password || data.password.length < 6) {
      throw errors.badRequest("Defina uma senha com ao menos 6 caracteres.");
    }
    if (!isEmail(invite.email)) throw errors.badRequest("E-mail do convite inválido.");
    const id = newId("usr");
    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, 1, ?)",
    ).run(id, data.name?.trim() || invite.name, invite.email, hashPassword(data.password), nowIso());
    user = { id };
  }

  db.prepare(
    "UPDATE memberships SET user_id = ?, status = 'active', invite_token = NULL WHERE id = ?",
  ).run(user.id, invite.id);

  const sessionToken = createSession(user.id);
  db.prepare("UPDATE sessions SET active_org_id = ? WHERE token = ?").run(
    invite.org_id,
    sessionToken,
  );

  return { userId: user.id, orgId: invite.org_id, sessionToken };
}
