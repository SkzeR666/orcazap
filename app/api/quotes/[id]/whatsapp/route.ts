import { handle, ok } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { getQuote } from "@/lib/server/store";
import { buildQuoteMessage, waLink } from "@/lib/server/whatsapp";
import { publicQuoteUrl } from "@/lib/server/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/quotes/:id/whatsapp — rendered message + wa.me share link. */
export function GET(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const quote = getQuote(ctx, id);
    const message = buildQuoteMessage(ctx.org, {
      clientName: quote.client_name,
      serviceName: quote.service_name,
      amountCents: quote.amount,
      notes: quote.notes,
      validDays: quote.valid_days,
      publicUrl: publicQuoteUrl(quote.public_id, req),
    });
    return ok({
      message,
      link: waLink(quote.client_phone, message),
      publicUrl: publicQuoteUrl(quote.public_id, req),
    });
  });
}
