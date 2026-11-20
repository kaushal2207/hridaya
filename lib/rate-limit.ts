import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { hasServiceRole } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";

export function clientIpHash() {
  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${process.env.IP_HASH_SALT || "hridaya"}:${ip}`).digest("hex").slice(0, 32);
}

/** Returns true when the request is allowed. Fails open only when the DB isn't configured (local dev). */
export async function rateLimit(bucket: string, windowSeconds: number, max: number, ipHash = clientIpHash()) {
  if (!hasServiceRole) return true;
  const { data, error } = await adminClient().rpc("hit_rate_limit", { p_key: `${bucket}:${ipHash}`, p_window_seconds: windowSeconds, p_max: max });
  if (error) { console.error("[rate-limit]", error); return true; }
  return data === true;
}
