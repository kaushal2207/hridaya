import { z } from "zod";
import { fail, json, sameOrigin } from "@/lib/http";
import { clientIpHash, rateLimit } from "@/lib/rate-limit";
import { extract, fetchPage, pageSpeed } from "@/lib/seo/extract";
import { scoreAudit } from "@/lib/seo/score";
import { aiComplete, parseJson } from "@/lib/ai";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const b = z.object({ url: z.string().min(3).max(500) }).safeParse(await req.json().catch(() => null));
  if (!b.success) return fail("Enter a website address");
  const ipHash = clientIpHash();
  if (!(await rateLimit("seo-audit", 3600, 10, ipHash))) return fail("You've reached the hourly limit for free audits. Please try again later.", 429);

  try {
    const res = await fetchPage(b.data.url);
    const [x, psi] = await Promise.all([extract(res, { checkLinks: true }), pageSpeed(res.url)]);
    const { scores, issues } = scoreAudit(x, psi);

    // AI only explains verified findings; it receives the facts and cannot change the scores.
    const ai = await aiComplete(
      "You are an SEO consultant. You receive facts extracted from a web page and a list of issues already detected by rules. Write ONLY from these facts. Never invent metrics, rankings, traffic or issues not in the data. Respond with JSON only: {\"summary\": string (2-3 sentences, plain English), \"recommendations\": string[] (5-7 specific, prioritised actions)}.",
      JSON.stringify({ url: x.finalUrl, scores, issues: issues.map((i) => `${i.priority}: ${i.title} — ${i.detail}`), title: x.title, metaDescription: x.metaDescription, h1: x.h1, h2: x.h2.slice(0, 10), wordCount: x.wordCount, structuredData: x.structuredDataTypes, pagespeed: psi }),
      900);
    const aiOutput = ai ? parseJson<{ summary: string; recommendations: string[] }>(ai.text) : null;

    const { textSample: _omit, ...extracted } = x;
    let token: string | null = null;
    if (hasServiceRole) {
      const { data } = await adminClient().from("seo_reports").insert({
        tool: "audit", target_url: x.finalUrl, input: { url: b.data.url }, extracted, scores, issues,
        ai_output: aiOutput, ai_model: ai?.model ?? null, ip_hash: ipHash,
      }).select("share_token").single();
      token = data?.share_token ?? null;
    }
    return json({ ok: true, token, url: x.finalUrl, scores, issues, extracted, pagespeed: psi, ai: aiOutput, aiAvailable: Boolean(ai) });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "The audit failed", 422);
  }
}
