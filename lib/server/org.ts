import { getDb } from "./db";
import { errors } from "./http";
import { newId, newToken, nowIso, slugify, isEmail } from "./util";
import { counts, recordSubscription } from "./store";
import {
  getPlan,
  isPlanId,
  priceFor,
  type BillingCycle,
  type PlanId,
} from "./plans";
import { toCents } from "./util";
import { DEFAULT_TEMPLATE } from "./whatsapp";
import type { MembershipRow, OrgRow, RequestContext } from "./auth";

// ---- business profile -------------------------------------------------------

/** Fields any plan may edit (the "Básico" business data). */
const BASIC_FIELDS = ["name", "whatsapp", "city", "pix_key", "pix_holder"] as const;
/** Fields gated behind features.businessData === "complete". */
const COMPLETE_FIELDS = [
  "segment",
  "email",
  "document",
  "address",
  "pix_type",
  "pix_city",
  "quote_tone",
  "quote_valid_days",
  "quote_cta",
  "quote_reminder",
  "pix_auto",
  "pix_qr",
] as const;

const BOOL_FIELDS = new Set(["quote_cta", "quote_reminder", "pix_auto", "pix_qr"]);
const INT_FIELDS = new Set(["quote_valid_days"]);

const CAMEL_TO_COL: Record<string, string> = {
  name: "name",
  whatsapp: "whatsapp",
  city: "city",
  segment: "segment",
  email: "email",
  document: "document",
  address: "address",
  pixKey: "pix_key",
  pixHolder: "pix_holder",
  pixType: "pix_type",
  pixCity: "pix_city",
  quoteTone: "quote_tone",
  quoteValidDays: "quote_valid_days",
  quoteCta: "quote_cta",
  quoteReminder: "quote_reminder",
  pixAuto: "pix_auto",
  pixQr: "pix_qr",
};

export function serializeOrg(org: OrgRow, ctx: RequestContext) {
  const plan = ctx.plan;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    segment: org.segment,
    city: org.city,
    whatsapp: org.whatsapp,
    email: org.email,
    document: org.document,
    address: org.address,
    hasLogo: Boolean(org.logo),
    logo: org.logo,
    brandingRemoved: Boolean(org.branding_removed),
    messageTemplate: org.message_template,
    quote: {
      tone: org.quote_tone,
      validDays: org.quote_valid_days,
      cta: Boolean(org.quote_cta),
      reminder: Boolean(org.quote_reminder),
    },
    pix: {
      type: org.pix_type,
      key: org.pix_key,
      holder: org.pix_holder,
      city: org.pix_city,
      auto: Boolean(org.pix_auto),
      qr: Boolean(org.pix_qr),
    },
    plan: org.plan,
    planCycle: org.plan_cycle,
    planSince: org.plan_since,
    publicUrl: `orcazap.app/u/${org.slug}`,
    limits: plan.limits,
    features: plan.features,
  };
}

/**
 * Applies a business-profile patch, rejecting gated fields for plans without
 * `businessData: "complete"`. Accepts camelCase keys.
 */
export function updateBusiness(
  ctx: RequestContext,
  patch: Record<string, unknown>,
): OrgRow {
  const complete = ctx.plan.features.businessData === "complete";
  const sets: string[] = [];
  const args: unknown[] = [];

  for (const [key, raw] of Object.entries(patch)) {
    const col = CAMEL_TO_COL[key];
    if (!col) continue;
    const isBasic = (BASIC_FIELDS as readonly string[]).includes(col);
    const isComplete = (COMPLETE_FIELDS as readonly string[]).includes(col);
    if (!isBasic && !isComplete) continue;
    if (isComplete && !complete) {
      throw errors.planLimit(
        `Dados completos da empresa exigem o plano Pro ou Negócio (campo: ${key}).`,
        { field: key },
      );
    }
    let value: unknown = raw;
    if (BOOL_FIELDS.has(col)) value = raw ? 1 : 0;
    else if (INT_FIELDS.has(col)) value = Number.parseInt(String(raw), 10) || 0;
    else if (raw == null) value = null;
    else value = String(raw);
    sets.push(`${col} = ?`);
    args.push(value);
  }

  // keep slug in sync when the name changes
  if (typeof patch.name === "string" && patch.name.trim()) {
    sets.push("slug = ?");
    args.push(slugify(patch.name) || ctx.org.slug);
  }

  if (!sets.length) return ctx.org;
  args.push(ctx.org.id);
  getDb().prepare(`UPDATE orgs SET ${sets.join(", ")} WHERE id = ?`).run(...(args as never[]));
  return getDb().prepare("SELECT * FROM orgs WHERE id = ?").get(ctx.org.id) as OrgRow;
}

export function setLogo(ctx: RequestContext, dataUrl: string | null): OrgRow {
  if (dataUrl && !ctx.plan.features.logo) {
    throw errors.planLimit("Logo da empresa é um recurso Pro/Negócio.", {
      feature: "logo",
    });
  }
  getDb().prepare("UPDATE orgs SET logo = ? WHERE id = ?").run(dataUrl, ctx.org.id);
  return getDb().prepare("SELECT * FROM orgs WHERE id = ?").get(ctx.org.id) as OrgRow;
}

export function setBrandingRemoved(ctx: RequestContext, removed: boolean): OrgRow {
  if (removed && !ctx.plan.features.removeBranding) {
    throw errors.planLimit("Remover a marca OrçaZap é um recurso Pro/Negócio.", {
      feature: "removeBranding",
    });
  }
  getDb()
    .prepare("UPDATE orgs SET branding_removed = ? WHERE id = ?")
    .run(removed ? 1 : 0, ctx.org.id);
  return getDb().prepare("SELECT * FROM orgs WHERE id = ?").get(ctx.org.id) as OrgRow;
}

export function setMessageTemplate(ctx: RequestContext, template: string | null): OrgRow {
  const isCustom = Boolean(template && template.trim() !== DEFAULT_TEMPLATE.trim());
  if (isCustom && !ctx.plan.features.customTemplates) {
    throw errors.planLimit(
      "Modelos personalizados de mensagem são um recurso Pro/Negócio.",
      { feature: "customTemplates" },
    );
  }
  getDb()
    .prepare("UPDATE orgs SET message_template = ? WHERE id = ?")
    .run(template, ctx.org.id);
  return getDb().prepare("SELECT * FROM orgs WHERE id = ?").get(ctx.org.id) as OrgRow;
}

// ---- subscription / plan change --------------------------------------------

export function changePlan(
  ctx: RequestContext,
  plan: PlanId,
  cycle: BillingCycle,
): OrgRow {
  if (!isPlanId(plan)) throw errors.badRequest("Plano inválido.");
  const nextPlan = getPlan(plan);

  // Downgrades must respect the target plan's caps (users especially).
  const c = counts(ctx.org.id);
  if (nextPlan.limits.users < c.users) {
    throw errors.planLimit(
      `Este plano permite ${nextPlan.limits.users} usuário(s); remova membros antes de trocar.`,
      { limit: nextPlan.limits.users, used: c.users },
    );
  }

  getDb()
    .prepare("UPDATE orgs SET plan = ?, plan_cycle = ?, plan_since = ? WHERE id = ?")
    .run(plan, cycle, nowIso(), ctx.org.id);

  const amountCents = toCents(priceFor(plan, cycle));
  recordSubscription(ctx.org, plan, cycle, amountCents, "plan change");
  return getDb().prepare("SELECT * FROM orgs WHERE id = ?").get(ctx.org.id) as OrgRow;
}

// ---- team -------------------------------------------------------------------

export function listMembers(ctx: RequestContext): MembershipRow[] {
  return getDb()
    .prepare("SELECT * FROM memberships WHERE org_id = ? ORDER BY created_at ASC")
    .all(ctx.org.id) as MembershipRow[];
}

export function serializeMember(m: MembershipRow) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: m.status,
    createdAt: m.created_at,
    inviteToken: m.status === "invited" ? m.invite_token : undefined,
  };
}

export function inviteMember(
  ctx: RequestContext,
  data: { name: string; email: string; role?: string },
): MembershipRow {
  const active = counts(ctx.org.id).users;
  if (active >= ctx.plan.limits.users) {
    throw errors.planLimit(
      `Seu plano permite ${ctx.plan.limits.users} usuário(s). Faça upgrade para convidar mais.`,
      { limit: ctx.plan.limits.users, used: active },
    );
  }
  if (!isEmail(data.email)) throw errors.badRequest("E-mail inválido.");
  const role = data.role === "admin" ? "admin" : "operator";
  const id = newId("mem");
  const token = newToken();
  getDb()
    .prepare(
      "INSERT INTO memberships (id, org_id, user_id, name, email, role, status, invite_token, created_at) VALUES (?, ?, NULL, ?, ?, ?, 'invited', ?, ?)",
    )
    .run(id, ctx.org.id, data.name, data.email.toLowerCase(), role, token, nowIso());
  return getDb().prepare("SELECT * FROM memberships WHERE id = ?").get(id) as MembershipRow;
}

export function removeMember(ctx: RequestContext, id: string): void {
  const m = getDb()
    .prepare("SELECT * FROM memberships WHERE org_id = ? AND id = ?")
    .get(ctx.org.id, id) as MembershipRow | undefined;
  if (!m) throw errors.notFound("Membro não encontrado.");
  if (m.role === "owner") throw errors.badRequest("Não é possível remover o dono.");
  getDb().prepare("DELETE FROM memberships WHERE id = ?").run(id);
}
