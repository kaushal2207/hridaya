import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeIST } from "@/lib/utils";
import { labelFor } from "@/lib/forms";
import { LeadActions } from "@/components/admin/LeadActions";
import type { FormType } from "@/lib/types";

export default async function Lead({ params }: { params: { id: string } }) {
  const { db, role } = await requireAdmin();
  const { data: e } = await db.from("enquiries").select("*").eq("id", params.id).maybeSingle();
  if (!e) notFound();
  const [{ data: files }, { data: notes }] = await Promise.all([
    db.from("enquiry_files").select("*").eq("enquiry_id", e.id),
    db.from("enquiry_notes").select("*, author:admin_users(full_name)").eq("enquiry_id", e.id).order("created_at"),
  ]);
  const row = (k: string, v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length) ? null :
    <div key={k} className="grid gap-1 border-b border-white/[0.06] py-3 sm:grid-cols-[220px_1fr]"><dt className="text-slate-400">{k}</dt><dd className="whitespace-pre-line break-words text-white">{Array.isArray(v) ? v.join(", ") : String(v)}</dd></div>;
  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-cyan">← All leads</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="!text-2xl sm:!text-3xl">{e.full_name}</h1><p className="mt-1 text-slate-400">{e.service_name}, received {formatDateTimeIST(e.created_at)}</p></div>
        <div className="flex gap-2"><a href={`mailto:${e.email}`} className="btn-ghost !min-h-[40px] !text-sm">Email</a><a href={`tel:${e.phone}`} className="btn-ghost !min-h-[40px] !text-sm">Call</a>
          <a href={`https://wa.me/${String(e.phone).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn-ghost !min-h-[40px] !text-sm">WhatsApp</a></div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel p-6">
          <dl>
            {row("Email", e.email)}{row("Phone", e.phone)}{row("Business", e.business_name)}{row("City", e.city)}{row("Website", e.website_url)}
            {row("Budget", e.budget_range)}{row("Expected start", e.expected_start_date)}{row("Project description", e.project_description)}
            {Object.entries(e.answers ?? {}).map(([k, v]) => row(labelFor(e.form_type as FormType, k), v))}
            {row("Additional requirements", e.additional_requirements)}{row("Submitted from", e.source_path)}
          </dl>
          {!!files?.length && <div className="mt-6"><p className="font-semibold text-white">Uploaded files</p><ul className="mt-3 space-y-2">{files.map((f) => <li key={f.id}><a href={`/api/admin/file?id=${f.id}`} className="text-cyan underline">{f.original_name}</a> <span className="text-xs text-slate-500">({labelFor(e.form_type as FormType, f.field_name)}, {(f.size_bytes / 1024).toFixed(0)} KB)</span></li>)}</ul></div>}
        </div>
        <LeadActions id={e.id} status={e.status} canDelete={role === "owner"} canEdit={role !== "viewer"}
          email={{ admin: e.admin_email_status, customer: e.customer_email_status, error: e.admin_email_last_error }}
          notes={(notes ?? []).map((n) => ({ id: n.id, note: n.note, at: formatDateTimeIST(n.created_at), by: (n.author as { full_name?: string } | null)?.full_name ?? "Admin" }))} />
      </div>
    </div>
  );
}
