"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { deleteResource, saveResource } from "@/app/admin/actions";
import { getResource, type AdminField } from "@/lib/admin-resources";
import { ImageInput } from "@/components/admin/ImageInput";
import { useToast } from "@/components/admin/Toast";
import { ICON_NAMES } from "@/components/site/Icon";
import { slugify } from "@/lib/utils";

type V = Record<string, unknown>;

function initialValue(f: AdminField, v: unknown) {
  if (f.type === "list") return Array.isArray(v) ? v.join("\n") : "";
  if (f.type === "tags") return Array.isArray(v) ? v.join(", ") : "";
  if (f.type === "items" || f.type === "results" || f.type === "multirelation") return Array.isArray(v) ? v : [];
  if (f.type === "boolean") return v === undefined ? ["published", "show_in_nav", "show_on_home"].includes(f.name) : Boolean(v);
  if (f.type === "date") return v ? String(v).slice(0, 10) : "";
  return v ?? (f.type === "select" ? f.options?.[0] ?? "" : "");
}

export function ResourceForm({ resourceKey, id, initial, options, readOnly, publicUrl }: {
  resourceKey: string; id: string | null; initial: V; options: Record<string, { value: string; label: string }[]>; readOnly: boolean; publicUrl: string | null;
}) {
  const r = getResource(resourceKey)!;
  const [vals, setVals] = useState<V>(() => Object.fromEntries(r.fields.map((f) => [f.name, initialValue(f, initial[f.name])])));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const toast = useToast();
  const router = useRouter();
  const groups = useMemo(() => {
    const g: Record<string, AdminField[]> = {};
    for (const f of r.fields) (g[f.group ?? "Details"] ??= []).push(f);
    return g;
  }, [r.fields]);

  const set = (name: string, v: unknown) => setVals((p) => {
    const next = { ...p, [name]: v };
    const slugF = r.fields.find((x) => x.type === "slug" && x.from === name);
    if (slugF && !slugTouched) next[slugF.name] = slugify(String(v));
    return next;
  });

  function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    start(async () => {
      const res = await saveResource(r.key, id, vals);
      if (!res.ok) { setError(res.error); toast(res.error, "error"); return; }
      toast("Saved");
      if (!id && res.id) router.replace(`/admin/content/${r.key}/${encodeURIComponent(res.id)}`);
      router.refresh();
    });
  }
  function remove() {
    if (!id || !confirm(`Delete this ${r.singular}? This can't be undone.`)) return;
    start(async () => {
      const res = await deleteResource(r.key, id);
      if (!res.ok) { toast(res.error, "error"); return; }
      toast("Deleted"); router.push(`/admin/content/${r.key}`); router.refresh();
    });
  }

  const input = (f: AdminField) => {
    const fid = `fld-${f.name}`; const v = vals[f.name];
    const common = { id: fid, disabled: readOnly, className: "field" };
    switch (f.type) {
      case "textarea": return <textarea {...common} rows={4} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "markdown": return <textarea {...common} rows={18} className="field font-mono text-sm" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={"## Heading\n\nParagraph with **bold** and [links](https://…)."} />;
      case "list": return <textarea {...common} rows={6} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "boolean": return <label className="flex items-center gap-3 text-slate-200"><input id={fid} type="checkbox" disabled={readOnly} checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} className="h-5 w-5 accent-[#4169FF]" />{f.label}</label>;
      case "number": return <input {...common} type="number" step="any" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "date": return <input {...common} type="date" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "select": return <select {...common} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
      case "icon": return <select {...common} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}><option value="">Default</option>{ICON_NAMES.map((o) => <option key={o}>{o}</option>)}</select>;
      case "relation": return <select {...common} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}><option value="">None</option>{(options[f.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case "multirelation": {
        const sel = (v as string[]) ?? [];
        return <div className="flex flex-wrap gap-2">{(options[f.name] ?? []).map((o) => { const on = sel.includes(o.value); return (
          <label key={o.value} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? "border-cyan bg-cyan/10 text-white" : "border-white/15 text-slate-300"}`}>
            <input type="checkbox" className="sr-only" disabled={readOnly} checked={on} onChange={() => set(f.name, on ? sel.filter((x) => x !== o.value) : [...sel, o.value])} />{o.label}</label>); })}</div>;
      }
      case "image": return <ImageInput id={fid} value={String(v ?? "")} onChange={(x) => set(f.name, x)} folder={f.bucketFolder} disabled={readOnly} />;
      case "items": case "results": {
        const list = (v as Record<string, string>[]) ?? [];
        const keys = f.type === "items" ? [["title", "Title"], ["description", "Description"]] : [["label", "Label"], ["value", "Value"], ["source", "Source / how verified"]];
        const upd = (i: number, k: string, x: string) => set(f.name, list.map((it, j) => (j === i ? { ...it, [k]: x } : it)));
        return (
          <div className="space-y-3">
            {list.map((it, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_auto]">
                <div className="grid gap-2">{keys.map(([k, l]) => k === "description" ? <textarea key={k} aria-label={l} rows={2} className="field !py-2 text-sm" placeholder={l} value={it[k] ?? ""} disabled={readOnly} onChange={(e) => upd(i, k, e.target.value)} /> : <input key={k} aria-label={l} className="field !py-2 text-sm" placeholder={l} value={it[k] ?? ""} disabled={readOnly} onChange={(e) => upd(i, k, e.target.value)} />)}</div>
                {!readOnly && <button type="button" aria-label="Remove item" onClick={() => set(f.name, list.filter((_, j) => j !== i))} className="self-start p-2 text-slate-400 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            {!readOnly && <button type="button" onClick={() => set(f.name, [...list, Object.fromEntries(keys.map(([k]) => [k, ""]))])} className="btn-ghost !min-h-[36px] !text-sm"><Plus className="h-4 w-4" />Add</button>}
          </div>
        );
      }
      case "slug": return <input {...common} value={String(v ?? "")} onChange={(e) => { setSlugTouched(true); set(f.name, e.target.value); }} />;
      default: return <input {...common} type={f.type === "url" ? "url" : "text"} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-8 pb-24">
      {Object.entries(groups).map(([g, fields]) => (
        <fieldset key={g} className="panel p-6">
          <legend className="px-2 font-display text-sm text-cyan">{g}</legend>
          <div className="mt-2 grid gap-5">
            {fields.map((f) => (
              <div key={f.name}>
                {f.type !== "boolean" && <label htmlFor={`fld-${f.name}`} className="label">{f.label}{f.required && " *"}</label>}
                {input(f)}
                {f.help && <p className="mt-1.5 text-xs text-slate-500">{f.help}</p>}
              </div>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
      {!readOnly && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-navy-950/95 p-3 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-2 sm:px-6">
            <div className="flex gap-2">
              <button className="btn-primary !min-h-[42px] !text-sm" disabled={pending}>{pending ? "Saving…" : id ? "Save changes" : `Create ${r.singular}`}</button>
              {publicUrl && <a href={publicUrl} target="_blank" className="btn-ghost !min-h-[42px] !text-sm"><ExternalLink className="h-4 w-4" />View</a>}
            </div>
            {id && <button type="button" onClick={remove} disabled={pending} className="text-sm text-rose-300 hover:text-rose-200">Delete</button>}
          </div>
        </div>
      )}
    </form>
  );
}
