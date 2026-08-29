import { handle, ok, created, readJson, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  createCharge,
  listCharges,
  parsePage,
  readAmountCents,
  serializeCharge,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/charges?limit=&offset= */
export function GET(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const page = parsePage(req);
    const { rows, total } = listCharges(ctx, page);
    return ok({ charges: rows.map(serializeCharge), meta: { total, ...page } });
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
