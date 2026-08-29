import { handle, ok, created, readJson, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  createCharge,
  listCharges,
  readAmountCents,
  serializeCharge,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/charges */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ charges: listCharges(ctx).map(serializeCharge) });
  });
}

/** POST /api/charges — generates a real Pix BR Code (copia-e-cola). */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const hasAmount = body.amount != null || body.amountCents != null;
    const charge = createCharge(ctx, {
      quoteId: optionalString(body, "quoteId"),
      amountCents: hasAmount ? readAmountCents(body) : undefined,
      pixKey: optionalString(body, "pixKey"),
    });
    return created({ charge: serializeCharge(charge) });
  });
}
