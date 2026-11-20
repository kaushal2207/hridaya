"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";

export function FloatingActions({ whatsapp }: { whatsapp: string | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const wa = whatsappLink(whatsapp);
  return (
    <>
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
        <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-navy-900/90 text-white backdrop-blur transition hover:border-cyan", show ? "opacity-100" : "pointer-events-none opacity-0")}>
          <ArrowUp className="h-5 w-5" />
        </button>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
            className="mb-16 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-105 sm:mb-0">
            <MessageCircle className="h-7 w-7" />
          </a>
        )}
      </div>
      {/* Sticky consultation bar on phones */}
      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-950/90 p-3 backdrop-blur-xl transition-transform sm:hidden", show ? "translate-y-0" : "translate-y-full")}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
        <Link href="/contact" className="btn-primary w-full !min-h-[46px]">Get a Free Consultation</Link>
      </div>
    </>
  );
}
