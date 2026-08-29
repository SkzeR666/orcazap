import { handle, ok } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { removeMember } from "@/lib/server/org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/team/:id — remove a member or revoke an invite. */
export function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const { id } = await params;
    removeMember(ctx, id);
    return ok();
  });
}
