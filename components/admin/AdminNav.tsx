"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, BookOpen, Briefcase, FileText, Globe, HelpCircle, Image as ImageIcon, Inbox, Layers, LayoutDashboard, Mail, Menu, Quote, Search, Settings, SlidersHorizontal, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/leads", label: "Leads", icon: Inbox }] },
  { group: "Services", items: [{ href: "/admin/content/services", label: "Services", icon: Layers }, { href: "/admin/content/service-categories", label: "Verticals", icon: SlidersHorizontal }] },
  { group: "Clients", items: [{ href: "/admin/content/clients", label: "Clients", icon: Briefcase }, { href: "/admin/content/case-studies", label: "Case studies", icon: FileText }, { href: "/admin/content/client-images", label: "Project images", icon: ImageIcon }, { href: "/admin/content/testimonials", label: "Testimonials", icon: Quote }] },
  { group: "Portfolio", items: [{ href: "/admin/content/portfolio", label: "Projects", icon: Briefcase }, { href: "/admin/content/portfolio-images", label: "Project images", icon: ImageIcon }, { href: "/admin/content/portfolio-categories", label: "Categories", icon: Layers }] },
  { group: "Content", items: [{ href: "/admin/content/blog", label: "Blog", icon: BookOpen }, { href: "/admin/content/slides", label: "Homepage slides", icon: SlidersHorizontal }, { href: "/admin/content/stats", label: "Statistics", icon: BarChart3 }, { href: "/admin/content/faqs", label: "FAQs", icon: HelpCircle }, { href: "/admin/content/industries", label: "Industries", icon: Globe }] },
  { group: "Growth", items: [{ href: "/admin/seo", label: "SEO", icon: Search }, { href: "/admin/subscribers", label: "Subscribers", icon: Mail }] },
  { group: "Account", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }, { href: "/admin/team", label: "Team & password", icon: Users }] },
];

export function AdminNav({ name, role, signOut }: { name: string; role: string; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-2 px-3 text-xs font-semibold text-slate-500">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
              return <li key={it.href}><Link href={it.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm", active ? "bg-electric/20 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}><it.icon className="h-4 w-4" aria-hidden />{it.label}</Link></li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-navy-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="font-display text-sm text-white">HRIDAYA Admin</Link>
        <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="text-white">{open ? <X /> : <Menu />}</button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-white/10 bg-navy-950 p-4 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <Link href="/admin" className="mb-6 block px-3 pt-2 font-display text-white">HRIDAYA <span className="text-slate-500">Admin</span></Link>
        {nav}
        <div className="mt-8 border-t border-white/10 px-3 pt-4 text-sm">
          <p className="truncate text-white">{name}</p><p className="text-xs capitalize text-slate-500">{role}</p>
          <div className="mt-3 flex gap-3"><Link href="/" target="_blank" className="text-cyan">View site</Link>
            <form action={signOut}><button className="text-slate-400 hover:text-white">Sign out</button></form></div>
        </div>
      </aside>
    </>
  );
}
