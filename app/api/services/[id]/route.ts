import { handle, ok, readJson, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  deleteService,
  getService,
  readAmountCents,
  serializeService,
  updateService,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    return ok({ service: serializeService(getService(ctx, id)) });
  });
}

export function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const body = await readJson(req);
    const hasPrice = body.price != null || body.priceCents != null;
    const service = updateService(ctx, id, {
      name: optionalString(body, "name"),
      unit: optionalString(body, "unit"),
      priceCents: hasPrice
        ? readAmountCents({ amount: body.price, amountCents: body.priceCents })
        : undefined,
    });
    return ok({ service: serializeService(service) });
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    deleteService(ctx, id);
    return ok();
  });
}
