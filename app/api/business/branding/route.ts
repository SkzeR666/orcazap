import { handle, ok, readJson } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { serializeOrg, setBrandingRemoved } from "@/lib/server/org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/business/branding — toggle "Remover marca OrçaZap". */
export function PATCH(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const removed = Boolean(body.removed ?? body.brandingRemoved);
    const org = setBrandingRemoved(ctx, removed);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}
