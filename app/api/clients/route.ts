import { handle, ok, created, readJson, requireString, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import { createClient, listClients, serializeClient } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/clients */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({ clients: listClients(ctx).map(serializeClient) });
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
