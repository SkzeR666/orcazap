import { handle, ok, readJson, requireString, errors } from "@/lib/server/http";
import {
  getContext,
  issueVerificationToken,
  verifyEmailByToken,
} from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/verify — body: { token } confirms the email address. */
export function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const token = requireString(body, "token");
    if (!verifyEmailByToken(token)) {
      throw errors.badRequest("Token de verificação inválido.");
    }
    return ok({ ok: true, emailVerified: true });
  });
}

/** PUT /api/auth/verify — reissues a verification token for the current user. */
export function PUT() {
  return handle(async () => {
    const ctx = await getContext();
    if (!ctx) throw errors.unauthorized();
    if (ctx.user.email_verified) return ok({ ok: true, emailVerified: true });
    const token = issueVerificationToken(ctx.user.id);
    return ok({ ok: true, verificationToken: token });
  });
}
