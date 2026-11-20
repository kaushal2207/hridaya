import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";

export type Role = "owner" | "editor" | "viewer";

/** Returns the signed-in admin or null. RLS still applies to every query made with `db`. */
export async function getAdmin() {
  if (!hasSupabase) return null;
  const db = serverClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("admin_users").select("role, full_name").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return { db, user, role: data.role as Role, name: (data.full_name as string | null) ?? user.email ?? "Admin" };
}

export async function requireAdmin(minRole: Role = "viewer") {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  const rank: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };
  if (rank[a.role] < rank[minRole]) throw new Error("You don't have permission for this action");
  return a;
}
