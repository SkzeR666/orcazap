import { fromCents } from "./util";

/**
 * Static Pix "BR Code" (copia-e-cola) generator following the EMV®
 * QRCPS-MPM spec used by the Brazilian Central Bank. Produces a payload the
 * client can paste into any bank app, plus the txid used to reconcile it.
 */

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^0-9A-Za-z $%*+\-./:]/g, " ")
    .trim()
    .slice(0, max);
}

export type BrCodeInput = {
  key: string;
  amountCents?: number;
  merchantName: string;
  merchantCity: string;
  txid?: string;
};

export function makeTxid(seed: string): string {
  return sanitize(seed.replace(/[^0-9A-Za-z]/g, ""), 25).toUpperCase() || "ORCAZAP";
}

export function buildBrCode(input: BrCodeInput): string {
  const merchantAccount = field(
    "26",
    field("00", "br.gov.bcb.pix") + field("01", input.key.trim()),
  );

  const txid = input.txid ? sanitize(input.txid, 25) : "***";
  const additionalData = field("62", field("05", txid));

  let payload =
    field("00", "01") + // payload format indicator
    merchantAccount +
    field("52", "0000") + // merchant category code
    field("53", "986"); // BRL

  if (input.amountCents && input.amountCents > 0) {
    payload += field("54", fromCents(input.amountCents).toFixed(2));
  }

  payload +=
    field("58", "BR") +
    field("59", sanitize(input.merchantName || "OrcaZap", 25)) +
    field("60", sanitize(input.merchantCity || "SAO PAULO", 15)) +
    additionalData;

  payload += "6304"; // CRC id + length, value computed over everything so far
  return payload + crc16(payload);
}
