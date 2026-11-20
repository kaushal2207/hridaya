"use client";
import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { useToast } from "@/components/admin/Toast";

type F = { name: string; label: string; kind: "text" | "textarea" | "list" };

export function SettingsForm({ group, title, fields, initial, readOnly }: { group: string; title: string; fields: F[]; initial: Record<string, unknown>; readOnly: boolean }) {
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.name, Array.isArray(initial[f.name]) ? (initial[f.name] as string[]).join(", ") : String(initial[f.name] ?? "")])));
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form className="panel p-6" onSubmit={(e) => { e.preventDefault(); start(async () => {
      const payload = Object.fromEntries(fields.map((f) => [f.name, f.kind === "list" ? v[f.name].split(",").map((s) => s.trim()).filter(Boolean) : v[f.name]]));
      const r = await saveSettings(group, payload); toast(r.ok ? `${title} saved` : r.error, r.ok ? "ok" : "error");
    }); }}>
      <h2 className="!text-lg">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.kind === "textarea" ? "sm:col-span-2" : ""}>
            <label htmlFor={`${group}-${f.name}`} className="label">{f.label}</label>
            {f.kind === "textarea" ? <textarea id={`${group}-${f.name}`} rows={3} className="field" disabled={readOnly} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
              : <input id={`${group}-${f.name}`} className="field" disabled={readOnly} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />}
          </div>
        ))}
      </div>
      {!readOnly && <button className="btn-primary mt-5 !min-h-[40px] !text-sm" disabled={pending}>{pending ? "Saving…" : "Save"}</button>}
    </form>
  );
}
