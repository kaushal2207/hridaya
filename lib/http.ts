import { NextResponse } from "next/server";
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (message: string, status = 400, extra: Record<string, unknown> = {}) => json({ ok: false, error: message, ...extra }, status);

/** Same-origin check for state-changing JSON endpoints (CSRF defence in depth). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === (req.headers.get("x-forwarded-host") || req.headers.get("host")); } catch { return false; }
}
