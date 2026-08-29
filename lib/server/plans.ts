/**
 * Plan catalog — single source of truth for pricing, limits and feature gates.
 * Mirrors the public "Planos e Preços" table.
 */

export type PlanId = "free" | "pro" | "business";
export type BillingCycle = "monthly" | "annual";

export type ReportLevel = "none" | "basic" | "complete";
export type BusinessDataLevel = "basic" | "complete";
export type QuoteStatusLevel = "basic" | "complete";

export type PlanLimits = {
  /** Quotes creatable per calendar month. `null` = unlimited. */
  quotesPerMonth: number | null;
  clients: number | null;
  services: number | null;
  users: number;
  /** History/retention window in days. `null` = full history. */
  historyDays: number | null;
};

export type PlanFeatures = {
  pdf: boolean;
  whatsapp: boolean;
  logo: boolean;
  removeBranding: boolean;
  customTemplates: boolean;
  liveStatus: boolean;
  businessData: BusinessDataLevel;
  quoteStatus: QuoteStatusLevel;
  reports: ReportLevel;
  prioritySupport: boolean;
};

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number; // reais
  priceAnnual: number | null; // reais (full year)
  highlight: boolean;
  limits: PlanLimits;
  features: PlanFeatures;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Grátis",
    tagline:
      "Para conhecer o OrçaZap e começar a criar orçamentos profissionais.",
    priceMonthly: 0,
    priceAnnual: null,
    highlight: false,
    limits: {
      quotesPerMonth: 5,
      clients: 10,
      services: 10,
      users: 1,
      historyDays: 30,
    },
    features: {
      pdf: true,
      whatsapp: true,
      logo: false,
      removeBranding: false,
      customTemplates: false,
      liveStatus: false,
      businessData: "basic",
      quoteStatus: "basic",
      reports: "none",
      prioritySupport: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline:
      "Para autônomos e prestadores que fazem orçamentos todos os dias.",
    priceMonthly: 19.9,
    priceAnnual: 199,
    highlight: true,
    limits: {
      quotesPerMonth: null,
      clients: null,
      services: null,
      users: 1,
      historyDays: null,
    },
    features: {
      pdf: true,
      whatsapp: true,
      logo: true,
      removeBranding: true,
      customTemplates: true,
      liveStatus: true,
      businessData: "complete",
      quoteStatus: "complete",
      reports: "basic",
      prioritySupport: true,
    },
  },
  business: {
    id: "business",
    name: "Negócio",
    tagline: "Para pequenas equipes que atendem em conjunto.",
    priceMonthly: 39.9,
    priceAnnual: 399,
    highlight: false,
    limits: {
      quotesPerMonth: null,
      clients: null,
      services: null,
      users: 3,
      historyDays: null,
    },
    features: {
      pdf: true,
      whatsapp: true,
      logo: true,
      removeBranding: true,
      customTemplates: true,
      liveStatus: true,
      businessData: "complete",
      quoteStatus: "complete",
      reports: "complete",
      prioritySupport: true,
    },
  },
};

export const PLAN_IDS: PlanId[] = ["free", "pro", "business"];

export function isPlanId(v: unknown): v is PlanId {
  return v === "free" || v === "pro" || v === "business";
}

export function getPlan(id: string): Plan {
  return isPlanId(id) ? PLANS[id] : PLANS.free;
}

/** Charged amount (reais) for a plan on a billing cycle. */
export function priceFor(id: PlanId, cycle: BillingCycle): number {
  const plan = PLANS[id];
  if (cycle === "annual") return plan.priceAnnual ?? plan.priceMonthly * 12;
  return plan.priceMonthly;
}

/** Effective monthly cost of the annual cycle, for "2 meses grátis" copy. */
export function annualMonthsFree(id: PlanId): number {
  const plan = PLANS[id];
  if (!plan.priceAnnual || plan.priceMonthly === 0) return 0;
  const fullYear = plan.priceMonthly * 12;
  return Math.round((fullYear - plan.priceAnnual) / plan.priceMonthly);
}
