import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Globe2, Youtube } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import type { Settings } from "@/lib/types";

const SOCIAL_ICONS: Record<string, typeof Facebook> = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin, youtube: Youtube };

export function Footer({ settings }: { settings: Settings }) {
  const socials = Object.entries(settings.social).filter(([, v]) => v);
  const col = "mb-4 font-display text-sm font-semibold text-white";
  const a = "text-[15px] text-slate-400 transition hover:text-cyan";
  return (
    <footer className="relative border-t border-white/[0.07] bg-navy-950 pb-28 pt-16 sm:pb-10">
      <div className="wrap grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-[15px] text-slate-400">{settings.company.intro}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {socials.map(([k, v]) => {
                const I = SOCIAL_ICONS[k] ?? Globe2;
                return <li key={k}><a href={v!} target="_blank" rel="noopener noreferrer" aria-label={k} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 hover:border-cyan hover:text-cyan"><I className="h-4 w-4" /></a></li>;
              })}
            </ul>
          )}
          <NewsletterForm />
        </div>
        <div>
          <p className={col}>Quick links</p>
          <ul className="space-y-2.5">
            {[["/", "Home"], ["/about", "About Us"], ["/clients", "Clients"], ["/portfolio", "Portfolio"], ["/blog", "Blog"], ["/contact", "Contact Us"], ["/seo-tools", "AI SEO Tools"]].map(([h, l]) => <li key={h}><Link href={h} className={a}>{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className={col}>Our services</p>
          <ul className="space-y-2.5">
            {[["website-development", "Web Development"], ["graphic-design", "Graphic Design"], ["digital-marketing", "Digital Marketing"], ["seo-services", "SEO Services"], ["ecommerce-management", "E-commerce Management"]].map(([s, l]) => <li key={s}><Link href={`/services/${s}`} className={a}>{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className={col}>Contact details</p>
          <ul className="space-y-4 text-[15px] text-slate-400">
            <li className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-cyan" aria-hidden /><a href={`mailto:${settings.contact.email}`} className="break-all hover:text-cyan">{settings.contact.email}</a></li>
            <li className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan" aria-hidden />{settings.company.location}</li>
            <li className="flex gap-3"><Globe2 className="mt-1 h-4 w-4 shrink-0 text-cyan" aria-hidden />Service coverage: All India</li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-14 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} HRIDAYA IT SOLUTIONS. All rights reserved.</p>
        <ul className="flex flex-wrap gap-5">
          <li><Link href="/privacy-policy" className="hover:text-cyan">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-cyan">Terms &amp; Conditions</Link></li>
          <li><Link href="/disclaimer" className="hover:text-cyan">Disclaimer</Link></li>
        </ul>
      </div>
    </footer>
  );
}
