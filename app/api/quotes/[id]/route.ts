import { handle, ok, readJson, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  deleteQuote,
  getQuote,
  listQuoteEvents,
  readAmountCents,
  serializeQuote,
  updateQuote,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/quotes/:id — quote + status timeline. */
export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const quote = getQuote(ctx, id);
    const events = listQuoteEvents(ctx, quote.id).map((e) => ({
      id: e.id,
      type: e.type,
      fromStatus: e.from_status,
      toStatus: e.to_status,
      note: e.note,
      createdAt: e.created_at,
    }));
    return ok({ quote: serializeQuote(quote), events });
  });
}

export function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const body = await readJson(req);
    const hasAmount = body.amount != null || body.amountCents != null;
    const quote = updateQuote(ctx, id, {
      serviceName: optionalString(body, "serviceName"),
      notes: optionalString(body, "notes"),
      clientName: optionalString(body, "clientName"),
      clientPhone: optionalString(body, "clientPhone"),
      validDays: typeof body.validDays === "number" ? body.validDays : undefined,
      live: body.live == null ? undefined : Boolean(body.live),
      amountCents: hasAmount ? readAmountCents(body) : undefined,
    });
    return ok({ quote: serializeQuote(quote) });
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    deleteQuote(ctx, id);
    return ok();
  });
}
