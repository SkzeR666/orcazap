import { handle, ok } from "@/lib/server/http";
import { getPublicQuote } from "@/lib/server/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ publicId: string }> };

/** GET /api/public/quotes/:publicId — client-facing quote (no auth). */
export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { publicId } = await params;
    return ok({ quote: getPublicQuote(publicId) });
  });
}
