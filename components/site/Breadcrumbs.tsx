import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbLd } from "@/lib/seo-meta";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
      <JsonLd data={breadcrumbLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden />}
            {i === all.length - 1 ? <span aria-current="page" className="text-slate-300">{it.name}</span>
              : <Link href={it.path} className="hover:text-cyan">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
