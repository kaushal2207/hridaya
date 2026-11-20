import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/admin-resources";
import { formatDate } from "@/lib/utils";

export default async function List({ params, searchParams }: { params: { resource: string }; searchParams: { q?: string } }) {
  const r = getResource(params.resource);
  if (!r) notFound();
  const { db, role } = await requireAdmin();
  const pk = r.pk ?? "id";
  let q = db.from(r.table).select("*").order(r.order.column, { ascending: r.order.ascending ?? true }).limit(500);
  const term = (searchParams.q ?? "").replace(/[%,()]/g, " ").trim().slice(0, 60);
  if (term && r.searchColumn) q = q.ilike(r.searchColumn, `%${term}%`);
  const { data } = await q;
  const rows = (data ?? []) as Record<string, unknown>[];

  // Resolve relation labels shown in the list
  const labels: Record<string, Record<string, string>> = {};
  for (const col of r.listColumns.filter((c) => c.type === "relation")) {
    const f = r.fields.find((x) => x.name === col.name)!;
    const ids = [...new Set(rows.map((x) => x[col.name]).filter(Boolean))] as string[];
    if (!ids.length) continue;
    const { data: rel } = await db.from(f.relation!.table).select(`id, ${f.relation!.label}`).in("id", ids);
    labels[col.name] = Object.fromEntries(((rel ?? []) as unknown as Record<string, string>[]).map((x) => [x.id, x[f.relation!.label]]));
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="!text-2xl sm:!text-3xl">{r.title}</h1>
        {role !== "viewer" && <Link href={`/admin/content/${r.key}/new`} className="btn-primary !min-h-[42px] !text-sm"><Plus className="h-4 w-4" />Add {r.singular}</Link>}
      </div>
      {r.note && <p className="mt-3 max-w-3xl text-sm text-slate-400">{r.note}</p>}
      {r.searchColumn && <form className="mt-5 max-w-sm"><input name="q" defaultValue={searchParams.q} placeholder={`Search ${r.title.toLowerCase()}`} className="field !py-2.5" aria-label="Search" /></form>}
      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400"><tr>{r.listColumns.map((c) => <th key={c.name} className="px-4 py-3 font-medium">{c.label}</th>)}<th className="px-4 py-3" /></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row[pk])} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                {r.listColumns.map((c, i) => {
                  const v = row[c.name];
                  let cell: React.ReactNode = String(v ?? "");
                  if (c.type === "boolean") cell = v ? <Check className="h-4 w-4 text-emerald-400" aria-label="Yes" /> : <span className="text-slate-600">–</span>;
                  if (c.type === "image") cell = v ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={String(v)} alt="" className="h-10 w-14 rounded object-contain bg-white/5" /> : null;
                  if (c.type === "relation") cell = labels[c.name]?.[String(v)] ?? "–";
                  if (c.type === "date") cell = formatDate(v as string);
                  return <td key={c.name} className="px-4 py-3 text-slate-200">{i === r.listColumns.findIndex((x) => !x.type) ? <Link href={`/admin/content/${r.key}/${encodeURIComponent(String(row[pk]))}`} className="font-semibold text-white hover:text-cyan">{cell || "(untitled)"}</Link> : cell}</td>;
                })}
                <td className="px-4 py-3 text-right">{r.publicPath && row.slug ? <a href={r.publicPath(row)!} target="_blank" className="inline-flex text-slate-400 hover:text-cyan" aria-label="View on site"><ExternalLink className="h-4 w-4" /></a> : null}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={r.listColumns.length + 1} className="px-4 py-10 text-center text-slate-500">Nothing here yet.{role !== "viewer" && <> <Link href={`/admin/content/${r.key}/new`} className="text-cyan">Add the first {r.singular}</Link>.</>}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
