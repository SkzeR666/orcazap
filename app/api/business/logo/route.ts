import { handle, ok, readJson, requireString, errors } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { serializeOrg, setLogo } from "@/lib/server/org";
import { getLogo } from "@/lib/server/logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/business/logo — the stored logo image bytes. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    const logo = getLogo(ctx.org.id);
    if (!logo) throw errors.notFound("Sem logo.");
    return new Response(new Uint8Array(logo.data), {
      status: 200,
      headers: {
        "Content-Type": logo.mime,
        "Cache-Control": "private, max-age=60",
      },
    });
  });
}

/** PUT /api/business/logo — set logo (data URL). Pro/Negócio only. */
export function PUT(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const body = await readJson(req);
    const dataUrl = requireString(body, "logo", "logo", 1_000_000);
    const org = setLogo(ctx, dataUrl);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}

/** DELETE /api/business/logo — remove logo. */
export function DELETE() {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const org = setLogo(ctx, null);
    return ok({ business: serializeOrg(org, { ...ctx, org }) });
  });
}
