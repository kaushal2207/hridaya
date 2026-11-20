"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { browserClient } from "@/lib/supabase/browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const { error } = await browserClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message); return; }
    router.replace("/admin"); router.refresh();
  }
  async function reset() {
    if (!email) { setErr("Enter your email first, then choose “Forgot password”."); return; }
    await browserClient().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/login` });
    setResetSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 p-5">
      <div className="w-full max-w-sm">
        <Logo />
        <form onSubmit={submit} className="panel mt-8 space-y-5 p-7">
          <h1 className="!text-2xl">Admin sign in</h1>
          {!configured && <p className="rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">Supabase isn’t configured. Add the environment variables from .env.example.</p>}
          <div><label htmlFor="em" className="label">Email</label><input id="em" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" /></div>
          <div><label htmlFor="pw" className="label">Password</label><input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" /></div>
          {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
          {resetSent && <p role="status" className="text-sm text-emerald-300">If that email has an account, a reset link is on its way.</p>}
          <button className="btn-primary w-full" disabled={busy || !configured}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
          <button type="button" onClick={reset} className="w-full text-sm text-slate-400 hover:text-white">Forgot password</button>
        </form>
      </div>
    </main>
  );
}
