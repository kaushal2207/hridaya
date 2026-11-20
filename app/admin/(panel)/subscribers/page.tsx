import { requireAdmin } from "@/lib/auth";
import { formatDateTimeIST } from "@/lib/utils";

export default async function Subscribers() {
  const { db } = await requireAdmin();
  const { data, count } = await db.from("newsletter_subscribers").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(500);
  return (
    <div>
      <h1 className="!text-2xl sm:!text-3xl">Newsletter subscribers</h1>
      <p className="mt-2 text-sm text-slate-400">{count ?? 0} total. Unsubscribed contacts are kept so they are never emailed again.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400"><tr><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Joined</th></tr></thead>
          <tbody>{(data ?? []).map((s) => <tr key={s.id} className="border-t border-white/[0.06]"><td className="px-4 py-3 text-white">{s.email}</td><td className="px-4 py-3 text-slate-300">{s.status}</td><td className="px-4 py-3 text-slate-400">{formatDateTimeIST(s.created_at)}</td></tr>)}
            {!data?.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500">No subscribers yet.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
