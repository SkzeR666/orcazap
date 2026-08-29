import { handle, ok } from "@/lib/server/http";
import { listUserOrgs, requireContext } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orgs — every business the current user belongs to. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({
      orgs: listUserOrgs(ctx.user.id),
      activeOrgId: ctx.org.id,
    });
  });
}
