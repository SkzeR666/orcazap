import { handle, ok } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { getCharge, serializeCharge } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/charges/:id */
export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    return ok({ charge: serializeCharge(getCharge(ctx, id)) });
  });
}
