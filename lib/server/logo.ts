import { getDb } from "./db";
import { errors } from "./http";
import { nowIso } from "./util";

/**
 * Logo bytes live in their own table (not inline on the org row) so profile
 * responses stay small and the image is served on demand as binary.
 */

const MAX_LOGO_BYTES = 512 * 1024; // 512 KB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export type LogoBytes = { mime: string; data: Uint8Array };

/** Parses a data: URL into a validated {mime, bytes} pair. */
export function parseDataUrl(dataUrl: string): LogoBytes {
  const m = /^data:([\w/+.-]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) throw errors.badRequest("Logo deve ser um data URL base64.");
  const mime = m[1].toLowerCase();
  if (!ALLOWED.has(mime)) {
    throw errors.badRequest("Formato de logo inválido (use PNG, JPEG, WEBP ou SVG).");
  }
  const data = Buffer.from(m[2], "base64");
  if (data.length === 0) throw errors.badRequest("Logo vazia.");
  if (data.length > MAX_LOGO_BYTES) {
    throw errors.badRequest("Logo acima de 512 KB.");
  }
  return { mime, data: new Uint8Array(data) };
}

export function setLogoBytes(orgId: string, logo: LogoBytes): void {
  getDb()
    .prepare(
      `INSERT INTO org_logos (org_id, mime, data, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id) DO UPDATE SET mime = excluded.mime, data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(orgId, logo.mime, logo.data, nowIso());
}

export function deleteLogo(orgId: string): void {
  getDb().prepare("DELETE FROM org_logos WHERE org_id = ?").run(orgId);
}

export function getLogo(orgId: string): LogoBytes | null {
  const row = getDb()
    .prepare("SELECT mime, data FROM org_logos WHERE org_id = ?")
    .get(orgId) as { mime: string; data: Uint8Array } | undefined;
  if (!row) return null;
  return { mime: row.mime, data: new Uint8Array(row.data) };
}

export function hasLogo(orgId: string): boolean {
  return Boolean(
    getDb().prepare("SELECT 1 FROM org_logos WHERE org_id = ?").get(orgId),
  );
}
