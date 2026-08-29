import { handle, errors } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { getQuote } from "@/lib/server/store";
import { renderQuotePdf } from "@/lib/server/pdf";
import { publicQuoteUrl } from "@/lib/server/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/quotes/:id/pdf — professional PDF (available on every plan). */
export function GET(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    if (!ctx.plan.features.pdf) throw errors.planLimit("PDF indisponível no plano atual.");
    const { id } = await params;
    const quote = getQuote(ctx, id);
    const bytes = await renderQuotePdf(ctx.org, quote, {
      publicUrl: publicQuoteUrl(quote.public_id, req),
      brandingRemoved: Boolean(ctx.org.branding_removed) && ctx.plan.features.removeBranding,
    });
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="orcamento-${quote.public_id}.pdf"`,
      },
    });
  });
}
