"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addLeadNote, deleteLead, retryLeadEmails, updateLeadStatus } from "@/app/admin/actions";
import { STATUS_LABEL } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";

export function LeadActions({ id, status, notes, email, canDelete, canEdit }: {
  id: string; status: string; canDelete: boolean; canEdit: boolean;
  notes: { id: string; note: string; at: string; by: string }[]; email: { admin: string; customer: string; error: string | null };
}) {
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, after?: () => void) =>
    start(async () => { const r = await fn(); if (r.ok) { toast(ok); after?.(); router.refresh(); } else toast(r.error ?? "Failed", "error"); });
  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <label htmlFor="st" className="label">Lead status</label>
        <select id="st" disabled={!canEdit || pending} defaultValue={status} onChange={(e) => run(() => updateLeadStatus(id, e.target.value), "Status updated")} className="field">
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="panel p-5 text-sm">
        <p className="font-semibold text-white">Email notifications</p>
        <p className="mt-2 text-slate-300">To you: <strong className={email.admin === "sent" ? "text-emerald-300" : "text-rose-300"}>{email.admin}</strong></p>
        <p className="text-slate-300">To customer: <strong className={email.customer === "sent" ? "text-emerald-300" : "text-amber-300"}>{email.customer}</strong></p>
        {email.error && email.admin !== "sent" && <p className="mt-2 break-words text-xs text-rose-300">{email.error}</p>}
        {canEdit && (email.admin !== "sent" || email.customer !== "sent") && <button type="button" disabled={pending} onClick={() => run(() => retryLeadEmails(id), "Emails sent")} className="btn-ghost mt-3 !min-h-[38px] !text-sm">Resend emails</button>}
      </div>
      <div className="panel p-5">
        <p className="font-semibold text-white">Internal notes</p>
        <ul className="mt-3 space-y-3">{notes.map((n) => <li key={n.id} className="rounded-lg bg-white/[0.04] p-3 text-sm"><p className="whitespace-pre-line text-slate-200">{n.note}</p><p className="mt-1 text-xs text-slate-500">{n.by}, {n.at}</p></li>)}</ul>
        {!notes.length && <p className="mt-2 text-sm text-slate-500">No notes yet.</p>}
        {canEdit && <form className="mt-4" onSubmit={(e) => { e.preventDefault(); run(() => addLeadNote(id, note), "Note added", () => setNote("")); }}>
          <label htmlFor="nt" className="sr-only">New note</label>
          <textarea id="nt" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field" placeholder="Called, sent proposal…" />
          <button className="btn-primary mt-2 !min-h-[38px] !text-sm" disabled={pending || !note.trim()}>Add note</button>
        </form>}
      </div>
      {canDelete && <button type="button" disabled={pending} onClick={() => { if (confirm("Delete this lead and its files permanently?")) run(() => deleteLead(id), "Lead deleted", () => router.push("/admin/leads")); }} className="text-sm text-rose-300 hover:text-rose-200">Delete lead</button>}
    </div>
  );
}
