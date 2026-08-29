import { handle, ok, readJson, errors } from "@/lib/server/http";
import { applyPublicAction, type PublicAction } from "@/lib/server/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ publicId: string }> };

const VALID: PublicAction[] = ["approve", "refuse", "pay", "confirm"];

/** POST /api/public/quotes/:publicId/action — body: { action }. No auth. */
export function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { publicId } = await params;
    const body = await readJson(req);
    const action = String(body.action ?? "") as PublicAction;
    if (!VALID.includes(action)) throw errors.badRequest("Ação inválida.");
    return ok({ quote: applyPublicAction(publicId, action) });
  });
}
