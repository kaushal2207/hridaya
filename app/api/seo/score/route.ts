import { z } from "zod";
import { fail, json, sameOrigin } from "@/lib/http";
import { clientIpHash, rateLimit } from "@/lib/rate-limit";
import { extract, fetchPage } from "@/lib/seo/extract";
import { scoreKeyword, type Check } from "@/lib/seo/score";
import { aiComplete, parseJson } from "@/lib/ai";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const b = z.object({ url: z.string().min(3).max(500), keyword: z.string().trim().min(2).max(80), competitor: z.string().max(500).optional() })
    .safeParse(await req.json().catch(() => null));
  if (!b.success) return fail("Enter a website address and a target keyword");
  const ipHash = clientIpHash();
  if (!(await rateLimit("seo-score", 3600, 10, ipHash))) return fail("Hourly limit reached. Please try again later.", 429);

  try {
    const mine = await extract(await fetchPage(b.data.url));
    const result = scoreKeyword(mine, b.data.keyword);
    let competitor: null | { url: string; score: number; checks: Check[]; wordCount: number; error?: string } = null;
    if (b.data.competitor?.trim()) {
      try {
        const cx = await extract(await fetchPage(b.data.competitor));
        const cr = scoreKeyword(cx, b.data.keyword);
        competitor = { url: cx.finalUrl, score: cr.score, checks: cr.checks, wordCount: cx.wordCount };
      } catch (e) { competitor = { url: b.data.competitor, score: 0, checks: [], wordCount: 0, error: e instanceof Error ? e.message : "Could not analyse competitor" }; }
    }
    const ai = await aiComplete(
      "You are an SEO consultant. Using ONLY the provided check results for a target keyword, give specific improvements. Do not invent search volumes, rankings or data. Respond with JSON only: {\"recommendations\": string[] (4-6 items), \"suggestedTitle\": string (<=60 chars), \"suggestedMetaDescription\": string (<=158 chars)}.",
      JSON.stringify({ keyword: b.data.keyword, url: mine.finalUrl, title: mine.title, meta: mine.metaDescription, h1: mine.h1, h2: mine.h2.slice(0, 8), result, competitor: competitor && { score: competitor.score, checks: competitor.checks } }),
      700);
    const aiOutput = ai ? parseJson<{ recommendations: string[]; suggestedTitle: string; suggestedMetaDescription: string }>(ai.text) : null;
    if (hasServiceRole) await adminClient().from("seo_reports").insert({ tool: "score", target_url: mine.finalUrl, keyword: b.data.keyword, input: b.data, scores: { score: result.score, competitor: competitor?.score ?? null }, issues: result.checks, ai_output: aiOutput, ai_model: ai?.model ?? null, ip_hash: ipHash });
    return json({ ok: true, url: mine.finalUrl, keyword: b.data.keyword, ...result, page: { title: mine.title, metaDescription: mine.metaDescription, h1: mine.h1, wordCount: mine.wordCount }, competitor, ai: aiOutput });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "The check failed", 422);
  }
}
