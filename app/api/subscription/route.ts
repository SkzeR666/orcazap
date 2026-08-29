import { handle, ok, readJson, requireString, errors } from "@/lib/server/http";
import { requireAdmin, requireContext } from "@/lib/server/auth";
import { changePlan, serializeOrg } from "@/lib/server/org";
import {
  annualMonthsFree,
  getPlan,
  isPlanId,
  priceFor,
  type BillingCycle,
} from "@/lib/server/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/subscription — current plan + what a change would cost. */
export function GET() {
  return handle(async () => {
    const ctx = await requireContext();
    return ok({
      plan: ctx.org.plan,
      cycle: ctx.org.plan_cycle,
      since: ctx.org.plan_since,
      pricing: {
        monthly: priceFor(ctx.plan.id, "monthly"),
        annual: ctx.plan.priceAnnual,
        annualMonthsFree: annualMonthsFree(ctx.plan.id),
      },
    });
  });
}

/** POST /api/subscription — change plan/cycle. Body: { plan, cycle }. */
export function POST(req: Request) {
  return handle(async () => {
    const ctx = await requireContext();
    requireAdmin(ctx);
    const body = await readJson(req);
    const plan = requireString(body, "plan");
    if (!isPlanId(plan)) throw errors.badRequest("Plano inválido.");
    const cycle: BillingCycle = body.cycle === "annual" ? "annual" : "monthly";
    const org = changePlan(ctx, plan, cycle);
    const nextCtx = { ...ctx, org, plan: getPlan(org.plan) };
    return ok({
      business: serializeOrg(org, nextCtx),
      charged: priceFor(plan, cycle),
    });
  });
}
