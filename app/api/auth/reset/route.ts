import { handle, ok, readJson, requireString, errors } from "@/lib/server/http";
import { consumePasswordReset } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/reset — body: { token, password }. Revokes existing sessions. */
export function POST(req: Request) {
  return handle(async () => {
    rateLimit(clientKey(req, "reset"), { limit: 10, windowMs: 15 * 60_000 });
    const body = await readJson(req);
    const token = requireString(body, "token");
    const password = requireString(body, "password", "senha");
    if (password.length < 6) {
      throw errors.badRequest("A senha precisa ter ao menos 6 caracteres.");
    }
    if (!consumePasswordReset(token, password)) {
      throw errors.badRequest("Token de redefinição inválido ou expirado.");
    }
    return ok({ ok: true });
  });
}
