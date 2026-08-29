import { handle, ok } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { markChargePaid, serializeCharge } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** POST /api/charges/:id/paid — manual confirmation; also settles the quote. */
export function POST(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    return ok({ charge: serializeCharge(markChargePaid(ctx, id)) });
  });
}
