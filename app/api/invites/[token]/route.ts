import { handle, ok } from "@/lib/server/http";
import { inspectInvite } from "@/lib/server/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

/** GET /api/invites/:token — public, pre-accept view of an invite. */
export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { token } = await params;
    return ok({ invite: inspectInvite(token) });
  });
}
