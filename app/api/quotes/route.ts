import { handle, ok, created, readJson, requireString, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  createQuote,
  isQuoteStatus,
  listQuotes,
  readAmountCents,
  serializeQuote,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/quotes?status=... — free plan only returns the last 30 days. */
export function GET(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const status = new URL(req.url).searchParams.get("status") ?? undefined;
    const rows = listQuotes(ctx, status ? { status } : undefined);
    return ok({ quotes: rows.map(serializeQuote) });
  });
}

/** POST /api/quotes — enforces the 5/month free cap; `live` needs Pro/Negócio. */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const statusRaw = optionalString(body, "status");
    const quote = createQuote(ctx, {
      clientId: optionalString(body, "clientId"),
      clientName: optionalString(body, "clientName"),
      clientPhone: optionalString(body, "clientPhone"),
      serviceName: requireString(body, "serviceName", "serviço"),
      amountCents: readAmountCents(body),
      notes: optionalString(body, "notes"),
      validDays:
        typeof body.validDays === "number" ? body.validDays : undefined,
      live: Boolean(body.live),
      status: isQuoteStatus(statusRaw) ? statusRaw : undefined,
    });
    return created({ quote: serializeQuote(quote) });
  });
}
