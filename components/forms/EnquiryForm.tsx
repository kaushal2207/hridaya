"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import { fieldsFor, type FieldDef } from "@/lib/forms";
import type { FormType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { browserClient } from "@/lib/supabase/browser";

type Values = Record<string, string | string[] | boolean>;
const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = /\.(pdf|png|jpe?g|webp|zip|docx?)$/i;

function clientValidate(f: FieldDef, v: unknown): string | null {
  const empty = v === undefined || v === "" || (Array.isArray(v) && !v.length);
  if (f.required && empty) return `${f.label} is required`;
  if (empty) return null;
  const s = String(v);
  if (f.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Enter a valid email address";
  if (f.kind === "tel" && !/^\+?[0-9 ()-]{7,20}$/.test(s)) return "Enter a valid phone number";
  if (f.kind === "url" && !/^(https?:\/\/)?[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(s)) return "Enter a valid URL";
  if (f.name === "full_name" && s.trim().length < 2) return "Enter your full name";
  if (f.name === "project_description" && s.trim().length < 10) return "Tell us a little more (at least 10 characters)";
  return null;
}

export function EnquiryForm({ formType, serviceSlug, serviceName, services, title = "Tell us about your project" }: {
  formType: FormType; serviceSlug?: string; serviceName?: string; services?: { slug: string; name: string }[]; title?: string;
}) {
  const fields = useMemo(() => fieldsFor(formType), [formType]);
  const [values, setValues] = useState<Values>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [chosenService, setChosenService] = useState(serviceSlug ?? "");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "sending" | "done" | "error">("idle");
  const [formError, setFormError] = useState("");
  const started = useRef(Date.now());
  const path = usePathname();

  const set = (name: string, v: string | string[]) => {
    setValues((p) => ({ ...p, [name]: v }));
    if (touched[name]) { const f = fields.find((x) => x.name === name)!; setErrors((e) => ({ ...e, [name]: clientValidate(f, v) ?? "" })); }
  };
  const blur = (f: FieldDef) => { setTouched((t) => ({ ...t, [f.name]: true })); setErrors((e) => ({ ...e, [f.name]: clientValidate(f, values[f.name]) ?? "" })); };

  async function uploadAll() {
    const out: { field: string; path: string; name: string; mime: string; size: number }[] = [];
    const entries = Object.entries(files).filter(([, f]) => f) as [string, File][];
    if (!entries.length) return out;
    const sb = browserClient();
    for (const [field, file] of entries) {
      const r = await fetch("/api/enquiries/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, mime: file.type, size: file.size }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || `Couldn't upload ${file.name}`);
      const { error } = await sb.storage.from("enquiry-uploads").uploadToSignedUrl(j.path, j.token, file, { contentType: file.type });
      if (error) throw new Error(`Couldn't upload ${file.name}`);
      out.push({ field, path: j.path, name: file.name, mime: file.type, size: file.size });
    }
    return out;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs: Record<string, string> = {};
    for (const f of fields) if (f.kind !== "file") { const m = clientValidate(f, values[f.name]); if (m) errs[f.name] = m; }
    if (services && !chosenService) errs.service = "Choose a service";
    if (!consent) errs.consent = "Please accept the privacy policy";
    setErrors(errs);
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }

    try {
      setStatus("uploading");
      const uploaded = await uploadAll();
      setStatus("sending");
      const top = new Set(["full_name", "business_name", "email", "phone", "city", "website_url", "project_description", "budget_range", "expected_start_date", "additional_requirements"]);
      const answers: Values = {};
      for (const f of fields) if (!top.has(f.name) && f.kind !== "file" && values[f.name] !== undefined) answers[f.name] = values[f.name];
      const payload: Record<string, unknown> = {
        form_type: formType, service_slug: chosenService || undefined,
        service_name: serviceName ?? services?.find((s) => s.slug === chosenService)?.name ?? "General enquiry",
        ...Object.fromEntries([...top].map((k) => [k, values[k] ?? ""])), answers, files: uploaded,
        consent, hp, started_at: started.current, source_path: path,
      };
      const r = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        if (j.fieldErrors) setErrors(j.fieldErrors);
        throw new Error(j.error || "Something went wrong. Please try again.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") return (
    <div className="panel p-8 text-center sm:p-12" role="status">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" aria-hidden />
      <h3 className="mt-5 text-2xl">Enquiry sent</h3>
      <p className="mx-auto mt-3 max-w-md text-slate-300">Thank you. We've emailed you a confirmation and our team will reply, usually within one working day.</p>
      <Link href="/services" className="btn-ghost mt-6">Explore more services</Link>
    </div>
  );

  const busy = status === "uploading" || status === "sending";
  const err = (n: string) => (touched[n] || errors[n]) && errors[n] ? <p id={`e-${n}`} className="mt-1.5 text-sm text-rose-300">{errors[n]}</p> : null;
  const aria = (n: string) => ({ id: `f-${n}`, "aria-invalid": Boolean(errors[n]) || undefined, "aria-describedby": errors[n] ? `e-${n}` : undefined });

  return (
    <form onSubmit={submit} noValidate className="panel p-6 sm:p-10" aria-busy={busy}>
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">Fields marked * are required. We reply within one working day.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {services && (
          <div className="sm:col-span-2">
            <label htmlFor="f-service" className="label">Service required *</label>
            <select id="f-service" className="field" value={chosenService} onChange={(e) => setChosenService(e.target.value)} aria-invalid={Boolean(errors.service) || undefined}>
              <option value="">Choose a service</option>
              {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              <option value="other">Something else</option>
            </select>
            {errors.service && <p className="mt-1.5 text-sm text-rose-300">{errors.service}</p>}
          </div>
        )}
        {fields.map((f) => {
          const v = values[f.name];
          const label = <label htmlFor={`f-${f.name}`} className="label">{f.label}{f.required && " *"}</label>;
          const cls = cn(f.half ? "" : "sm:col-span-2");
          if (f.kind === "textarea") return <div key={f.name} className={cls}>{label}<textarea {...aria(f.name)} rows={4} className="field resize-y" placeholder={f.placeholder} value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} onBlur={() => blur(f)} maxLength={3000} />{err(f.name)}</div>;
          if (f.kind === "select") return <div key={f.name} className={cls}>{label}<select {...aria(f.name)} className="field" value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} onBlur={() => blur(f)}><option value="">Select</option>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>{err(f.name)}</div>;
          if (f.kind === "yesno") return (
            <fieldset key={f.name} className={cls}><legend className="label">{f.label}</legend>
              <div className="flex gap-2">{["Yes", "No"].map((o) => (
                <label key={o} className={cn("flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition", v === o ? "border-cyan bg-cyan/10 text-white" : "border-white/12 text-slate-300 hover:border-white/30")}>
                  <input type="radio" name={f.name} value={o} checked={v === o} onChange={() => set(f.name, o)} className="sr-only" />{o}
                </label>))}</div>
            </fieldset>);
          if (f.kind === "multi") return (
            <fieldset key={f.name} className={cls} id={`f-${f.name}`} tabIndex={-1}><legend className="label">{f.label}{f.required && " *"}</legend>
              <div className="flex flex-wrap gap-2">{f.options!.map((o) => {
                const arr = (v as string[]) ?? []; const on = arr.includes(o);
                return (
                  <label key={o} className={cn("cursor-pointer rounded-full border px-3.5 py-2 text-sm transition", on ? "border-cyan bg-cyan/10 text-white" : "border-white/12 text-slate-300 hover:border-white/30")}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => set(f.name, on ? arr.filter((x) => x !== o) : [...arr, o])} />{o}
                  </label>);
              })}</div>{err(f.name)}
            </fieldset>);
          if (f.kind === "file") {
            const file = files[f.name];
            return (
              <div key={f.name} className={cn(cls, "sm:col-span-1")}>
                <span className="label">{f.label}</span>
                {file ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-navy-900/70 px-4 py-3 text-sm">
                    <span className="truncate text-slate-200">{file.name}</span>
                    <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((p) => ({ ...p, [f.name]: null }))} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 text-sm text-slate-400 hover:border-cyan hover:text-white">
                    <Paperclip className="h-4 w-4" aria-hidden /> Choose file (max 10 MB)
                    <input id={`f-${f.name}`} type="file" accept={f.accept} className="sr-only" onChange={(e) => {
                      const fl = e.target.files?.[0]; if (!fl) return;
                      if (fl.size > MAX_FILE) { setErrors((x) => ({ ...x, [f.name]: "Files must be 10 MB or smaller" })); return; }
                      if (!ALLOWED.test(fl.name)) { setErrors((x) => ({ ...x, [f.name]: "Use PDF, JPG, PNG, WebP, DOC, DOCX or ZIP" })); return; }
                      setErrors((x) => ({ ...x, [f.name]: "" })); setFiles((p) => ({ ...p, [f.name]: fl }));
                    }} />
                  </label>
                )}
                {errors[f.name] && <p className="mt-1.5 text-sm text-rose-300">{errors[f.name]}</p>}
              </div>);
          }
          const type = f.kind === "number" ? "number" : f.kind === "date" ? "date" : f.kind === "url" ? "text" : f.kind;
          const auto: Record<string, string> = { full_name: "name", email: "email", phone: "tel", city: "address-level2", business_name: "organization", website_url: "url" };
          return <div key={f.name} className={cls}>{label}<input {...aria(f.name)} type={type} inputMode={f.kind === "url" ? "url" : f.kind === "tel" ? "tel" : undefined} autoComplete={auto[f.name]} className="field" placeholder={f.placeholder} value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} onBlur={() => blur(f)} min={f.kind === "number" ? 0 : undefined} />{err(f.name)}</div>;
        })}
        <input tabIndex={-1} aria-hidden autoComplete="off" name="company_website" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" />
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input id="f-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded accent-[#4169FF]" />
            <span>I agree to the <Link href="/privacy-policy" className="text-cyan underline" target="_blank">Privacy Policy</Link> and consent to HRIDAYA IT SOLUTIONS contacting me about this enquiry. *</span>
          </label>
          {errors.consent && <p className="mt-1.5 text-sm text-rose-300">{errors.consent}</p>}
        </div>
      </div>
      {formError && <p role="alert" className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>}
      <button type="submit" disabled={busy} className="btn-primary mt-8 w-full sm:w-auto">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {status === "uploading" ? "Uploading files…" : status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
