import { handle, ok, readJson, requireString } from "@/lib/server/http";
import { createPasswordReset } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot — starts a password reset. Always returns ok (does not
 * reveal whether the email exists). No mailer is wired, so the token is
 * returned for testing; in production, email it instead.
 */
export function POST(req: Request) {
  return handle(async () => {
    rateLimit(clientKey(req, "forgot"), { limit: 5, windowMs: 15 * 60_000 });
    const body = await readJson(req);
    const email = requireString(body, "email");
    const token = createPasswordReset(email);
    return ok({ ok: true, resetToken: token ?? undefined });
  });
}
