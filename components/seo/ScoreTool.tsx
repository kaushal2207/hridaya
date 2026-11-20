"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { ScoreGauge } from "@/components/seo/ScoreGauge";

type Check = { label: string; pass: boolean; points: number; max: number };
type Res = { url: string; keyword: string; score: number; checks: Check[]; occurrences: number; density: number;
  page: { title: string; metaDescription: string; h1: string[]; wordCount: number };
  competitor: null | { url: string; score: number; checks: Check[]; wordCount: number; error?: string };
  ai: null | { recommendations?: string[]; suggestedTitle?: string; suggestedMetaDescription?: string } };

export function ScoreTool() {
  const [f, setF] = useState({ url: "", keyword: "", competitor: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Res | null>(null);
  async function run(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true); setRes(null);
    try {
      const r = await fetch("/api/seo/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Check failed");
      setRes(j);
    } catch (e) { setErr(e instanceof Error ? e.message : "Check failed"); } finally { setLoading(false); }
  }
  return (
    <div>
      <form onSubmit={run} className="panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <div><label htmlFor="s-url" className="label">Website URL *</label><input id="s-url" required className="field" placeholder="example.com/services" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></div>
        <div><label htmlFor="s-kw" className="label">Target keyword *</label><input id="s-kw" required className="field" placeholder="e.g. website development noida" value={f.keyword} onChange={(e) => setF({ ...f, keyword: e.target.value })} /></div>
        <div className="sm:col-span-2"><label htmlFor="s-comp" className="label">Competitor page (optional)</label><input id="s-comp" className="field" placeholder="competitor.com/page" value={f.competitor} onChange={(e) => setF({ ...f, competitor: e.target.value })} /></div>
        <button className="btn-primary sm:w-fit" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Checking…</> : "Check SEO score"}</button>
      </form>
      {err && <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}
      {res && (
        <div className="mt-10 space-y-6">
          <div className={`grid gap-6 ${res.competitor ? "md:grid-cols-2" : ""}`}>
            <div className="panel p-6"><ScoreGauge value={res.score} label="Your keyword score" /><p className="mt-3 break-all text-center text-sm text-slate-400">{res.url}</p></div>
            {res.competitor && <div className="panel p-6">{res.competitor.error ? <p className="text-slate-300">Competitor couldn't be analysed: {res.competitor.error}</p> : <><ScoreGauge value={res.competitor.score} label="Competitor keyword score" /><p className="mt-3 break-all text-center text-sm text-slate-400">{res.competitor.url}</p></>}</div>}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="border-b border-white/10 text-slate-400"><th className="px-4 py-3 font-medium">Check for “{res.keyword}”</th><th className="px-4 py-3 font-medium">You</th>{res.competitor && !res.competitor.error && <th className="px-4 py-3 font-medium">Competitor</th>}</tr></thead>
              <tbody>{res.checks.map((c, i) => (
                <tr key={c.label} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 text-slate-200">{c.label}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2">{c.pass ? <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Pass" /> : <XCircle className="h-4 w-4 text-rose-400" aria-label="Fail" />}{c.points}/{c.max}</span></td>
                  {res.competitor && !res.competitor.error && <td className="px-4 py-3 text-slate-300">{res.competitor.checks[i]?.points ?? "–"}/{c.max}</td>}
                </tr>))}</tbody>
            </table>
          </div>
          <p className="text-sm text-slate-400">Keyword found {res.occurrences} time(s) in the first ~700 words ({res.density}% density). Page has {res.page.wordCount} words.</p>
          {res.ai && (
            <div className="panel p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-violet"><Sparkles className="h-4 w-4" aria-hidden />AI suggestions based on the checks above</p>
              {res.ai.suggestedTitle && <p className="mt-4 text-slate-200"><span className="text-slate-400">Suggested title: </span>{res.ai.suggestedTitle}</p>}
              {res.ai.suggestedMetaDescription && <p className="mt-2 text-slate-200"><span className="text-slate-400">Suggested meta description: </span>{res.ai.suggestedMetaDescription}</p>}
              {!!res.ai.recommendations?.length && <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-300">{res.ai.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ol>}
            </div>
          )}
          <Link href="/services/seo-services#enquire" className="btn-primary">Get expert SEO help</Link>
        </div>
      )}
    </div>
  );
}
