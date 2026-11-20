"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getResource, type AdminField } from "@/lib/admin-resources";
import { sendLeadEmails } from "@/lib/email";
import { adminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

type Result = { ok: true; id?: string } | { ok: false; error: string };
const STATUSES = ["new", "contacted", "in_progress", "proposal_sent", "converted", "lost", "spam"];

function coerce(f: AdminField, v: unknown): unknown {
  const str = typeof v === "string" ? v.trim() : v;
  switch (f.type) {
    case "boolean": return Boolean(v);
    case "number": return str === "" || str === null || str === undefined ? null : Number(str);
    case "items": return Array.isArray(v) ? v.filter((x) => x?.title?.trim()).map((x) => ({ title: String(x.title).trim().slice(0, 200), description: String(x.description ?? "").trim().slice(0, 2000) })) : [];
    case "results": return Array.isArray(v) ? v.filter((x) => x?.label?.trim() && x?.value?.trim()).map((x) => ({ label: String(x.label).trim(), value: String(x.value).trim(), source: String(x.source ?? "").trim() })) : [];
    case "list": return typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : Array.isArray(v) ? v : [];
    case "tags": return typeof v === "string" ? v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 20) : Array.isArray(v) ? v : [];
    default: return str === "" || str === undefined ? null : str;
  }
}

function validate(f: AdminField, v: unknown): string | null {
  if (f.required && (v === null || v === "" || (Array.isArray(v) && !v.length))) return `${f.label} is required`;
  if (v === null || v === undefined) return null;
  if (f.type === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v))) return "Slug can contain only lowercase letters, numbers and hyphens";
  if ((f.type === "url" || f.type === "image") && !/^https?:\/\//i.test(String(v))) return `${f.label} must start with http:// or https://`;
  if (f.type === "number" && Number.isNaN(v)) return `${f.label} must be a number`;
  if (f.name === "rating" && v !== null && (Number(v) < 1 || Number(v) > 5)) return "Rating must be between 1 and 5";
  if (f.name === "path" && !String(v).startsWith("/")) return "Path must start with /";
  return null;
}

export async function saveResource(key: string, id: string | null, payload: Record<string, unknown>): Promise<Result> {
  try {
    const { db } = await requireAdmin("editor");
    const r = getResource(key);
    if (!r) return { ok: false, error: "Unknown module" };
    const pk = r.pk ?? "id";
    const row: Record<string, unknown> = {};
    const joins: { f: AdminField; ids: string[] }[] = [];
    for (const f of r.fields) {
      if (f.type === "multirelation") { joins.push({ f, ids: Array.isArray(payload[f.name]) ? (payload[f.name] as string[]) : [] }); continue; }
      const v = coerce(f, payload[f.name]);
      const err = validate(f, v);
      if (err) return { ok: false, error: err };
      row[f.name] = v;
    }
    if (r.table === "blog_posts" && row.published && !row.published_at) row.published_at = new Date().toISOString();

    let savedId = id;
    if (id) {
      const { error } = await db.from(r.table).update(row).eq(pk, id);
      if (error) return { ok: false, error: friendly(error.message) };
      if (pk !== "id") savedId = String(row[pk]);
    } else {
      const { data, error } = await db.from(r.table).insert(row).select(pk).single();
      if (error || !data) return { ok: false, error: friendly(error?.message ?? "Insert failed") };
      savedId = String((data as unknown as Record<string, unknown>)[pk]);
    }
    for (const { f, ids } of joins) {
      const j = f.join!;
      await db.from(j.table).delete().eq(j.self, savedId);
      if (ids.length) {
        const { error } = await db.from(j.table).insert(ids.map((o) => ({ [j.self]: savedId, [j.other]: o })));
        if (error) return { ok: false, error: friendly(error.message) };
      }
    }
    revalidatePath("/", "layout");
    return { ok: true, id: savedId ?? undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Save failed" }; }
}

function friendly(msg: string) {
  if (/duplicate key.*slug/i.test(msg)) return "That URL slug is already used. Choose a different one.";
  if (/duplicate key/i.test(msg)) return "An entry with this value already exists.";
  if (/row-level security/i.test(msg)) return "Your role doesn't allow this change.";
  return msg;
}

export async function deleteResource(key: string, id: string): Promise<Result> {
  try {
    const { db } = await requireAdmin("editor");
    const r = getResource(key);
    if (!r) return { ok: false, error: "Unknown module" };
    const { error } = await db.from(r.table).delete().eq(r.pk ?? "id", id);
    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Delete failed" }; }
}

export async function updateLeadStatus(id: string, status: string): Promise<Result> {
  const { db } = await requireAdmin("editor");
  if (!STATUSES.includes(status)) return { ok: false, error: "Invalid status" };
  const { error } = await db.from("enquiries").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads"); revalidatePath(`/admin/leads/${id}`);
  return { ok: true };
}

export async function addLeadNote(id: string, note: string): Promise<Result> {
  const { db, user } = await requireAdmin("editor");
  const n = note.trim().slice(0, 5000);
  if (!n) return { ok: false, error: "Write a note first" };
  const { error } = await db.from("enquiry_notes").insert({ enquiry_id: id, note: n, author_id: user.id });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true };
}

export async function retryLeadEmails(id: string): Promise<Result> {
  await requireAdmin("editor");
  if (!hasServiceRole) return { ok: false, error: "Service role key missing" };
  const db = adminClient();
  await db.from("enquiries").update({ admin_email_attempts: 0, customer_email_attempts: 0 }).eq("id", id).neq("admin_email_status", "sent");
  await sendLeadEmails(id);
  const { data } = await db.from("enquiries").select("admin_email_status, admin_email_last_error").eq("id", id).single();
  revalidatePath(`/admin/leads/${id}`);
  return data?.admin_email_status === "sent" ? { ok: true } : { ok: false, error: data?.admin_email_last_error || "Email still failing" };
}

export async function deleteLead(id: string): Promise<Result> {
  const { db } = await requireAdmin("owner");
  const { data: files } = await db.from("enquiry_files").select("storage_path").eq("enquiry_id", id);
  if (files?.length && hasServiceRole) await adminClient().storage.from("enquiry-uploads").remove(files.map((f) => f.storage_path));
  const { error } = await db.from("enquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function saveSettings(key: string, value: Record<string, unknown>): Promise<Result> {
  const { db } = await requireAdmin("owner");
  const allowed = ["company", "contact", "social", "branding", "notifications"];
  if (!allowed.includes(key)) return { ok: false, error: "Unknown settings group" };
  const clean = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]));
  const { error } = await db.from("site_settings").upsert({ key, value: clean, is_public: key !== "notifications" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function inviteAdmin(email: string, role: string, name: string): Promise<Result> {
  await requireAdmin("owner");
  if (!hasServiceRole) return { ok: false, error: "Service role key missing" };
  if (!["owner", "editor", "viewer"].includes(role)) return { ok: false, error: "Invalid role" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email" };
  const db = adminClient();
  const { data, error } = await db.auth.admin.inviteUserByEmail(email.trim());
  if (error || !data.user) return { ok: false, error: error?.message ?? "Invite failed" };
  const { error: e2 } = await db.from("admin_users").upsert({ id: data.user.id, role, full_name: name || null });
  if (e2) return { ok: false, error: e2.message };
  revalidatePath("/admin/team");
  return { ok: true };
}

export async function updateAdminRole(id: string, role: string): Promise<Result> {
  const { db, user } = await requireAdmin("owner");
  if (id === user.id) return { ok: false, error: "You can't change your own role" };
  if (role === "remove") { const { error } = await db.from("admin_users").delete().eq("id", id); if (error) return { ok: false, error: error.message }; }
  else { const { error } = await db.from("admin_users").update({ role }).eq("id", id); if (error) return { ok: false, error: error.message }; }
  revalidatePath("/admin/team");
  return { ok: true };
}

export async function signOut() {
  const { db } = await requireAdmin();
  await db.auth.signOut();
  redirect("/admin/login");
}
