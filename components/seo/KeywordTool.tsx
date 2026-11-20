"use client";
import { useState } from "react";
import { Copy, Info, Loader2, Sparkles } from "lucide-react";

type KW = { keyword: string; intent: string };
type Out = { primary: KW[]; secondary: KW[]; longTail: KW[]; local: KW[]; titles: string[]; metaDescriptions: string[] };

export function KeywordTool() {
  const [f, setF] = useState({ businessName: "", websiteUrl: "", category: "", location: "", seeds: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<{ source: "ai" | "pattern"; result: Out } | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true); setRes(null);
    try {
      const r = await fetch("/api/seo/keywords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Couldn't generate keywords");
      setRes(j);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); }
  }
  const input = (k: keyof typeof f, label: string, ph: string, req = true) => (
    <div><label htmlFor={`k-${k}`} className="label">{label}{req && " *"}</label><input id={`k-${k}`} required={req} className="field" placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  );
  const group = (title: string, list: KW[]) => (
    <div className="panel p-6">
      <h3 className="!text-lg">{title}</h3>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="text-slate-400"><th className="pb-2 font-medium">Keyword</th><th className="pb-2 font-medium">Search intent</th><th className="pb-2 font-medium">Volume</th></tr></thead>
        <tbody>{list.map((k, i) => <tr key={i} className="border-t border-white/[0.06]"><td className="py-2 pr-4 text-white">{k.keyword}</td><td className="py-2 pr-4 text-slate-300">{k.intent}</td><td className="py-2 text-slate-500">Unavailable</td></tr>)}</tbody>
      </table></div>
    </div>
  );

  return (
    <div>
      <form onSubmit={run} className="panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        {input("businessName", "Business name", "e.g. Sharma Dental Clinic")}
        {input("websiteUrl", "Website URL", "optional", false)}
        {input("category", "Business category", "e.g. Dental clinic")}
        {input("location", "Target location", "e.g. Noida")}
        <div className="sm:col-span-2"><label htmlFor="k-seeds" className="label">Seed keywords *</label><textarea id="k-seeds" required rows={3} className="field" placeholder="Comma separated, e.g. dentist, teeth whitening, root canal" value={f.seeds} onChange={(e) => setF({ ...f, seeds: e.target.value })} /></div>
        <button className="btn-primary sm:col-span-2 sm:w-fit" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Generating…</> : "Generate keyword ideas"}</button>
      </form>
      {err && <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}
      {res && (
        <div className="mt-10 space-y-6">
          <p className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            {res.source === "ai" ? <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet" aria-hidden /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />}
            {res.source === "ai" ? "These keyword ideas are AI-generated." : "AI is unavailable, so these ideas are pattern-based combinations of your seed keywords and location."}
            {" "}Search volume, keyword difficulty and CPC are not shown because they require a paid data provider (for example Google Ads Keyword Planner or DataForSEO). Validate ideas there before investing.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {group("Primary keywords", res.result.primary)}{group("Secondary keywords", res.result.secondary)}
            {group("Long-tail keywords", res.result.longTail)}{group("Local SEO keywords", res.result.local)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {([["Suggested page titles", res.result.titles], ["Suggested meta descriptions", res.result.metaDescriptions]] as const).map(([t, list]) => (
              <div key={t} className="panel p-6"><h3 className="!text-lg">{t}</h3>
                <ul className="mt-4 space-y-3">{list.map((s, i) => <li key={i} className="flex items-start justify-between gap-3 text-sm text-slate-200"><span>{s} <span className="text-slate-500">({s.length})</span></span><button type="button" aria-label="Copy" onClick={() => navigator.clipboard.writeText(s)} className="text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button></li>)}</ul></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
