import { randomBytes, randomUUID } from "node:crypto";

/** Short, url-safe, sortable-ish id with a semantic prefix. */
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

/** Opaque public id used in shareable quote links (`/o/<publicId>`). */
export function newPublicId(): string {
  return randomBytes(6).toString("base64url");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export { randomUUID };

export function nowIso(): string {
  return new Date().toISOString();
}

/** ISO timestamp `days` in the past — used for history-retention windows. */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Reais (number, e.g. 19.9) -> integer cents. Accepts numbers or BR strings. */
export function toCents(value: number | string): number {
  if (typeof value === "number") return Math.round(value * 100);
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Integer cents -> reais number (e.g. 1990 -> 19.9). */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Digits-only phone, ready for wa.me links (assumes BR country code 55). */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}
