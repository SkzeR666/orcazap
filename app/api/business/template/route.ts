import { handle, ok, readJson, requireString } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { serializeOrg, setMessageTemplate } from "@/lib/server/org";
import { DEFAULT_TEMPLATE } from "@/lib/server/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PUT /api/business/template — custom WhatsApp message model (Pro/Negócio). */
export function PUT(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const body = await readJson(req);
    const template = requireString(body, "template", "template", 5000);
    const org = setMessageTemplate(ctx, template);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}

/** DELETE /api/business/template — revert to the default template. */
export function DELETE() {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const org = setMessageTemplate(ctx, DEFAULT_TEMPLATE);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}
