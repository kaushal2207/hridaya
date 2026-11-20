import { z } from "zod";
import { fail, json, sameOrigin } from "@/lib/http";
import { clientIpHash, rateLimit } from "@/lib/rate-limit";
import { aiComplete, parseJson } from "@/lib/ai";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

export const maxDuration = 60;

const input = z.object({
  businessName: z.string().trim().min(2).max(120), websiteUrl: z.string().max(300).optional(),
  category: z.string().trim().min(2).max(120), location: z.string().trim().min(2).max(120),
  seeds: z.string().trim().min(2).max(500),
});

type KW = { keyword: string; intent: "Informational" | "Commercial" | "Transactional" | "Navigational" };
type Out = { primary: KW[]; secondary: KW[]; longTail: KW[]; local: KW[]; titles: string[]; metaDescriptions: string[] };

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Pattern-based fallback so the tool works without an AI key. The UI labels it as such. */
function patternKeywords(i: z.infer<typeof input>): Out {
  const seeds = i.seeds.split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 5);
  const loc = i.location.toLowerCase();
  const k = (keyword: string, intent: KW["intent"]): KW => ({ keyword, intent });
  return {
    primary: seeds.map((s) => k(s, "Commercial")),
    secondary: seeds.flatMap((s) => [k(`best ${s}`, "Commercial"), k(`${s} services`, "Commercial"), k(`${s} company`, "Commercial")]),
    longTail: seeds.flatMap((s) => [k(`how to choose ${s}`, "Informational"), k(`${s} cost in ${loc}`, "Commercial"), k(`affordable ${s} for small business`, "Transactional")]),
    local: seeds.flatMap((s) => [k(`${s} in ${loc}`, "Transactional"), k(`${s} near me`, "Transactional")]),
    titles: seeds.slice(0, 3).map((s) => `${cap(s)} in ${i.location} | ${i.businessName}`.slice(0, 60)),
    metaDescriptions: seeds.slice(0, 3).map((s) => `Looking for ${s} in ${i.location}? ${i.businessName} offers reliable ${i.category.toLowerCase()} solutions. Contact us for a free consultation.`.slice(0, 158)),
  };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const b = input.safeParse(await req.json().catch(() => null));
  if (!b.success) return fail("Fill in business name, category, location and at least one seed keyword");
  const ipHash = clientIpHash();
  if (!(await rateLimit("seo-keywords", 3600, 10, ipHash))) return fail("Hourly limit reached. Please try again later.", 429);

  const ai = await aiComplete(
    "You are an SEO strategist for Indian businesses. Generate keyword IDEAS only. You do NOT have search volume, difficulty or CPC data and must never state or imply numbers for them. Respond with JSON only matching: {\"primary\":[{\"keyword\":string,\"intent\":\"Informational\"|\"Commercial\"|\"Transactional\"|\"Navigational\"}] (5), \"secondary\":[same] (8), \"longTail\":[same] (10), \"local\":[same] (8, include the location), \"titles\":string[] (5, <=60 chars), \"metaDescriptions\":string[] (5, <=158 chars)}.",
    JSON.stringify(b.data), 1800);
  const parsed = ai ? parseJson<Out>(ai.text) : null;
  const ok = parsed && Array.isArray(parsed.primary);
  const result = ok ? parsed : patternKeywords(b.data);
  if (hasServiceRole) await adminClient().from("seo_reports").insert({ tool: "keywords", target_url: b.data.websiteUrl || null, input: b.data, ai_output: result, ai_model: ai?.model ?? null, ip_hash: ipHash });
  return json({ ok: true, source: ok ? "ai" : "pattern", result });
}
