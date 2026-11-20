"use client";
import { useMemo, useState } from "react";
import { ProjectCard, EmptyState } from "@/components/shared/Cards";
import type { PortfolioCategory, PortfolioProject } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PortfolioGallery({ projects, categories, limit }: { projects: PortfolioProject[]; categories: PortfolioCategory[]; limit?: number }) {
  const [cat, setCat] = useState("all");
  const list = useMemo(() => {
    const f = cat === "all" ? projects : projects.filter((p) => p.category?.slug === cat);
    return limit ? f.slice(0, limit) : f;
  }, [cat, projects, limit]);
  return (
    <div>
      <div role="tablist" aria-label="Filter projects by category" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ slug: "all", name: "All work" }, ...categories].map((c) => (
          <button key={c.slug} type="button" role="tab" aria-selected={cat === c.slug} onClick={() => setCat(c.slug)}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition", cat === c.slug ? "border-transparent bg-white text-navy-950" : "border-white/15 text-slate-300 hover:border-white/40")}>
            {c.name}
          </button>
        ))}
      </div>
      {list.length
        ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        : <EmptyState title="Projects coming soon" text={projects.length ? "No projects in this category yet. Try another filter." : "Portfolio projects will appear here once they're added in the admin dashboard."} />}
    </div>
  );
}
