import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { Icon } from "@/components/site/Icon";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectCard } from "@/components/shared/Cards";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getProjectsForService, getService, getServiceFaqs, getServices } from "@/lib/data";
import { faqLd, pageMetadata, serviceLd } from "@/lib/seo-meta";

export const revalidate = 300;
export async function generateStaticParams() { return (await getServices()).map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = await getService(params.slug);
  if (!s) return {};
  return pageMetadata(`/services/${s.slug}`, s.seo_title || `${s.name} Services in Noida & Across India`, s.seo_description || `${s.short_description} HRIDAYA IT SOLUTIONS, Noida — serving businesses across India.`, s.og_image_url);
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const s = await getService(params.slug);
  if (!s) notFound();
  const [faqs, all, projects] = await Promise.all([getServiceFaqs(s), getServices(), getProjectsForService(s.id)]);
  const related = all.filter((x) => x.slug !== s.slug && x.category_id === s.category_id).slice(0, 3);
  const path = `/services/${s.slug}`;

  return (
    <>
      <JsonLd data={serviceLd(s.name, s.short_description ?? "", path)} />
      {faqs.length > 0 && <JsonLd data={faqLd(faqs)} />}
      <PageHero title={s.name} description={s.tagline} crumbs={[{ name: "Services", path: "/services" }, { name: s.name, path }]}>
        <a href="#enquire" className="btn-primary">Get a free quote</a>
        <Link href="/portfolio" className="btn-ghost">See our work</Link>
      </PageHero>

      <section className="section pt-4">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="!text-2xl sm:!text-3xl">What is {s.name.toLowerCase()} and why it matters</h2>
            <p className="mt-5 max-w-[65ch] text-lg text-slate-300">{s.intro}</p>
          </div>
          <div className="panel self-start p-7">
            <Icon name={s.icon} className="h-8 w-8 text-cyan" />
            <p className="mt-4 font-semibold text-white">Benefits for your business</p>
            <ul className="mt-4 space-y-4">
              {s.benefits.map((b) => <li key={b.title} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-cyan" aria-hidden /><span><strong className="text-white">{b.title}.</strong> <span className="text-slate-400">{b.description}</span></span></li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="wrap">
          <SectionHeading light title="What we offer" />
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {[...s.offerings, ...s.features].map((o) => <div key={o.title} className="border-t-2 border-electric/70 pt-5"><h3>{o.title}</h3><p className="mt-2 text-slate-600">{o.description}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHeading title="Our working process" />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {s.process.map((p, i) => (
              <li key={p.title} className="panel p-6"><span className="font-display text-sm text-cyan">Step {i + 1}</span><h3 className="mt-3 !text-lg">{p.title}</h3><p className="mt-2 text-[15px] text-slate-400">{p.description}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section pt-0">
          <div className="wrap"><SectionHeading title={`${s.name} projects`} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div></div>
        </section>
      )}

      <section id="enquire" className="section scroll-mt-24 border-y border-white/[0.06] bg-navy-900">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <h2 className="!text-2xl sm:!text-3xl">Request a {s.name.toLowerCase()} quote</h2>
            <p className="mt-4 text-slate-400">The more detail you share, the more accurate our proposal. Your information is only used to respond to this enquiry.</p>
          </div>
          <EnquiryForm formType={s.form_type} serviceSlug={s.slug} serviceName={s.name} title={`${s.name} enquiry`} />
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section">
          <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><SectionHeading title={`${s.name} FAQs`} /><FaqAccordion faqs={faqs} /></div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section pt-0">
          <div className="wrap"><SectionHeading title="Related services" />
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r) => <Link key={r.id} href={`/services/${r.slug}`} className="panel p-6 transition hover:border-cyan/40"><Icon name={r.icon} className="h-6 w-6 text-electric" /><h3 className="mt-4">{r.name}</h3><p className="mt-2 text-[15px] text-slate-400">{r.short_description}</p></Link>)}
            </div></div>
        </section>
      )}
    </>
  );
}
