"use client";
import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";

const OK = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"];

/** Uploads straight to the public "media" bucket (editors only, enforced by storage RLS). */
export function ImageInput({ id, value, onChange, folder = "misc", disabled }: { id: string; value: string; onChange: (v: string) => void; folder?: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setErr("");
    if (!OK.includes(file.type)) return setErr("Use PNG, JPG, WebP, AVIF or SVG");
    if (file.size > 10 * 1024 * 1024) return setErr("Max 10 MB");
    setBusy(true);
    const sb = browserClient();
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    setBusy(false);
    if (error) return setErr(error.message);
    onChange(sb.storage.from("media").getPublicUrl(path).data.publicUrl);
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-16 w-24 rounded-lg bg-white/5 object-contain" />}
        <label className={`btn-ghost !min-h-[40px] cursor-pointer !text-sm ${disabled ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{value ? "Replace" : "Upload"}
          <input id={id} type="file" accept={OK.join(",")} className="sr-only" disabled={disabled} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {value && !disabled && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"><X className="h-4 w-4" />Remove</button>}
      </div>
      <input aria-label="Image URL" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder="…or paste an image URL" className="field mt-2 !py-2 text-sm" />
      {err && <p className="mt-1 text-sm text-rose-300">{err}</p>}
    </div>
  );
}
