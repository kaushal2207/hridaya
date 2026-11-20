"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

type NavService = { name: string; slug: string; category: string };
type Group = { name: string; items: NavService[] };

const TOOLS = [
  { name: "Website SEO Audit", href: "/seo-tools/audit", description: "Technical and on-page check of any page" },
  { name: "Keyword Research Tool", href: "/seo-tools/keywords", description: "Keyword ideas grouped by intent" },
  { name: "SEO Score Checker", href: "/seo-tools/score", description: "How well a page targets a keyword" },
];

export function Header({ groups }: { groups: Group[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<null | "services" | "tools">(null);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    const click = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", esc); document.addEventListener("mousedown", click);
    return () => { document.removeEventListener("keydown", esc); document.removeEventListener("mousedown", click); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const link = (href: string, label: string) => (
    <Link href={href} className={cn("rounded-full px-3 py-2 text-[15px] font-medium transition hover:text-white", pathname === href || (href !== "/" && pathname.startsWith(href)) ? "text-white" : "text-slate-300")}>{label}</Link>
  );
  const trigger = (key: "services" | "tools", label: string) => (
    <button type="button" aria-expanded={open === key} aria-haspopup="true" onClick={() => setOpen(open === key ? null : key)}
      onMouseEnter={() => setOpen(key)}
      className={cn("inline-flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-medium transition hover:text-white", open === key ? "text-white" : "text-slate-300")}>
      {label}<ChevronDown className={cn("h-4 w-4 transition-transform", open === key && "rotate-180")} aria-hidden />
    </button>
  );

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "border-b border-white/[0.07] bg-navy-950/80 backdrop-blur-xl" : "bg-transparent")}
      style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy-950">Skip to content</a>
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav ref={navRef} aria-label="Main" className="hidden items-center lg:flex" onMouseLeave={() => setOpen(null)}>
          {link("/", "Home")}{link("/about", "About Us")}
          <div className="relative">
            {trigger("services", "Services")}
            <AnimatePresence>
              {open === "services" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full w-[min(860px,92vw)] -translate-x-1/2 pt-3">
                  <div className="grid grid-cols-4 gap-6 rounded-2xl border border-white/10 bg-navy-900/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    {groups.map((g) => (
                      <div key={g.name}>
                        <p className="mb-3 text-sm font-semibold text-cyan">{g.name}</p>
                        <ul className="space-y-1.5">
                          {g.items.map((s) => (
                            <li key={s.slug}><Link href={`/services/${s.slug}`} className="block rounded-md py-1 text-[14px] text-slate-300 hover:text-white">{s.name}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link href="/services" className="col-span-4 border-t border-white/10 pt-4 text-sm font-semibold text-white hover:text-cyan">View all services</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {link("/clients", "Clients")}{link("/portfolio", "Portfolio")}
          <div className="relative">
            {trigger("tools", "AI SEO Tools")}
            <AnimatePresence>
              {open === "tools" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full w-80 pt-3">
                  <ul className="rounded-2xl border border-white/10 bg-navy-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    {TOOLS.map((t) => (
                      <li key={t.href}><Link href={t.href} className="block rounded-xl px-4 py-3 hover:bg-white/[0.06]">
                        <span className="block text-[15px] font-semibold text-white">{t.name}</span>
                        <span className="block text-sm text-slate-400">{t.description}</span></Link></li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {link("/blog", "Blog")}{link("/contact", "Contact Us")}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/search" aria-label="Search" className="hidden h-11 w-11 items-center justify-center rounded-full text-slate-300 hover:bg-white/5 hover:text-white sm:inline-flex"><Search className="h-5 w-5" /></Link>
          <Link href="/contact" className="btn-primary hidden !min-h-[42px] !px-5 !text-sm sm:inline-flex">Get a Free Consultation</Link>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/5 lg:hidden"
            aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} aria-controls="mobile-nav" onClick={() => setMobile(!mobile)}>
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.nav id="mobile-nav" aria-label="Mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-navy-950/98 px-5 pb-10 pt-4 backdrop-blur-xl lg:hidden">
            <ul className="space-y-1 text-lg">
              {[["/", "Home"], ["/about", "About Us"]].map(([h, l]) => <li key={h}><Link href={h} className="block py-3 font-medium text-white">{l}</Link></li>)}
              <li>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-medium text-white">Services<ChevronDown className="h-5 w-5 transition group-open:rotate-180" /></summary>
                  <div className="space-y-5 pb-4 pl-3">
                    {groups.map((g) => (
                      <div key={g.name}><p className="mb-2 text-sm font-semibold text-cyan">{g.name}</p>
                        <ul className="space-y-1">{g.items.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className="block py-1.5 text-base text-slate-300">{s.name}</Link></li>)}</ul></div>
                    ))}
                  </div>
                </details>
              </li>
              {[["/clients", "Clients"], ["/portfolio", "Portfolio"]].map(([h, l]) => <li key={h}><Link href={h} className="block py-3 font-medium text-white">{l}</Link></li>)}
              <li>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-medium text-white">AI SEO Tools<ChevronDown className="h-5 w-5 transition group-open:rotate-180" /></summary>
                  <ul className="space-y-1 pb-3 pl-3">{TOOLS.map((t) => <li key={t.href}><Link href={t.href} className="block py-1.5 text-base text-slate-300">{t.name}</Link></li>)}</ul>
                </details>
              </li>
              {[["/blog", "Blog"], ["/contact", "Contact Us"], ["/search", "Search"]].map(([h, l]) => <li key={h}><Link href={h} className="block py-3 font-medium text-white">{l}</Link></li>)}
            </ul>
            <Link href="/contact" className="btn-primary mt-6 w-full">Get a Free Consultation</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
