import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/env";
import { formatDateTimeIST } from "@/lib/utils";

export default async function Seo() {
  const { db } = await requireAdmin();
  const { data: reports } = await db.from("seo_reports").select("id, tool, target_url, keyword, scores, created_at").order("created_at", { ascending: false }).limit(50);
  const ok = (k: string) => Boolean(process.env[k]);
  return (
    <div className="space-y-8">
      <h1 className="!text-2xl sm:!text-3xl">SEO</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/content/page-seo" className="panel p-6 hover:border-cyan/40"><p className="font-semibold text-white">Page titles, descriptions, OG images and canonicals</p><p className="mt-2 text-sm text-slate-400">Override metadata for any page path. Services, clients, portfolio and blog posts have their own SEO fields in their editors.</p></Link>
        <div className="panel p-6 text-sm text-slate-300">
          <p className="font-semibold text-white">Generated automatically</p>
          <ul className="mt-2 space-y-1"><li><a className="text-cyan" href={`${SITE_URL}/sitemap.xml`} target="_blank">sitemap.xml</a> (all published pages; demo entries excluded)</li><li><a className="text-cyan" href={`${SITE_URL}/robots.txt`} target="_blank">robots.txt</a> (blocks /admin and /api)</li><li>Organization, Service, FAQ, Breadcrumb and Article structured data</li></ul>
          <p className="mt-3 text-slate-400">Submit the sitemap in Google Search Console after launch.</p>
        </div>
      </div>
      <div className="panel p-6 text-sm">
        <p className="font-semibold text-white">SEO tool integrations</p>
        <ul className="mt-3 space-y-1.5 text-slate-300">
          <li>AI provider (AI_API_KEY): <strong className={ok("AI_API_KEY") ? "text-emerald-300" : "text-amber-300"}>{ok("AI_API_KEY") ? "configured" : "not set, tools use rule-based fallbacks"}</strong></li>
          <li>Google PageSpeed (PAGESPEED_API_KEY): <strong className={ok("PAGESPEED_API_KEY") ? "text-emerald-300" : "text-amber-300"}>{ok("PAGESPEED_API_KEY") ? "configured" : "not set, performance is estimated"}</strong></li>
          <li>Search volume / difficulty / CPC: <strong className="text-slate-400">not connected (needs a paid provider such as DataForSEO)</strong></li>
        </ul>
      </div>
      <div>
        <h2 className="!text-xl">Recent tool usage</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400"><tr><th className="px-4 py-3 font-medium">Tool</th><th className="px-4 py-3 font-medium">URL / keyword</th><th className="px-4 py-3 font-medium">Score</th><th className="px-4 py-3 font-medium">When</th></tr></thead>
            <tbody>{(reports ?? []).map((r) => <tr key={r.id} className="border-t border-white/[0.06]"><td className="px-4 py-3 capitalize text-white">{r.tool}</td><td className="break-all px-4 py-3 text-slate-300">{r.target_url ?? "–"}{r.keyword && <span className="block text-xs text-slate-500">{r.keyword}</span>}</td><td className="px-4 py-3 text-slate-300">{(r.scores as { overall?: number; score?: number })?.overall ?? (r.scores as { score?: number })?.score ?? "–"}</td><td className="px-4 py-3 text-slate-400">{formatDateTimeIST(r.created_at)}</td></tr>)}
              {!reports?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No tool runs yet.</td></tr>}</tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">People who audit their site are potential SEO clients. Reports expire after 30 days.</p>
      </div>
    </div>
  );
}
