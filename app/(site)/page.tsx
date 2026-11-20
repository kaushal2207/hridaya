import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { StatCounter } from "@/components/home/StatCounter";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { PortfolioGallery } from "@/components/shared/PortfolioGallery";
import { ClientTile, ClientPlaceholders } from "@/components/shared/Cards";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { Icon } from "@/components/site/Icon";
import { JsonLd } from "@/components/site/JsonLd";
import { CATEGORY_LINK, INDUSTRY_COPY, TRUST_POINTS, WHY_CHOOSE, WORK_PROCESS } from "@/lib/content";
import { getCategories, getFaqs, getFeaturedClients, getIndustries, getPortfolioCategories, getProjects, getSettings, getSlides, getStats, getTestimonials } from "@/lib/data";
import { faqLd, pageMetadata } from "@/lib/seo-meta";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata("/", "HRIDAYA IT SOLUTIONS | Website Development & Digital Marketing Agency in Noida",
    "Website development, graphic design, digital marketing, SEO and Amazon, Myntra & Shopify management for businesses across India. Based in Noida.");
}

export default async function Home() {
  const [slides, stats, categories, clients, projects, pcats, industries, testimonials, faqs, settings] = await Promise.all([
    getSlides(), getStats(), getCategories(), getFeaturedClients(), getProjects(), getPortfolioCategories(), getIndustries(), getTestimonials(), getFaqs("home"), getSettings(),
  ]);
  const homeIndustries = industries.filter((i) => i.show_on_home).slice(0, 8);

  return (
    <>
      <JsonLd data={faqLd(faqs)} />
      <HeroSlider slides={slides} />

      {/* 2. Introduction */}
      <section className="section relative border-t border-white/[0.06]" aria-labelledby="intro-h">
        <div className="wrap grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <h2 id="intro-h">Your Complete Digital Growth Partner.</h2>
          </div>
          <div className="space-y-5 text-lg text-slate-300">
            <p>{settings.company.intro}</p>
            <p>Most businesses work with one vendor for their website, another for design, a third for ads and someone else for marketplaces. Nobody sees the whole picture. We bring technology, creativity, marketing and e-commerce into one team, so your website, brand, campaigns and online store all pull in the same direction.</p>
            <p className="text-slate-400">Based in Noida, Uttar Pradesh. Working remotely with businesses across India.</p>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="wrap mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => <StatCounter key={s.id} value={Number(s.value)} prefix={s.prefix} suffix={s.suffix} label={s.label} />)}
          </div>
        )}
      </section>

      {/* 3. Core services */}
      <section className="section relative" aria-labelledby="svc-h">
        <div className="wrap">
          <SectionHeading id="svc-h" title="Four ways we grow your business" intro="Each vertical works on its own, and works better together." />
          <div className="grid gap-5 md:grid-cols-2">
            {categories.map((c, idx) => (
              <article key={c.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-800/80 to-navy-900 p-8 transition duration-300 hover:border-electric/50 sm:p-10">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-100"
                  style={{ background: ["#4169FF55", "#8B5CF655", "#00D4FF44", "#4169FF55"][idx % 4] }} />
                <div className="relative">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric/25 to-cyan/10 text-cyan ring-1 ring-white/10"><Icon name={c.icon} className="h-7 w-7" /></span>
                  <h3 className="mt-6 text-2xl">{c.name}</h3>
                  <p className="mt-3 text-slate-300">{c.short_description}</p>
                  <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {c.highlights.map((h) => <li key={h} className="flex gap-2 text-[15px] text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan" aria-hidden />{h}</li>)}
                  </ul>
                  <Link href={CATEGORY_LINK[c.slug] ?? "/services"} className="btn-ghost mt-8">Explore {c.name}<ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why choose us */}
      <section className="section light-section" aria-labelledby="why-h">
        <div className="wrap">
          <SectionHeading id="why-h" light title="Why businesses choose HRIDAYA" intro="Practical reasons, not slogans." />
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((w) => (
              <div key={w.title} className="border-t-2 border-electric/70 pt-6">
                <Icon name={w.icon} className="h-6 w-6 text-electric" />
                <h3 className="mt-4">{w.title}</h3>
                <p className="mt-2 text-slate-600">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Clients */}
      <section className="section" aria-labelledby="clients-h">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading id="clients-h" title="Businesses We've Worked With." intro="Building meaningful digital partnerships with businesses across industries." />
            <Link href="/clients" className="btn-ghost mb-12 shrink-0">View All Clients</Link>
          </div>
          {clients.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{clients.map((c) => <ClientTile key={c.id} c={c} />)}</div> : <ClientPlaceholders count={8} />}
        </div>
      </section>

      {/* 6. Trust */}
      <section className="section relative overflow-hidden border-y border-white/[0.06] bg-navy-900" aria-labelledby="trust-h">
        <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading id="trust-h" title="Why businesses trust us" intro="Trust comes from how we work day to day: clear communication, honest expectations and your accounts staying in your name." />
          <dl className="grid gap-8 sm:grid-cols-2">
            {TRUST_POINTS.map((t) => (
              <div key={t.title} className="panel p-6"><dt className="font-display text-lg text-white">{t.title}</dt><dd className="mt-3 text-slate-400">{t.description}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* 7. Portfolio */}
      <section className="section" aria-labelledby="work-h">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading id="work-h" title="Selected work" intro="Websites, designs, campaigns and marketplace projects." />
            <Link href="/portfolio" className="btn-ghost mb-12 shrink-0">View full portfolio</Link>
          </div>
          <PortfolioGallery projects={projects} categories={pcats} limit={6} />
        </div>
      </section>

      {/* 8. Process */}
      <section className="section light-section" aria-labelledby="process-h">
        <div className="wrap">
          <SectionHeading id="process-h" light title="How we work" intro="Six steps from the first call to ongoing support." />
          <ol className="relative grid gap-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
            <span className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-electric via-cyan to-violet lg:block" aria-hidden />
            {WORK_PROCESS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 font-display text-sm font-semibold text-white ring-4 ring-mist">{i + 1}</span>
                <h3 className="mt-5 !text-lg">{s.title}</h3>
                <p className="mt-2 text-[15px] text-slate-600">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 9. Industries */}
      <section className="section" aria-labelledby="ind-h">
        <div className="wrap">
          <SectionHeading id="ind-h" title="Industries we serve" />
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {homeIndustries.map((ind) => (
              <div key={ind.id} className="bg-navy-950 p-7 transition hover:bg-navy-900">
                <Icon name={ind.icon} className="h-6 w-6 text-cyan" />
                <h3 className="mt-5 !text-lg">{ind.name}</h3>
                <p className="mt-2 text-[15px] text-slate-400">{INDUSTRY_COPY[ind.slug] ?? ""}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="section border-t border-white/[0.06]" aria-labelledby="t-h">
        <div className="wrap">
          <SectionHeading id="t-h" align="center" title="What clients say" />
          {testimonials.length ? <TestimonialSlider items={testimonials} />
            : <p className="mx-auto max-w-lg text-center text-slate-400">Client reviews will appear here once they're added. We only publish genuine feedback.</p>}
        </div>
      </section>

      {/* 11. CTA */}
      <CtaBand />

      {/* 12. FAQ */}
      <section className="section pt-0" aria-labelledby="faq-h">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading id="faq-h" title="Frequently asked questions" intro="Can't find your answer? Email us or send an enquiry." />
          <FaqAccordion faqs={faqs} />
        </div>
      </section>
    </>
  );
}
