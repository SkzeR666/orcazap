import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Payment-provider abstraction for Pix confirmations. The default `manual`
 * provider verifies an HMAC-SHA256 signature over the raw request body (the
 * pattern every real PSP uses) and/or a shared secret header. Swap in a real
 * provider by implementing this interface and selecting it in `getProvider()`.
 */

export type PixEvent = {
  txid: string;
  status: string; // "pago" | "expirado" | ...
  eventId: string | null; // for idempotency
};

export interface PixProvider {
  readonly name: string;
  /** Returns true if the request is authentic. */
  verify(rawBody: string, headers: Headers): boolean;
  /** Extracts the normalized event from the parsed body. */
  parse(body: Record<string, unknown>): PixEvent;
}

function hmacHex(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length > 0 && ba.length === bb.length && timingSafeEqual(ba, bb);
}

const manualProvider: PixProvider = {
  name: "manual",
  verify(rawBody, headers) {
    const secret = process.env.ORCAZAP_WEBHOOK_SECRET;
    if (!secret) return true; // dev mode: no secret configured

    // Preferred: HMAC signature over the raw body.
    const sig = headers.get("x-signature") || headers.get("x-webhook-signature");
    if (sig) return safeEqualHex(sig.replace(/^sha256=/, ""), hmacHex(secret, rawBody));

    // Fallback: shared-secret header.
    return headers.get("x-webhook-secret") === secret;
  },
  parse(body) {
    const txid = typeof body.txid === "string" ? body.txid.trim() : "";
    const status = typeof body.status === "string" ? body.status : "pago";
    const eventId =
      typeof body.id === "string"
        ? body.id
        : typeof body.eventId === "string"
          ? body.eventId
          : null;
    return { txid, status, eventId };
  },
};

export function getProvider(): PixProvider {
  // Future: switch on process.env.ORCAZAP_PSP (e.g. "mercadopago", "gerencianet").
  return manualProvider;
}
