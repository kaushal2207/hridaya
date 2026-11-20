import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { ProjectCard } from "@/components/shared/Cards";
import { getProject, getProjectImages, getProjectServiceIds, getProjects, getServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { formatDate, safeHref } from "@/lib/utils";

export const revalidate = 300;
export async function generateStaticParams() { return (await getProjects()).map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProject(params.slug);
  if (!p) return {};
  const m = await pageMetadata(`/portfolio/${p.slug}`, p.seo_title || `${p.title} | Portfolio`, p.seo_description || p.summary || p.title, p.og_image_url || p.cover_image_url);
  return p.is_demo ? { ...m, robots: { index: false, follow: true } } : m;
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const p = await getProject(params.slug);
  if (!p) notFound();
  const [images, serviceIds, services, all] = await Promise.all([getProjectImages(p.id), getProjectServiceIds(p.id), getServices(), getProjects()]);
  const svc = services.filter((s) => serviceIds.includes(s.id));
  const more = all.filter((x) => x.id !== p.id && x.category_id === p.category_id).slice(0, 3);
  const site = safeHref(p.project_url);
  return (
    <>
      <PageHero title={p.title} description={p.summary} crumbs={[{ name: "Portfolio", path: "/portfolio" }, { name: p.title, path: `/portfolio/${p.slug}` }]}>
        {site && <a href={site} target="_blank" rel="noopener noreferrer" className="btn-ghost">View live project<ExternalLink className="h-4 w-4" aria-hidden /></a>}
      </PageHero>
      {p.cover_image_url && <div className="wrap"><Image src={p.cover_image_url} alt={p.cover_alt || p.title} width={1600} height={900} priority className="aspect-[16/9] w-full rounded-3xl border border-white/10 object-cover" /></div>}
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-12">
            {p.is_demo && <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">Demo placeholder project. Not real client work.</p>}
            {([["Overview", p.description], ["The challenge", p.challenge], ["Our solution", p.solution], ["Outcome", p.outcome]] as const).map(([t, v]) => v && <div key={t}><h2 className="!text-2xl">{t}</h2><p className="mt-4 whitespace-pre-line text-lg text-slate-300">{v}</p></div>)}
          </div>
          <aside className="panel h-fit p-7"><dl className="space-y-4 text-[15px]">
            {p.category && <div><dt className="text-slate-400">Category</dt><dd className="font-semibold text-white">{p.category.name}</dd></div>}
            {p.client && <div><dt className="text-slate-400">Client</dt><dd><Link href={`/clients/${p.client.slug}`} className="font-semibold text-cyan">{p.client.client_name}</Link></dd></div>}
            {p.completed_on && <div><dt className="text-slate-400">Completed</dt><dd className="font-semibold text-white">{formatDate(p.completed_on)}</dd></div>}
            {svc.length > 0 && <div><dt className="text-slate-400">Services</dt><dd className="mt-2 flex flex-wrap gap-2">{svc.map((s) => <Link key={s.id} href={`/services/${s.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-sm hover:border-cyan">{s.name}</Link>)}</dd></div>}
          </dl></aside>
        </div>
      </section>
      {images.length > 0 && <section className="section pt-0"><div className="wrap"><SectionHeading title="Gallery" />
        <div className="grid gap-4 sm:grid-cols-2">{images.map((im) => <figure key={im.id}><Image src={im.image_url} alt={im.alt_text || p.title} width={1000} height={700} className="w-full rounded-2xl border border-white/10" />{im.caption && <figcaption className="mt-2 text-sm text-slate-400">{im.caption}</figcaption>}</figure>)}</div></div></section>}
      {more.length > 0 && <section className="section pt-0"><div className="wrap"><SectionHeading title="More projects" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.map((x) => <ProjectCard key={x.id} p={x} />)}</div></div></section>}
      <CtaBand title="Want something like this?" text="Tell us about your project and we'll suggest the best approach." secondary={null} />
    </>
  );
}
