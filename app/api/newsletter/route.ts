import { z } from "zod";
import { fail, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole, SITE_URL } from "@/lib/env";
import { sendNewsletterWelcome } from "@/lib/email";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const b = z.object({ email: z.string().trim().email().max(254), hp: z.string().max(0).optional(), source_path: z.string().max(300).optional() })
    .safeParse(await req.json().catch(() => null));
  if (!b.success) return fail("Enter a valid email address");
  if (!hasServiceRole) return fail("Newsletter isn't configured yet", 503);
  if (!(await rateLimit("newsletter", 600, 5))) return fail("Too many attempts. Try again later.", 429);
  const db = adminClient();
  const { data, error } = await db.from("newsletter_subscribers")
    .upsert({ email: b.data.email, status: "subscribed", unsubscribed_at: null, source_path: b.data.source_path ?? null }, { onConflict: "email" })
    .select("unsubscribe_token").single();
  if (error || !data) return fail("Could not subscribe right now", 500);
  try { await sendNewsletterWelcome(b.data.email, data.unsubscribe_token, SITE_URL); } catch (e) { console.error("[newsletter]", e); }
  return json({ ok: true });
}
