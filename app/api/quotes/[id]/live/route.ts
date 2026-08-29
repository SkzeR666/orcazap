import { handle, ok, readJson, errors } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { advanceLive, serializeQuote } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** POST /api/quotes/:id/live — set the live-tracking step (Pro/Negócio). */
export function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const body = await readJson(req);
    if (typeof body.step !== "number") throw errors.badRequest('"step" numérico é obrigatório.');
    const quote = advanceLive(ctx, id, body.step);
    return ok({ quote: serializeQuote(quote) });
  });
}
