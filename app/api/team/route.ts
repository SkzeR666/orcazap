import { handle, ok, created, readJson, requireString, optionalString } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { inviteMember, listMembers, serializeMember } from "@/lib/server/org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/team — org members and pending invites. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ members: listMembers(ctx).map(serializeMember) });
  });
}

/** POST /api/team — invite a member (limited to 1/1/3 by plan). */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const body = await readJson(req);
    const member = inviteMember(ctx, {
      name: requireString(body, "name", "nome"),
      email: requireString(body, "email"),
      role: optionalString(body, "role"),
    });
    return created({ member: serializeMember(member) });
  });
}
