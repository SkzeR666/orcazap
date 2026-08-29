import { handle, ok, readJson, optionalString } from "@/lib/server/http";
import { requireContext } from "@/lib/server/auth";
import {
  deleteClient,
  getClient,
  serializeClient,
  updateClient,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    return ok({ client: serializeClient(getClient(ctx, id)) });
  });
}

export function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    const body = await readJson(req);
    const client = updateClient(ctx, id, {
      name: optionalString(body, "name"),
      phone: optionalString(body, "phone"),
      email: optionalString(body, "email"),
      notes: optionalString(body, "notes"),
    });
    return ok({ client: serializeClient(client) });
  });
}

export function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const ctx = await requireContext();
    const { id } = await params;
    deleteClient(ctx, id);
    return ok();
  });
}
