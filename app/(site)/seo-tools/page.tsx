import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { NAV_SEO_TOOLS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo-meta";

export const generateMetadata = () => pageMetadata("/seo-tools", "Free AI SEO Tools", "Free website SEO audit, keyword research and SEO score checker by HRIDAYA IT SOLUTIONS.");

export default function Tools() {
  return (
    <>
      <PageHero title="Free AI SEO tools" crumbs={[{ name: "AI SEO Tools", path: "/seo-tools" }]} description="Check your website the way we do. Scores come from real checks of your page; AI explains the results in plain language." />
      <section className="section pt-4"><div className="wrap grid gap-5 md:grid-cols-3">
        {NAV_SEO_TOOLS.map((t) => <Link key={t.href} href={t.href} className="panel group p-8 transition hover:border-cyan/40"><h2 className="!text-xl group-hover:text-cyan">{t.name}</h2><p className="mt-3 text-slate-400">{t.description}</p><ArrowUpRight className="mt-6 h-5 w-5 text-cyan" aria-hidden /></Link>)}
      </div></section>
    </>
  );
}
