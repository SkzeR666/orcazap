import { handle, ok, created, readJson, requireString, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { createClient, listClients, parsePage, serializeClient } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/clients?limit=&offset= */
export function GET(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const page = parsePage(req);
    const { rows, total } = listClients(ctx, page);
    return ok({ clients: rows.map(serializeClient), meta: { total, ...page } });
  });
}

/** POST /api/clients — enforces the free-plan cap of 10 clients. */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    const body = await readJson(req);
    const client = createClient(ctx, {
      name: requireString(body, "name", "nome"),
      phone: optionalString(body, "phone"),
      email: optionalString(body, "email"),
      notes: optionalString(body, "notes"),
    });
    return created({ client: serializeClient(client) });
  });
}
