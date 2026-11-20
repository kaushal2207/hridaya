"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** The site sets only essential cookies (admin session). This notice records acknowledgement; add analytics only after consent. */
export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { setShow(!localStorage.getItem("hridaya-cookie-ok")); } catch { /* storage blocked */ } }, []);
  if (!show) return null;
  const accept = (v: string) => { try { localStorage.setItem("hridaya-cookie-ok", v); } catch { /* ignore */ } setShow(false); };
  return (
    <div role="dialog" aria-label="Cookie notice" className="fixed bottom-4 left-4 right-4 z-50 max-w-md rounded-2xl border border-white/10 bg-navy-900/95 p-5 text-sm text-slate-300 shadow-2xl backdrop-blur-xl sm:right-auto">
      <p>We use essential cookies to run this site. With your permission we may also use analytics cookies to understand how it is used. See our <Link href="/privacy-policy" className="text-cyan underline">Privacy Policy</Link>.</p>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-primary !min-h-[40px] !px-4 !text-sm" onClick={() => accept("all")}>Accept all</button>
        <button type="button" className="btn-ghost !min-h-[40px] !px-4 !text-sm" onClick={() => accept("essential")}>Essential only</button>
      </div>
    </div>
  );
}
