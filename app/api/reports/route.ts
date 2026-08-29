import { handle, ok } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { buildReport } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/reports — 402 on free, basic on Pro, complete on Negócio. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ report: buildReport(ctx) });
  });
}
