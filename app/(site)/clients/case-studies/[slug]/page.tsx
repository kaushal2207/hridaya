import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { getCaseStudies, getCaseStudy, getClientImages } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { SITE_URL } from "@/lib/env";
import { safeHref } from "@/lib/utils";

export const revalidate = 300;
export async function generateStaticParams() { return (await getCaseStudies()).map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await getCaseStudy(params.slug);
  if (!c) return {};
  return pageMetadata(`/clients/case-studies/${c.slug}`, c.seo_title || `${c.title} | Case Study`, c.seo_description || c.summary || c.title, c.og_image_url || c.after_image_url);
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const c = await getCaseStudy(params.slug);
  if (!c || !c.client) notFound();
  const gallery = (await getClientImages(c.client_id)).filter((i) => i.case_study_id === c.id);
  const site = safeHref(c.website_url || c.client.website_url);
  const sections: [string, string | null][] = [["Project description", c.description], ["Challenges", c.challenges], ["Solutions delivered", c.solutions], ["Project outcome", c.outcome]];
  return (
    <>
      {!c.client.is_demo && <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: c.title, about: c.client.client_name, author: { "@id": `${SITE_URL}/#org` }, url: `${SITE_URL}/clients/case-studies/${c.slug}` }} />}
      <PageHero title={c.title} description={c.summary} crumbs={[{ name: "Clients", path: "/clients" }, { name: c.client.client_name, path: `/clients/${c.client.slug}` }, { name: "Case study", path: `/clients/case-studies/${c.slug}` }]}>
        {site && <a href={site} target="_blank" rel="noopener noreferrer" className="btn-ghost">Visit website<ExternalLink className="h-4 w-4" aria-hidden /></a>}
      </PageHero>
      <section className="section pt-4">
        <div className="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-12">
            {c.client.is_demo && <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">Demo placeholder case study. Not a real client project.</p>}
            {sections.map(([t, v]) => v && <div key={t}><h2 className="!text-2xl">{t}</h2><p className="mt-4 whitespace-pre-line text-lg text-slate-300">{v}</p></div>)}
            {c.verified_results.length > 0 && <div><h2 className="!text-2xl">Verified results</h2><dl className="mt-6 grid gap-4 sm:grid-cols-2">{c.verified_results.map((r, i) => <div key={i} className="panel p-5"><dt className="text-slate-400">{r.label}</dt><dd className="mt-1 font-display text-2xl text-white">{r.value}</dd>{r.source && <dd className="mt-2 text-xs text-slate-500">Source: {r.source}</dd>}</div>)}</dl></div>}
          </div>
          <aside className="panel h-fit p-7">
            <dl className="space-y-4 text-[15px]">
              <div><dt className="text-slate-400">Client</dt><dd><Link href={`/clients/${c.client.slug}`} className="font-semibold text-cyan">{c.client.client_name}</Link></dd></div>
              {!!c.services?.length && <div><dt className="text-slate-400">Services provided</dt><dd className="mt-2 flex flex-wrap gap-2">{c.services.map((s) => <Link key={s.id} href={`/services/${s.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-sm hover:border-cyan">{s.name}</Link>)}</dd></div>}
            </dl>
          </aside>
        </div>
      </section>
      {(c.before_image_url || c.after_image_url) && (
        <section className="section pt-0"><div className="wrap"><SectionHeading title="Before and after" />
          <div className="grid gap-6 md:grid-cols-2">
            {[["Before", c.before_image_url], ["After", c.after_image_url]].map(([l, u]) => u && <figure key={l} className="overflow-hidden rounded-2xl border border-white/10"><Image src={u} alt={`${l}: ${c.title}`} width={900} height={600} className="aspect-[3/2] w-full object-cover" /><figcaption className="p-3 text-sm font-semibold text-slate-300">{l}</figcaption></figure>)}
          </div></div></section>
      )}
      {gallery.length > 0 && (
        <section className="section pt-0"><div className="wrap"><SectionHeading title="Work gallery" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((im) => <Image key={im.id} src={im.image_url} alt={im.alt_text || c.title} width={800} height={600} className="aspect-[4/3] w-full rounded-2xl object-cover" />)}</div></div></section>
      )}
      <CtaBand title="Discuss a Similar Project" text="Tell us what you want to achieve and we'll show you how we'd approach it." primary={{ label: "Discuss a Similar Project", href: "/contact" }} secondary={null} />
    </>
  );
}
