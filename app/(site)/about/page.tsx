import Link from "next/link";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { Icon } from "@/components/site/Icon";
import { CATEGORY_LINK, WHY_CHOOSE, WORK_PROCESS } from "@/lib/content";
import { getCategories } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/about", "About Us", "HRIDAYA IT SOLUTIONS is a Noida-based digital agency helping businesses across India with websites, design, marketing and e-commerce.");

const VALUES = [
  { title: "Honesty", description: "Realistic timelines, clear pricing and no promises we can't keep." },
  { title: "Ownership", description: "We treat your goals as ours and follow through after launch." },
  { title: "Clarity", description: "Plain language, regular updates and reports you can understand." },
  { title: "Craft", description: "Careful design and clean engineering, even in the details nobody asks for." },
];

export default async function About() {
  const categories = await getCategories();
  return (
    <>
      <PageHero title="We help businesses build, market and grow online." crumbs={[{ name: "About Us", path: "/about" }]}
        description="HRIDAYA IT SOLUTIONS is a digital growth partner based in Noida, Uttar Pradesh, working with businesses across India.">
        <Link href="/contact" className="btn-primary">Get a Free Consultation</Link>
      </PageHero>

      <section className="section pt-4">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg text-slate-300">
            <h2 className="mb-6">Who we are</h2>
            <p>“Hridaya” means heart. We chose the name because we care about the businesses we work with: their customers, their margins and their long-term growth, not only the deliverable in front of us.</p>
            <p>We bring together web developers, designers, digital marketers and marketplace specialists so that a business can get its website, brand, campaigns and online store from one accountable team.</p>
            <p>We work remotely with clients across India using video calls, WhatsApp and shared project tools, with the same clarity you would expect from a team sitting next to you.</p>
          </div>
          <div className="grid gap-5">
            <div className="panel p-8"><h3 className="text-cyan">Our vision</h3><p className="mt-3 text-slate-300">To be the digital growth partner Indian businesses rely on, from their first website to their hundredth marketplace listing.</p></div>
            <div className="panel p-8"><h3 className="text-cyan">Our mission</h3><p className="mt-3 text-slate-300">To make professional technology, design, marketing and e-commerce expertise accessible and affordable for businesses of every size, and to measure our work by the growth it creates.</p></div>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="wrap">
          <SectionHeading light title="Our values" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => <div key={v.title} className="border-t-2 border-electric/70 pt-5"><h3>{v.title}</h3><p className="mt-2 text-slate-600">{v.description}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHeading title="Our four service verticals" />
          <div className="grid gap-5 md:grid-cols-2">
            {categories.map((c) => (
              <Link key={c.id} href={CATEGORY_LINK[c.slug] ?? "/services"} className="panel group flex gap-5 p-7 transition hover:border-cyan/40">
                <Icon name={c.icon} className="h-8 w-8 shrink-0 text-cyan" />
                <div><h3 className="group-hover:text-cyan">{c.name}</h3><p className="mt-2 text-slate-400">{c.short_description}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-white/[0.06] bg-navy-900">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title="What makes us different" />
            <ul className="space-y-4">
              {WHY_CHOOSE.map((w) => <li key={w.title} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-cyan" aria-hidden /><span><strong className="text-white">{w.title}.</strong> <span className="text-slate-400">{w.description}</span></span></li>)}
            </ul>
          </div>
          <div>
            <SectionHeading title="Our work approach" />
            <ol className="space-y-5">
              {WORK_PROCESS.map((s, i) => <li key={s.title} className="flex gap-4"><span className="font-display text-sm text-cyan">{i + 1}</span><span><strong className="text-white">{s.title}.</strong> <span className="text-slate-400">{s.description}</span></span></li>)}
            </ol>
          </div>
        </div>
      </section>

      <CtaBand title="Why work with us? Let's talk about your goals." text="Tell us where your business is today and where you want it to be. We'll suggest a practical plan, free of charge." />
    </>
  );
}
