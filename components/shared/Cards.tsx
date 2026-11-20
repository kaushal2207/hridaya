import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { Client, PortfolioProject } from "@/lib/types";

export function DemoBadge({ className = "" }: { className?: string }) {
  return <span className={`inline-flex rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ${className}`}>Demo</span>;
}

export function ClientTile({ c }: { c: Client }) {
  return (
    <Link href={`/clients/${c.slug}`} className="group panel relative flex flex-col items-center justify-between gap-4 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-cyan/40">
      {c.is_demo && <DemoBadge className="absolute right-3 top-3" />}
      <div className="flex h-20 w-full items-center justify-center">
        {c.logo_url
          ? <Image src={c.logo_url} alt={`${c.client_name} logo`} width={160} height={80} className="max-h-16 w-auto object-contain opacity-80 grayscale transition group-hover:opacity-100 group-hover:grayscale-0" />
          : <span className="font-display text-2xl font-semibold text-white/80">{c.client_name.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div><p className="font-semibold text-white">{c.client_name}</p>{c.industry && <p className="mt-0.5 text-sm text-slate-400">{c.industry.name}</p>}</div>
    </Link>
  );
}

/** Shown in place of client logos until real clients are added in the admin. Clearly marked as placeholders. */
export function ClientPlaceholders({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 p-6 text-center">
            <DemoBadge className="absolute right-3 top-3" />
            <span className="h-10 w-24 rounded-lg bg-white/[0.06]" /><span className="text-sm text-slate-500">Client logo</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-400">Demo placeholders. Client logos appear here once they're added in the admin dashboard.</p>
    </div>
  );
}

export function ProjectCard({ p }: { p: PortfolioProject }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition duration-300 hover:border-cyan/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-800">
        {p.cover_image_url
          ? <Image src={p.cover_image_url} alt={p.cover_alt || p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
          : <div className="flex h-full items-center justify-center text-slate-600"><ImageIcon className="h-10 w-10" aria-hidden /></div>}
        {p.is_demo && <DemoBadge className="absolute left-3 top-3" />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {p.category && <p className="text-sm font-medium text-cyan">{p.category.name}</p>}
        <h3 className="mt-2">{p.title}</h3>
        {p.summary && <p className="mt-2 line-clamp-3 text-[15px] text-slate-400">{p.summary}</p>}
        <Link href={`/portfolio/${p.slug}`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-semibold text-white after:absolute after:inset-0 hover:text-cyan">
          View project<ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
      <p className="font-display text-lg text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-slate-400">{text}</p>
    </div>
  );
}
