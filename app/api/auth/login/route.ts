import { handle, readJson, requireString, ok, errors } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";
import {
  createSession,
  setSessionCookie,
  verifyPassword,
  type UserRow,
} from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/login */
export function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const email = requireString(body, "email").toLowerCase();
    const password = requireString(body, "password", "senha");

    // Throttle by IP and by target account to blunt brute-force attempts.
    rateLimit(clientKey(req, "login"), { limit: 10, windowMs: 5 * 60_000 });
    rateLimit(`login:acct:${email}`, { limit: 8, windowMs: 5 * 60_000 });

    const user = getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw errors.unauthorized("E-mail ou senha incorretos.");
    }

    const token = createSession(user.id);
    await setSessionCookie(token);
    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: Boolean(user.email_verified),
      },
    });
  });
}
