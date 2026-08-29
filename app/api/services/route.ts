import { handle, ok, created, readJson, requireString, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  createService,
  listServices,
  readAmountCents,
  serializeService,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/services */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ services: listServices(ctx).map(serializeService) });
  });
}

/** POST /api/services — accepts `price` (reais) or `priceCents`. Free cap: 10. */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const priceCents = readAmountCents(
      { amount: body.price, amountCents: body.priceCents },
      { required: false },
    );
    const service = createService(ctx, {
      name: requireString(body, "name", "nome"),
      priceCents,
      unit: optionalString(body, "unit"),
    });
    return created({ service: serializeService(service) });
  });
}
