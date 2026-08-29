import { handle, ok } from "@/lib/server/http";
import {
  PLAN_IDS,
  PLANS,
  annualMonthsFree,
  priceFor,
} from "@/lib/server/plans";

export const runtime = "nodejs";

/** GET /api/plans — public pricing table (Planos e Preços). */
export function GET() {
  return handle(() => {
    const plans = PLAN_IDS.map((id) => {
      const plan = PLANS[id];
      return {
        id: plan.id,
        name: plan.name,
        tagline: plan.tagline,
        highlight: plan.highlight,
        pricing: {
          monthly: priceFor(id, "monthly"),
          annual: plan.priceAnnual,
          annualMonthsFree: annualMonthsFree(id),
        },
        limits: plan.limits,
        features: plan.features,
      };
    });
    return ok({ plans });
  });
}
