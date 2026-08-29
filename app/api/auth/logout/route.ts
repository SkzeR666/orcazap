import { handle, ok } from "@/lib/server/http";
import { clearSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/logout */
export function POST() {
  return handle(async () => {
    await clearSessionCookie();
    return ok();
  });
}
