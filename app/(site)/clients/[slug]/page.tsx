import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { DemoBadge, ProjectCard } from "@/components/shared/Cards";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { getCaseStudies, getClient, getClientImages, getClients, getProjects, getTestimonials } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { formatDate, safeHref } from "@/lib/utils";

export const revalidate = 300;
export async function generateStaticParams() { return (await getClients()).map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await getClient(params.slug);
  if (!c) return {};
  const meta = await pageMetadata(`/clients/${c.slug}`, c.seo_title || `${c.client_name} | Client Project`, c.seo_description || c.short_description || `How HRIDAYA IT SOLUTIONS worked with ${c.client_name}.`, c.og_image_url || c.logo_url);
  return c.is_demo ? { ...meta, robots: { index: false, follow: true } } : meta;
}

function Block({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return <div><h2 className="!text-2xl">{title}</h2><p className="mt-4 whitespace-pre-line text-lg text-slate-300">{text}</p></div>;
}

export default async function ClientPage({ params }: { params: { slug: string } }) {
  const c = await getClient(params.slug);
  if (!c) notFound();
  const [images, cases, projects, testimonials] = await Promise.all([getClientImages(c.id), getCaseStudies(), getProjects(), getTestimonials()]);
  const myCases = cases.filter((x) => x.client_id === c.id);
  const results = myCases.flatMap((x) => x.verified_results ?? []);
  const myProjects = projects.filter((p) => p.client_id === c.id);
  const myTestimonials = testimonials.filter((t) => t.client_id === c.id);
  const site = safeHref(c.website_url);

  return (
    <>
      <PageHero title={c.client_name} description={c.short_description} crumbs={[{ name: "Clients", path: "/clients" }, { name: c.client_name, path: `/clients/${c.slug}` }]}>
        {site && <a href={site} target="_blank" rel="noopener noreferrer" className="btn-ghost">Visit website<ExternalLink className="h-4 w-4" aria-hidden /></a>}
      </PageHero>
      <section className="section pt-4">
        <div className="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-12">
            {c.is_demo && <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">This is a demo placeholder profile used to preview the layout. It does not describe a real client.</p>}
            <Block title={`About ${c.client_name}`} text={c.full_description} />
            <Block title="Project overview" text={c.project_overview} />
            <Block title="Challenges" text={c.challenges} />
            <Block title="Solutions delivered" text={c.solutions} />
            {results.length > 0 && (
              <div><h2 className="!text-2xl">Verified results</h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">{results.map((r, i) => <div key={i} className="panel p-5"><dt className="text-slate-400">{r.label}</dt><dd className="mt-1 font-display text-2xl text-white">{r.value}</dd>{r.source && <dd className="mt-2 text-xs text-slate-500">Source: {r.source}</dd>}</div>)}</dl></div>
            )}
          </div>
          <aside className="panel h-fit p-7 lg:sticky lg:top-28">
            <div className="flex h-24 items-center justify-center rounded-xl bg-white/[0.04]">
              {c.logo_url ? <Image src={c.logo_url} alt={`${c.client_name} logo`} width={180} height={90} className="max-h-16 w-auto object-contain" /> : <span className="font-display text-3xl text-white">{c.client_name.slice(0, 2)}</span>}
            </div>
            {c.is_demo && <DemoBadge className="mt-4" />}
            <dl className="mt-6 space-y-4 text-[15px]">
              {c.industry && <div><dt className="text-slate-400">Industry</dt><dd className="font-semibold text-white">{c.industry.name}</dd></div>}
              {site && <div><dt className="text-slate-400">Website</dt><dd><a href={site} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-cyan">{new URL(site).hostname}</a></dd></div>}
              {c.project_completed_on && <div><dt className="text-slate-400">Completed</dt><dd className="font-semibold text-white">{formatDate(c.project_completed_on)}</dd></div>}
              {!!c.services?.length && <div><dt className="text-slate-400">Services provided</dt><dd className="mt-2 flex flex-wrap gap-2">{c.services.map((s) => <Link key={s.id} href={`/services/${s.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-sm text-slate-200 hover:border-cyan">{s.name}</Link>)}</dd></div>}
            </dl>
          </aside>
        </div>
      </section>
      {images.length > 0 && (
        <section className="section pt-0"><div className="wrap"><SectionHeading title="Project images" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((im) => <figure key={im.id} className="overflow-hidden rounded-2xl border border-white/10"><Image src={im.image_url} alt={im.alt_text || c.client_name} width={800} height={600} className="aspect-[4/3] w-full object-cover" />{im.caption && <figcaption className="p-3 text-sm text-slate-400">{im.caption}</figcaption>}</figure>)}</div></div></section>
      )}
      {myCases.length > 0 && (
        <section className="section pt-0"><div className="wrap"><SectionHeading title="Case studies" />
          <div className="grid gap-4 md:grid-cols-2">{myCases.map((cs) => <Link key={cs.id} href={`/clients/case-studies/${cs.slug}`} className="panel p-6 hover:border-cyan/40"><h3>{cs.title}</h3>{cs.summary && <p className="mt-2 text-slate-400">{cs.summary}</p>}</Link>)}</div></div></section>
      )}
      {myProjects.length > 0 && (
        <section className="section pt-0"><div className="wrap"><SectionHeading title="Related portfolio projects" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{myProjects.map((p) => <ProjectCard key={p.id} p={p} />)}</div></div></section>
      )}
      {myTestimonials.length > 0 && <section className="section pt-0"><div className="wrap"><TestimonialSlider items={myTestimonials} /></div></section>}
      <CtaBand title="Discuss a Similar Project" text={`Want results like ${c.client_name}? Tell us about your business and goals.`} primary={{ label: "Discuss a Similar Project", href: "/contact" }} secondary={null} />
    </>
  );
}
