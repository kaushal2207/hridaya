"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Info, Loader2, Sparkles } from "lucide-react";
import { Bar, ScoreGauge } from "@/components/seo/ScoreGauge";
import { cn } from "@/lib/utils";

type Issue = { category: string; priority: "High" | "Medium" | "Low"; title: string; detail: string; fix: string };
type Result = {
  token: string | null; url: string; scores: { overall: number; technical: number; onpage: number; content: number; performance: number; performanceSource: string };
  issues: Issue[]; ai: { summary?: string; recommendations?: string[] } | null; aiAvailable: boolean;
  pagespeed: { score: number; lcp?: string; cls?: string; tbt?: string; fcp?: string } | null;
  extracted: { title: string; titleLength: number; metaDescription: string; metaDescriptionLength: number; h1: string[]; h2: string[]; canonical: string | null; robotsMeta: string | null; https: boolean; viewport: string | null;
    structuredDataTypes: string[]; og: Record<string, string>; images: { total: number; missingAlt: number; legacyFormat: number; lazy: number }; links: { internal: number; external: number; nofollow: number };
    brokenLinks: { url: string; status: number | string }[]; brokenChecked: number; wordCount: number; responseMs: number; htmlBytes: number; robotsTxt: boolean | null; sitemap: boolean | null; redirects: string[] };
};

const P_STYLE = { High: "border-rose-400/40 bg-rose-500/10 text-rose-200", Medium: "border-amber-400/40 bg-amber-400/10 text-amber-200", Low: "border-sky-400/30 bg-sky-400/10 text-sky-200" };

export function AuditTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

  async function run(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setRes(null); setLoading(true);
    try {
      const r = await fetch("/api/seo/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "The audit failed");
      setRes(j);
    } catch (e) { setErr(e instanceof Error ? e.message : "The audit failed"); } finally { setLoading(false); }
  }

  const x = res?.extracted;
  const facts: [string, React.ReactNode, boolean | null][] = x ? [
    ["Page title", x.title ? `${x.title} (${x.titleLength} chars)` : "Missing", !!x.title && x.titleLength >= 30 && x.titleLength <= 60],
    ["Meta description", x.metaDescription ? `${x.metaDescription.slice(0, 160)} (${x.metaDescriptionLength} chars)` : "Missing", !!x.metaDescription],
    ["H1 headings", x.h1.length ? x.h1.join(" | ") : "None", x.h1.length === 1],
    ["H2 headings", `${x.h2.length} found`, x.h2.length >= 2],
    ["Canonical URL", x.canonical ?? "Not set", !!x.canonical],
    ["Robots meta", x.robotsMeta ?? "Not set (indexable by default)", !/noindex/i.test(x.robotsMeta ?? "")],
    ["HTTPS", x.https ? "Yes" : "No", x.https],
    ["Mobile viewport", x.viewport ?? "Missing", !!x.viewport],
    ["Structured data", x.structuredDataTypes.length ? x.structuredDataTypes.join(", ") : "None found", x.structuredDataTypes.length > 0],
    ["Open Graph", Object.keys(x.og).length ? Object.keys(x.og).map((k) => `og:${k}`).join(", ") : "None", !!x.og.title && !!x.og.image],
    ["Images", `${x.images.total} total, ${x.images.missingAlt} missing alt, ${x.images.legacyFormat} JPG/PNG/GIF, ${x.images.lazy} lazy-loaded`, x.images.missingAlt === 0],
    ["Links", `${x.links.internal} internal, ${x.links.external} external, ${x.links.nofollow} nofollow`, x.links.internal >= 5],
    ["Broken internal links", x.brokenChecked ? `${x.brokenLinks.length} of ${x.brokenChecked} checked` : "Not checked", x.brokenLinks.length === 0],
    ["Word count", x.wordCount, x.wordCount >= 300],
    ["Server response", `${(x.responseMs / 1000).toFixed(2)}s, HTML ${(x.htmlBytes / 1024).toFixed(0)} KB`, x.responseMs < 1500],
    ["robots.txt / sitemap.xml", `${x.robotsTxt ? "found" : "not found"} / ${x.sitemap ? "found" : "not found"}`, !!x.robotsTxt && !!x.sitemap],
  ] : [];
  const issues = res?.issues.filter((i) => filter === "All" || i.priority === filter) ?? [];

  return (
    <div>
      <form onSubmit={run} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
        <label htmlFor="audit-url" className="sr-only">Website URL</label>
        <input id="audit-url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" inputMode="url" className="field !py-3.5 text-base" />
        <button className="btn-primary shrink-0" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Auditing…</> : "Run free audit"}</button>
      </form>
      {loading && <p className="mt-4 text-sm text-slate-400" role="status">Fetching the page, checking links, robots.txt and sitemap. This usually takes 10–30 seconds.</p>}
      {err && <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}

      {res && x && (
        <div className="mt-10 space-y-8">
          <div className="panel grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <ScoreGauge value={res.scores.overall} />
            <div className="space-y-5">
              <p className="break-all text-sm text-slate-400">Audited: <span className="text-white">{res.url}</span></p>
              <Bar label="Technical SEO" value={res.scores.technical} />
              <Bar label="On-page SEO" value={res.scores.onpage} />
              <Bar label="Content" value={res.scores.content} />
              <Bar label="Performance" value={res.scores.performance} note={res.scores.performanceSource === "pagespeed" ? "Google PageSpeed (mobile)" : "estimated from server response"} />
              <div className="flex flex-wrap gap-3 pt-2">
                {res.token ? <a href={`/api/seo/pdf?token=${res.token}`} className="btn-ghost !min-h-[42px] !text-sm"><Download className="h-4 w-4" aria-hidden />Download PDF report</a>
                  : <button type="button" onClick={() => window.print()} className="btn-ghost !min-h-[42px] !text-sm"><Download className="h-4 w-4" aria-hidden />Print / save as PDF</button>}
                <Link href="/services/seo-services#enquire" className="btn-primary !min-h-[42px] !text-sm">Get help fixing these</Link>
              </div>
            </div>
          </div>

          {res.pagespeed && (
            <div className="panel grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
              {([["LCP", res.pagespeed.lcp], ["FCP", res.pagespeed.fcp], ["TBT", res.pagespeed.tbt], ["CLS", res.pagespeed.cls]] as const).map(([k, v]) => <div key={k}><p className="text-sm text-slate-400">{k}</p><p className="font-display text-xl text-white">{v ?? "–"}</p></div>)}
            </div>
          )}

          {res.ai?.summary && (
            <div className="panel p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-violet"><Sparkles className="h-4 w-4" aria-hidden />AI summary, written from the audit data above</p>
              <p className="mt-3 text-lg text-slate-200">{res.ai.summary}</p>
              {!!res.ai.recommendations?.length && <ol className="mt-5 list-decimal space-y-2 pl-5 text-slate-300">{res.ai.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ol>}
            </div>
          )}
          {!res.aiAvailable && <p className="flex gap-2 text-sm text-slate-400"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />AI recommendations are unavailable right now. All scores and issues below come from rule-based checks of your page.</p>}

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl">Issues ({res.issues.length})</h3>
              <div className="flex gap-2" role="tablist" aria-label="Filter by priority">
                {(["All", "High", "Medium", "Low"] as const).map((p) => <button key={p} type="button" role="tab" aria-selected={filter === p} onClick={() => setFilter(p)} className={cn("rounded-full border px-3 py-1.5 text-sm", filter === p ? "border-transparent bg-white text-navy-950" : "border-white/15 text-slate-300")}>{p}</button>)}
              </div>
            </div>
            {issues.length ? (
              <ul className="space-y-3">
                {issues.map((i, k) => (
                  <li key={k} className="panel p-5">
                    <div className="flex flex-wrap items-center gap-2"><span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", P_STYLE[i.priority])}>{i.priority}</span><span className="text-xs text-slate-400">{i.category}</span></div>
                    <p className="mt-2 font-semibold text-white">{i.title}</p>
                    {i.detail && <p className="mt-1 break-words text-sm text-slate-400">{i.detail}</p>}
                    <p className="mt-2 text-sm text-slate-200"><span className="font-semibold text-cyan">Fix: </span>{i.fix}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400">No issues at this priority.</p>}
          </div>

          <div>
            <h3 className="mb-5 text-2xl">What we found on the page</h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[600px] text-left text-sm">
                <tbody>
                  {facts.map(([k, v, ok]) => (
                    <tr key={k} className="border-b border-white/[0.06] last:border-0">
                      <th scope="row" className="w-52 px-4 py-3 font-medium text-slate-300">{k}</th>
                      <td className="break-all px-4 py-3 text-slate-200">{v}</td>
                      <td className="w-10 px-4 py-3">{ok === null ? null : ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="Pass" /> : <AlertTriangle className="h-5 w-5 text-amber-400" aria-label="Needs attention" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
