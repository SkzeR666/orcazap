import { handle, ok, readJson, requireString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { serializeOrg, setLogo } from "@/lib/server/org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PUT /api/business/logo — set logo (data URL). Pro/Negócio only. */
export function PUT(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const dataUrl = requireString(body, "logo");
    const org = setLogo(ctx, dataUrl);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}

/** DELETE /api/business/logo — remove logo. */
export function DELETE() {
  return handle(async () => {
    const ctx = await requireContext();
    const org = setLogo(ctx, null);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}
