import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeIST } from "@/lib/utils";
import { StatusBadge, STATUS_LABEL } from "@/components/admin/StatusBadge";

const PAGE = 25;

export default async function Leads({ searchParams }: { searchParams: { q?: string; status?: string; service?: string; page?: string } }) {
  const { db } = await requireAdmin();
  const page = Math.max(1, Number(searchParams.page) || 1);
  let q = db.from("enquiries").select("id, full_name, business_name, email, phone, service_name, status, created_at, admin_email_status", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  if (searchParams.status) q = q.eq("status", searchParams.status);
  if (searchParams.service) q = q.eq("service_name", searchParams.service);
  const term = (searchParams.q ?? "").replace(/[%,()]/g, " ").trim().slice(0, 60);
  if (term) q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,business_name.ilike.%${term}%,phone.ilike.%${term}%`);
  const [{ data, count }, services] = await Promise.all([q, db.from("services").select("name").order("display_order")]);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const qs = (p: number) => `?${new URLSearchParams({ ...(searchParams.q && { q: searchParams.q }), ...(searchParams.status && { status: searchParams.status }), ...(searchParams.service && { service: searchParams.service }), page: String(p) })}`;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="!text-2xl sm:!text-3xl">Leads</h1>
        <a href={`/api/admin/leads-csv${searchParams.status ? `?status=${searchParams.status}` : ""}`} className="btn-ghost !min-h-[40px] !text-sm"><Download className="h-4 w-4" />Export CSV</a></div>
      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px_220px_auto]">
        <input name="q" defaultValue={searchParams.q} placeholder="Search name, email, phone, business" className="field !py-2.5" aria-label="Search leads" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="field !py-2.5" aria-label="Status"><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="service" defaultValue={searchParams.service ?? ""} className="field !py-2.5" aria-label="Service"><option value="">All services</option>{(services.data ?? []).map((s) => <option key={s.name}>{s.name}</option>)}<option>General enquiry</option></select>
        <button className="btn-primary !min-h-[44px] !text-sm">Filter</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400"><tr><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Received</th></tr></thead>
          <tbody>{(data ?? []).map((r) => (
            <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
              <td className="px-4 py-3"><Link href={`/admin/leads/${r.id}`} className="font-semibold text-white hover:text-cyan">{r.full_name}</Link>{r.business_name && <span className="block text-xs text-slate-500">{r.business_name}</span>}</td>
              <td className="px-4 py-3 text-slate-300">{r.email}<span className="block text-xs text-slate-500">{r.phone}</span></td>
              <td className="px-4 py-3 text-slate-300">{r.service_name}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} />{r.admin_email_status === "failed" && <span className="ml-2 text-xs text-rose-300">email failed</span>}</td>
              <td className="px-4 py-3 text-slate-400">{formatDateTimeIST(r.created_at)}</td>
            </tr>))}
            {!data?.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No leads match these filters.</td></tr>}</tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{count ?? 0} lead(s)</span>
        <div className="flex gap-2">{page > 1 && <Link href={qs(page - 1)} className="btn-ghost !min-h-[36px] !px-4 !text-sm">Previous</Link>}{page < pages && <Link href={qs(page + 1)} className="btn-ghost !min-h-[36px] !px-4 !text-sm">Next</Link>}</div></div>
    </div>
  );
}
