"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteAdmin, updateAdminRole } from "@/app/admin/actions";
import { useToast } from "@/components/admin/Toast";
import { browserClient } from "@/lib/supabase/browser";

export function TeamManager({ members, isOwner, me }: { members: { id: string; name: string; role: string }[]; isOwner: boolean; me: string }) {
  const [inv, setInv] = useState({ email: "", name: "", role: "editor" });
  const [pw, setPw] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="mt-6 space-y-6">
      <div className="panel overflow-x-auto p-2">
        <table className="w-full min-w-[480px] text-left text-sm"><tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-white/[0.06] last:border-0">
              <td className="px-4 py-3 text-white">{m.name || "Unnamed"}{m.id === me && <span className="ml-2 text-xs text-slate-500">(you)</span>}</td>
              <td className="px-4 py-3">{isOwner && m.id !== me ? (
                <select aria-label="Role" className="field !py-1.5 text-sm" defaultValue={m.role} disabled={pending}
                  onChange={(e) => { const v = e.target.value; if (v === "remove" && !confirm("Remove this admin?")) return; start(async () => { const r = await updateAdminRole(m.id, v); toast(r.ok ? "Updated" : r.error, r.ok ? "ok" : "error"); router.refresh(); }); }}>
                  <option value="owner">Owner</option><option value="editor">Editor</option><option value="viewer">Viewer</option><option value="remove">Remove access</option>
                </select>) : <span className="capitalize text-slate-300">{m.role}</span>}</td>
            </tr>))}
        </tbody></table>
      </div>
      {isOwner && (
        <form className="panel grid gap-4 p-6 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await inviteAdmin(inv.email, inv.role, inv.name); toast(r.ok ? "Invitation sent" : r.error, r.ok ? "ok" : "error"); if (r.ok) { setInv({ email: "", name: "", role: "editor" }); router.refresh(); } }); }}>
          <div><label htmlFor="iv-e" className="label">Invite by email</label><input id="iv-e" type="email" required className="field" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></div>
          <div><label htmlFor="iv-n" className="label">Name</label><input id="iv-n" className="field" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} /></div>
          <div><label htmlFor="iv-r" className="label">Role</label><select id="iv-r" className="field" value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })}><option value="editor">Editor</option><option value="viewer">Viewer</option><option value="owner">Owner</option></select></div>
          <button className="btn-primary !min-h-[48px] !text-sm" disabled={pending}>Send invite</button>
        </form>
      )}
      <form className="panel max-w-md space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); if (pw.length < 10) { toast("Use at least 10 characters", "error"); return; }
        const { error } = await browserClient().auth.updateUser({ password: pw }); toast(error ? error.message : "Password updated", error ? "error" : "ok"); if (!error) setPw(""); }}>
        <h2 className="!text-lg">Change your password</h2>
        <div><label htmlFor="npw" className="label">New password</label><input id="npw" type="password" autoComplete="new-password" minLength={10} className="field" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <button className="btn-primary !min-h-[40px] !text-sm">Update password</button>
      </form>
    </div>
  );
}
