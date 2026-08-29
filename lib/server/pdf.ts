import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { fromCents } from "./util";
import { getLogo } from "./logo";
import type { OrgRow } from "./auth";
import type { QuoteRow } from "./store";
import { statusLabelOf } from "./store";

const INK = rgb(0.086, 0.106, 0.098); // #16 1b 19
const MUTED = rgb(0.42, 0.45, 0.44);
const LINE = rgb(0.88, 0.9, 0.89);
const BRAND = rgb(0.09, 0.39, 0.25); // deep green
const A4: [number, number] = [595.28, 841.89];

function brl(cents: number): string {
  return fromCents(cents).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function tryEmbedLogo(doc: PDFDocument, orgId: string) {
  const logo = getLogo(orgId);
  if (!logo) return null;
  try {
    if (logo.mime === "image/png") return await doc.embedPng(logo.data);
    if (logo.mime === "image/jpeg") return await doc.embedJpg(logo.data);
    return null; // pdf-lib can't embed svg/webp; skip gracefully
  } catch {
    return null;
  }
}

export async function renderQuotePdf(
  org: OrgRow,
  quote: QuoteRow,
  opts: { publicUrl: string; brandingRemoved: boolean },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Orçamento — ${quote.service_name}`);
  doc.setAuthor(org.name);
  doc.setProducer("OrçaZap");

  const page: PDFPage = doc.addPage(A4);
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let y = height - margin;

  const text = (
    s: string,
    x: number,
    yy: number,
    f: PDFFont,
    size: number,
    color = INK,
  ) => page.drawText(s, { x, y: yy, size, font: f, color });

  // ---- header band --------------------------------------------------------
  page.drawRectangle({ x: 0, y: height - 132, width, height: 132, color: rgb(0.965, 0.98, 0.97) });

  const logo = await tryEmbedLogo(doc, org.id);
  if (logo) {
    const dims = logo.scaleToFit(64, 64);
    page.drawImage(logo, { x: margin, y: height - 104, width: dims.width, height: dims.height });
  }
  const headX = logo ? margin + 80 : margin;
  text(org.name, headX, height - 66, bold, 20);
  const subParts = [org.city, org.whatsapp].filter(Boolean) as string[];
  if (subParts.length) text(subParts.join("  ·  "), headX, height - 86, font, 10, MUTED);
  if (org.document) text(`CNPJ/CPF: ${org.document}`, headX, height - 100, font, 9, MUTED);

  // right side: doc label
  const label = "ORÇAMENTO";
  text(label, width - margin - bold.widthOfTextAtSize(label, 12), height - 60, bold, 12, BRAND);
  const ref = `Nº ${quote.public_id}`;
  text(ref, width - margin - font.widthOfTextAtSize(ref, 10), height - 76, font, 10, MUTED);
  const dt = fmtDate(quote.created_at);
  text(dt, width - margin - font.widthOfTextAtSize(dt, 10), height - 90, font, 10, MUTED);

  y = height - 168;

  // ---- client / status ----------------------------------------------------
  text("PARA", margin, y, bold, 8, MUTED);
  text(statusLabelOf(quote.status).toUpperCase(), width - margin - bold.widthOfTextAtSize(statusLabelOf(quote.status).toUpperCase(), 8), y, bold, 8, MUTED);
  y -= 16;
  text(quote.client_name, margin, y, bold, 13);
  if (quote.client_phone) {
    const p = quote.client_phone;
    text(p, width - margin - font.widthOfTextAtSize(p, 11), y, font, 11, MUTED);
  }
  y -= 30;

  // ---- items table --------------------------------------------------------
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: LINE });
  y -= 18;
  text("DESCRIÇÃO", margin, y, bold, 8, MUTED);
  const valorHead = "VALOR";
  text(valorHead, width - margin - bold.widthOfTextAtSize(valorHead, 8), y, bold, 8, MUTED);
  y -= 20;
  text(quote.service_name, margin, y, font, 12);
  const amt = brl(quote.amount);
  text(amt, width - margin - font.widthOfTextAtSize(amt, 12), y, font, 12);
  y -= 16;

  if (quote.notes?.trim()) {
    for (const raw of wrap(quote.notes.trim(), font, 9, width - margin * 2)) {
      text(raw, margin, y, font, 9, MUTED);
      y -= 13;
    }
  }
  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: LINE });
  y -= 26;

  // ---- total --------------------------------------------------------------
  const totalLabel = "Total";
  text(totalLabel, width - margin - 200, y, font, 12, MUTED);
  const total = brl(quote.amount);
  text(total, width - margin - bold.widthOfTextAtSize(total, 18), y - 2, bold, 18, BRAND);
  y -= 40;

  text(`Validade: ${quote.valid_days} dias`, margin, y, font, 10, MUTED);
  y -= 30;

  // ---- pix / link ---------------------------------------------------------
  if (org.pix_key) {
    text("PAGAMENTO PIX", margin, y, bold, 8, MUTED);
    y -= 15;
    text(`Chave: ${org.pix_key}`, margin, y, font, 10);
    y -= 14;
    if (org.pix_holder) {
      text(`Titular: ${org.pix_holder}`, margin, y, font, 10, MUTED);
      y -= 14;
    }
    y -= 8;
  }
  text("Aprovar e pagar online:", margin, y, font, 10, MUTED);
  y -= 14;
  text(opts.publicUrl, margin, y, font, 10, BRAND);

  // ---- footer -------------------------------------------------------------
  if (!opts.brandingRemoved) {
    const foot = "Feito com OrçaZap — orce, cobre e receba pelo WhatsApp";
    text(foot, margin, margin - 8, font, 9, MUTED);
  }

  return doc.save();
}

function wrap(textStr: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = textStr.replace(/\s+/g, " ").split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}
