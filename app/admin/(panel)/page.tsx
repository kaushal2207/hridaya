import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeIST } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function Dashboard() {
  const { db } = await requireAdmin();
  const count = async (table: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = db.from(table).select("*", { count: "exact", head: true }); if (f) q = f(q);
    const { count: c } = await q; return c ?? 0;
  };
  const [total, fresh, pending, converted, clients, projects, failed, recent] = await Promise.all([
    count("enquiries"), count("enquiries", (q) => q.eq("status", "new")), count("enquiries", (q) => q.in("status", ["contacted", "in_progress", "proposal_sent"])),
    count("enquiries", (q) => q.eq("status", "converted")), count("clients"), count("portfolio_projects"), count("enquiries", (q) => q.eq("admin_email_status", "failed")),
    db.from("enquiries").select("id, full_name, business_name, service_name, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const cards = [["Total enquiries", total, "/admin/leads"], ["New leads", fresh, "/admin/leads?status=new"], ["Pending leads", pending, "/admin/leads?status=in_progress"], ["Converted", converted, "/admin/leads?status=converted"], ["Clients", clients, "/admin/content/clients"], ["Portfolio projects", projects, "/admin/content/portfolio"]] as const;
  return (
    <div>
      <h1 className="!text-2xl sm:!text-3xl">Dashboard</h1>
      {failed > 0 && <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{failed} lead notification email(s) failed. Open the lead and choose “Resend emails”, or check your Resend settings. The leads themselves are saved.</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(([l, v, h]) => <Link key={l} href={h} className="panel p-5 hover:border-cyan/40"><p className="text-sm text-slate-400">{l}</p><p className="mt-1 font-display text-3xl text-white">{v}</p></Link>)}
      </div>
      <div className="mt-10 flex items-center justify-between"><h2 className="!text-xl">Recent enquiries</h2><Link href="/admin/leads" className="text-sm text-cyan">View all</Link></div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Received</th></tr></thead>
          <tbody>{(recent.data ?? []).map((r) => (
            <tr key={r.id} className="border-t border-white/[0.06]"><td className="px-4 py-3"><Link href={`/admin/leads/${r.id}`} className="font-semibold text-white hover:text-cyan">{r.full_name}</Link>{r.business_name && <span className="block text-xs text-slate-500">{r.business_name}</span>}</td>
              <td className="px-4 py-3 text-slate-300">{r.service_name}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td><td className="px-4 py-3 text-slate-400">{formatDateTimeIST(r.created_at)}</td></tr>
          ))}{!recent.data?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No enquiries yet.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
