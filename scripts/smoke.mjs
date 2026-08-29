#!/usr/bin/env node
// End-to-end smoke test for the OrçaZap API.
// Usage: BASE=http://localhost:3000 node scripts/smoke.mjs
// Requires the dev/prod server to be running. Exits non-zero on first failure.

const BASE = process.env.BASE ?? "http://localhost:3000";
let passed = 0;
const jars = new Map();

function ok(cond, label) {
  if (!cond) {
    console.error(`✗ ${label}`);
    process.exit(1);
  }
  passed++;
  console.log(`✓ ${label}`);
}

async function call(method, path, { body, jar, raw } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (jar && jars.get(jar)) headers.cookie = jars.get(jar);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie && jar) {
    const first = setCookie.split(",")[0].split(";")[0];
    jars.set(jar, first);
  }
  if (raw) return res;
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { _text: text.slice(0, 120) };
  }
  return { status: res.status, json };
}

const uniq = Date.now().toString(36);

async function main() {
  // plans (public)
  let r = await call("GET", "/api/plans");
  ok(r.status === 200 && r.json.plans?.length === 3, "GET /api/plans returns 3 plans");

  // signup (free) + verification token
  const email = `smoke_${uniq}@teste.com`;
  r = await call("POST", "/api/auth/signup", {
    jar: "owner",
    body: { name: "Smoke Owner", email, password: "segredo123", businessName: `Smoke ${uniq}` },
  });
  ok(r.status === 201 && r.json.verificationToken, "signup creates account + verification token");
  const vToken = r.json.verificationToken;

  // email verification
  r = await call("POST", "/api/auth/verify", { body: { token: vToken } });
  ok(r.status === 200 && r.json.emailVerified === true, "email verification works");

  // me: free plan, no base64 logo leaked
  r = await call("GET", "/api/auth/me", { jar: "owner" });
  ok(r.status === 200 && r.json.org.plan === "free", "me shows free plan");
  ok(!("logo" in r.json.org) && r.json.org.hasLogo === false, "org profile has no inline base64 logo");

  // free quote cap (5/month) -> 6th is 402
  for (let i = 1; i <= 5; i++) {
    r = await call("POST", "/api/quotes", {
      jar: "owner",
      body: { clientName: `C${i}`, serviceName: `S${i}`, amount: 100 },
    });
    ok(r.status === 201, `create quote ${i}`);
  }
  r = await call("POST", "/api/quotes", { jar: "owner", body: { clientName: "X", serviceName: "Y", amount: 100 } });
  ok(r.status === 402 && r.json.error.code === "plan_limit", "6th quote blocked (402 plan_limit)");

  // negative amount rejected
  r = await call("POST", "/api/services", { jar: "owner", body: { name: "Neg", price: -5 } });
  ok(r.status === 400, "negative amount rejected (400)");

  // pagination meta on list
  r = await call("GET", "/api/quotes?limit=2&offset=0", { jar: "owner" });
  ok(r.status === 200 && r.json.quotes.length === 2 && r.json.meta.total >= 5, "quotes pagination meta");

  // reports gated on free
  r = await call("GET", "/api/reports", { jar: "owner" });
  ok(r.status === 402, "reports blocked on free (402)");

  // logo gated on free
  r = await call("PUT", "/api/business/logo", {
    jar: "owner",
    body: { logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
  });
  ok(r.status === 402, "logo blocked on free (402)");

  // upgrade to business
  r = await call("POST", "/api/subscription", { jar: "owner", body: { plan: "business", cycle: "annual" } });
  ok(r.status === 200 && r.json.business.plan === "business", "upgrade to business");

  // logo now allowed; served as image
  r = await call("PUT", "/api/business/logo", {
    jar: "owner",
    body: { logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
  });
  ok(r.status === 200 && r.json.business.hasLogo === true, "logo accepted on business");
  const img = await call("GET", "/api/business/logo", { jar: "owner", raw: true });
  ok(img.status === 200 && (img.headers.get("content-type") || "").startsWith("image/"), "logo served as image bytes");

  // set pix key then generate charge on a fresh quote
  await call("PATCH", "/api/business", { jar: "owner", body: { pixKey: "smoke@pix.com", city: "Sao Paulo" } });
  r = await call("POST", "/api/quotes", { jar: "owner", body: { clientName: "Marina", clientPhone: "(11) 98888-1200", serviceName: "Limpeza", amount: 680, live: true } });
  ok(r.status === 201, "business plan: extra quote allowed (unlimited)");
  const quoteId = r.json.quote.id;
  await call("POST", `/api/quotes/${quoteId}/status`, { jar: "owner", body: { action: "enviar" } });
  await call("POST", `/api/quotes/${quoteId}/status`, { jar: "owner", body: { action: "aprovar" } });
  r = await call("POST", "/api/charges", { jar: "owner", body: { quoteId } });
  ok(r.status === 201 && typeof r.json.charge.brcode === "string" && r.json.charge.brcode.startsWith("0002"), "Pix charge generates BR Code");
  const charge = r.json.charge;

  // webhook confirms payment (idempotent)
  r = await call("POST", "/api/webhooks/pix", { body: { txid: charge.txid, status: "pago", id: `evt_${uniq}` } });
  ok(r.status === 200 && r.json.matched === true, "pix webhook confirms payment");
  r = await call("POST", "/api/webhooks/pix", { body: { txid: charge.txid, status: "pago", id: `evt_${uniq}` } });
  ok(r.status === 200 && r.json.duplicate === true, "pix webhook is idempotent");
  r = await call("GET", `/api/quotes/${quoteId}`, { jar: "owner" });
  ok(r.json.quote.status === "pago", "quote settled to pago after webhook");

  // PDF
  const pdf = await call("GET", `/api/quotes/${quoteId}/pdf`, { jar: "owner", raw: true });
  const head = new Uint8Array(await pdf.arrayBuffer()).slice(0, 5);
  ok(pdf.status === 200 && String.fromCharCode(...head) === "%PDF-", "quote PDF renders");

  // team invite + accept flow (the previously-missing piece)
  const memberEmail = `member_${uniq}@teste.com`;
  r = await call("POST", "/api/team", { jar: "owner", body: { name: "Member", email: memberEmail, role: "operator" } });
  ok(r.status === 201 && r.json.member.inviteToken, "invite member returns token");
  const inviteToken = r.json.member.inviteToken;
  r = await call("GET", `/api/invites/${inviteToken}`);
  ok(r.status === 200 && r.json.invite.email === memberEmail, "invite inspectable pre-accept");
  r = await call("POST", `/api/invites/${inviteToken}/accept`, { jar: "member", body: { password: "membersenha" } });
  ok(r.status === 200, "invite accepted, session opened");
  r = await call("GET", "/api/auth/me", { jar: "member" });
  ok(r.status === 200 && r.json.membership.role === "operator", "member can authenticate as operator");

  // operator cannot change subscription (admin-only)
  r = await call("POST", "/api/subscription", { jar: "member", body: { plan: "free", cycle: "monthly" } });
  ok(r.status === 403, "operator blocked from subscription change (403)");

  // org switch: member belongs to exactly one org; switching to a bogus org fails
  r = await call("POST", "/api/auth/switch", { jar: "member", body: { orgId: "org_bogus" } });
  ok(r.status === 403, "switching to a non-member org is forbidden");

  // password reset flow
  r = await call("POST", "/api/auth/forgot", { body: { email } });
  ok(r.status === 200 && r.json.resetToken, "forgot returns reset token");
  const resetToken = r.json.resetToken;
  r = await call("POST", "/api/auth/reset", { body: { token: resetToken, password: "novasenha123" } });
  ok(r.status === 200, "password reset accepted");
  r = await call("POST", "/api/auth/login", { jar: "owner2", body: { email, password: "novasenha123" } });
  ok(r.status === 200, "login works with new password");

  console.log(`\nAll ${passed} checks passed.`);
}

main().catch((err) => {
  console.error("smoke test crashed:", err);
  process.exit(1);
});
