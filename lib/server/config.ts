/** Public base URL used to build shareable quote links. */
export function appBaseUrl(req?: Request): string {
  const env = process.env.ORCAZAP_PUBLIC_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  if (req) {
    try {
      const url = new URL(req.url);
      return `${url.protocol}//${url.host}`;
    } catch {
      // ignore
    }
  }
  return "https://orcazap.app";
}

export function publicQuoteUrl(publicId: string, req?: Request): string {
  return `${appBaseUrl(req)}/o/${publicId}`;
}
