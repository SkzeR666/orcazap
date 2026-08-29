import { handle, ok } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { serializeOrg } from "@/lib/server/org";
import { counts } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — current user, org, plan and usage counters. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({
      user: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email },
      membership: { id: ctx.membership.id, role: ctx.membership.role },
      org: serializeOrg(ctx.org, ctx),
      usage: counts(ctx.org.id),
    });
  });
}
