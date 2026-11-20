import { requireAdmin } from "@/lib/auth";
import { TeamManager } from "@/components/admin/TeamManager";

export default async function Team() {
  const { db, role, user } = await requireAdmin();
  const { data } = await db.from("admin_users").select("id, full_name, role, created_at").order("created_at");
  return (
    <div>
      <h1 className="!text-2xl sm:!text-3xl">Team &amp; password</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">Owners manage everything including settings and team. Editors manage content and leads. Viewers can only read.</p>
      <TeamManager members={(data ?? []).map((m) => ({ id: m.id, name: m.full_name ?? "", role: m.role }))} isOwner={role === "owner"} me={user.id} />
    </div>
  );
}
