import { NextResponse } from "next/server";

/** Domain error carrying an HTTP status and a stable machine code. */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  unauthorized: (msg = "Não autenticado.") =>
    new ApiError(401, "unauthorized", msg),
  forbidden: (msg = "Sem permissão.") => new ApiError(403, "forbidden", msg),
  notFound: (msg = "Não encontrado.") => new ApiError(404, "not_found", msg),
  badRequest: (msg = "Requisição inválida.", details?: unknown) =>
    new ApiError(400, "bad_request", msg, details),
  conflict: (msg = "Conflito.") => new ApiError(409, "conflict", msg),
  /** 402 — used when a plan limit or gated feature blocks the action. */
  planLimit: (msg: string, details?: unknown) =>
    new ApiError(402, "plan_limit", msg, details),
  tooMany: (msg = "Muitas tentativas.", retryAfter?: number) =>
    new ApiError(429, "rate_limited", msg, { retryAfter }),
};

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function ok(data: unknown = { ok: true }): NextResponse {
  return json(data, 200);
}

export function created(data: unknown): NextResponse {
  return json(data, 201);
}

/** Wrap a route handler so thrown ApiErrors become clean JSON envelopes. */
export function handle(
  fn: () => Promise<Response> | Response,
): Promise<Response> {
  return Promise.resolve()
    .then(fn)
    .catch((err: unknown) => {
      if (err instanceof ApiError) {
        return json(
          { error: { code: err.code, message: err.message, details: err.details } },
          err.status,
        );
      }
      // Unique-constraint and similar SQLite errors -> 409 with a hint.
      const message = err instanceof Error ? err.message : String(err);
      if (/UNIQUE constraint/i.test(message)) {
        return json(
          { error: { code: "conflict", message: "Registro duplicado." } },
          409,
        );
      }
      console.error("[api] unhandled error:", err);
      return json(
        { error: { code: "internal", message: "Erro interno." } },
        500,
      );
    });
}

/** Parse a JSON body, tolerating an empty body as `{}`. */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
): Promise<T> {
  try {
    const text = await req.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch {
    throw errors.badRequest("Corpo JSON inválido.");
  }
}

/** Max accepted length for a free-text field, guarding against abuse/bloat. */
const MAX_LEN = 2000;

export function requireString(
  body: Record<string, unknown>,
  key: string,
  label = key,
  max = MAX_LEN,
): string {
  const v = body[key];
  if (typeof v !== "string" || !v.trim()) {
    throw errors.badRequest(`Campo "${label}" é obrigatório.`);
  }
  if (v.length > max) throw errors.badRequest(`Campo "${label}" excede ${max} caracteres.`);
  return v.trim();
}

export function optionalString(
  body: Record<string, unknown>,
  key: string,
  max = MAX_LEN,
): string | undefined {
  const v = body[key];
  if (v == null) return undefined;
  if (typeof v !== "string") throw errors.badRequest(`Campo "${key}" inválido.`);
  if (v.length > max) throw errors.badRequest(`Campo "${key}" excede ${max} caracteres.`);
  return v.trim();
}
