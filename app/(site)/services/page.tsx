import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Icon } from "@/components/site/Icon";
import { getCategories, getServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/services", "Services", "Website development, WordPress, Shopify, graphic design, SEO, Google & Meta Ads, social media and Amazon, Myntra & Flipkart management.");

export default async function Services() {
  const [cats, services] = await Promise.all([getCategories(), getServices()]);
  return (
    <>
      <PageHero title="Services" crumbs={[{ name: "Services", path: "/services" }]} description="Sixteen services across four verticals. Pick one, or let us combine them into a single growth plan." />
      <div className="wrap pb-10">
        {cats.map((c) => {
          const list = services.filter((s) => s.category_id === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} className="border-t border-white/10 py-14" aria-labelledby={`c-${c.slug}`}>
              <div className="grid gap-8 lg:grid-cols-[0.8fr_2fr]">
                <div><Icon name={c.icon} className="h-8 w-8 text-cyan" /><h2 id={`c-${c.slug}`} className="mt-4 !text-2xl sm:!text-3xl">{c.name}</h2><p className="mt-3 text-slate-400">{c.short_description}</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {list.map((s) => (
                    <Link key={s.id} href={`/services/${s.slug}`} className="panel group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-cyan/40">
                      <div className="flex items-start justify-between gap-3"><Icon name={s.icon} className="h-6 w-6 text-electric" /><ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:text-cyan" aria-hidden /></div>
                      <h3 className="mt-4">{s.name}</h3><p className="mt-2 text-[15px] text-slate-400">{s.short_description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <CtaBand />
    </>
  );
}
