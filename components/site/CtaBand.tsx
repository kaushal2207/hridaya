import Link from "next/link";
import { PulseLine } from "@/components/site/PulseLine";

export function CtaBand({ title = "Ready To Take Your Business To The Next Level?", text = "Let's build something powerful together. Tell us about your project and our team will get back to you.",
  primary = { label: "Get Free Consultation", href: "/contact" }, secondary = { label: "Explore Our Services", href: "/services" } as { label: string; href: string } | null }:
  { title?: string; text?: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string } | null }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#16245a] via-navy-900 to-[#1b1240] px-6 py-14 sm:px-14 sm:py-20">
          <PulseLine className="pointer-events-none absolute inset-x-0 bottom-6 h-24 w-full opacity-50" animate={false} />
          <div className="relative max-w-2xl">
            <h2>{title}</h2>
            <p className="mt-5 text-lg text-slate-300">{text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primary.href} className="btn-primary">{primary.label}</Link>
              {secondary && <Link href={secondary.href} className="btn-ghost">{secondary.label}</Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
