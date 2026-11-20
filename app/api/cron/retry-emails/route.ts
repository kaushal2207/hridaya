import { json, fail } from "@/lib/http";
import { retryPendingEmails } from "@/lib/email";
import { hasServiceRole } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return fail("Unauthorized", 401);
  if (!hasServiceRole) return fail("Not configured", 503);
  return json({ ok: true, retried: await retryPendingEmails() });
}
