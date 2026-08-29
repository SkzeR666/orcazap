import { errors } from "./http";

/**
 * Small in-memory sliding-window limiter for abuse-prone endpoints (login,
 * signup, password reset, invite accept). Per-process — good enough for a
 * single instance; swap for Redis when running multiple.
 */

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

export type RateRule = { limit: number; windowMs: number };

export function rateLimit(key: string, rule: RateRule): void {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  hit.count += 1;
  if (hit.count > rule.limit) {
    const retry = Math.ceil((hit.resetAt - now) / 1000);
    throw errors.tooMany(
      `Muitas tentativas. Tente novamente em ${retry}s.`,
      retry,
    );
  }
}

/** Best-effort client key from proxy headers, falling back to a constant. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

// occasional cleanup so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}, 60_000).unref?.();
