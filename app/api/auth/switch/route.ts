import { handle, ok, readJson, requireString, errors } from "@/lib/server/http";
import { requireContext, setActiveOrg } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/switch — body: { orgId } points the session at another org. */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const orgId = requireString(body, "orgId");
    const okSwitch = await setActiveOrg(ctx.user.id, orgId);
    if (!okSwitch) throw errors.forbidden("Você não pertence a este negócio.");
    return ok({ ok: true, activeOrgId: orgId });
  });
}
