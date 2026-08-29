import { handle, ok, readJson } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { serializeOrg, updateBusiness } from "@/lib/server/org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/business — business profile + plan limits/features. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ business: serializeOrg(ctx.org, ctx) });
  });
}

/** PATCH /api/business — update profile (gated fields require Pro/Negócio). */
export function PATCH(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const body = await readJson(req);
    const org = updateBusiness(ctx, body);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}
