import { fromCents, normalizePhone } from "./util";
import type { OrgRow } from "./auth";

export const DEFAULT_TEMPLATE = `Olá, *{cliente}*!

Orçamento: *{servico}*
Valor: *{valor}*
{obs}
_Válido por {validade}_
{link}`;

function brl(cents: number): string {
  return fromCents(cents).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export type QuoteMessageInput = {
  clientName: string;
  serviceName: string;
  amountCents: number;
  notes?: string | null;
  validDays: number;
  publicUrl: string;
};

/**
 * Renders the WhatsApp message for a quote, honoring the org's custom template
 * when present (a Pro/Negócio feature). Placeholders: {cliente} {servico}
 * {valor} {obs} {validade} {link} {empresa}.
 */
export function buildQuoteMessage(
  org: Pick<OrgRow, "name" | "message_template">,
  input: QuoteMessageInput,
): string {
  const template = org.message_template?.trim() || DEFAULT_TEMPLATE;
  const obs = input.notes?.trim()
    ? `\n> ${input.notes.trim().replace(/\n/g, "\n> ")}\n`
    : "";
  const validade = `${input.validDays} ${input.validDays === 1 ? "dia" : "dias"}`;

  return template
    .replace(/\{cliente\}/g, input.clientName)
    .replace(/\{servico\}/g, input.serviceName)
    .replace(/\{valor\}/g, brl(input.amountCents))
    .replace(/\{obs\}/g, obs)
    .replace(/\{validade\}/g, validade)
    .replace(/\{link\}/g, input.publicUrl)
    .replace(/\{empresa\}/g, org.name)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Builds a click-to-chat wa.me link with the message pre-filled. */
export function waLink(phone: string | null | undefined, message: string): string {
  const digits = normalizePhone(phone);
  const text = encodeURIComponent(message);
  return digits
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
