import { handle, ok, readJson, optionalString } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { acceptInvite } from "@/lib/server/invites";
import { rateLimit, clientKey } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

/**
 * POST /api/invites/:token/accept — body: { name?, password? }.
 * Links or creates the user, activates the membership and opens a session
 * pointed at the org. New users must provide a password (min 6).
 */
export function POST(req: Request, { params }: Params) {
  return handle(async () => {
    rateLimit(clientKey(req, "invite-accept"), { limit: 15, windowMs: 15 * 60_000 });
    const { token } = await params;
    const body = await readJson(req);
    const result = acceptInvite(token, {
      name: optionalString(body, "name"),
      password: optionalString(body, "password"),
    });
    await setSessionCookie(result.sessionToken);
    return ok({ ok: true, orgId: result.orgId });
  });
}
