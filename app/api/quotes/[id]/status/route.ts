import { handle, ok, readJson, requireString, optionalString, errors } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  isQuoteStatus,
  serializeQuote,
  setQuoteStatus,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Maps the send/aprovar/... verbs to a target status. */
const ACTIONS: Record<string, "enviado" | "aprovado" | "recusado" | "cobrado" | "pago"> = {
  enviar: "enviado",
  send: "enviado",
  aprovar: "aprovado",
  approve: "aprovado",
  recusar: "recusado",
  refuse: "recusado",
  cobrar: "cobrado",
  charge: "cobrado",
  pagar: "pago",
  pay: "pago",
};

/** POST /api/quotes/:id/status — body: { status } or { action } (+ optional note). */
export function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const body = await readJson(req);

    let target: string | undefined;
    if (typeof body.action === "string") target = ACTIONS[body.action.toLowerCase()];
    else target = requireString(body, "status");

    if (!target || !isQuoteStatus(target)) {
      throw errors.badRequest("Status/ação inválido.");
    }
    const quote = setQuoteStatus(ctx, id, target, {
      note: optionalString(body, "note"),
      force: Boolean(body.force),
    });
    return ok({ quote: serializeQuote(quote) });
  });
}
