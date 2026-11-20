"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; msg?: string }>({ status: "idle" });
  const path = usePathname();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, hp, source_path: path }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (r?.ok && j?.ok) { setState({ status: "done", msg: "Subscribed. Check your inbox for a confirmation." }); setEmail(""); }
    else setState({ status: "error", msg: j?.error || "Couldn't subscribe. Try again." });
  }
  return (
    <form onSubmit={submit} className="mt-5" noValidate>
      <label htmlFor="nl-email" className="text-sm font-semibold text-white">Get practical growth tips by email</label>
      <div className="mt-3 flex gap-2">
        <input id="nl-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className="field !py-2.5" />
        <input tabIndex={-1} aria-hidden autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" name="company_website" />
        <button className="btn-primary !min-h-[44px] shrink-0 !px-5 !text-sm" disabled={state.status === "loading"}>{state.status === "loading" ? "Subscribing…" : "Subscribe"}</button>
      </div>
      <p role="status" className={state.status === "error" ? "mt-2 text-sm text-rose-300" : "mt-2 text-sm text-emerald-300"}>{state.msg}</p>
    </form>
  );
}
