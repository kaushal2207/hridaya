import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { ClientDirectory } from "@/components/shared/ClientDirectory";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { DemoBadge, EmptyState } from "@/components/shared/Cards";
import { getCaseStudies, getClients, getIndustries, getTestimonials } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/clients", "Our Clients", "Businesses across India that HRIDAYA IT SOLUTIONS has worked with on websites, branding, marketing and e-commerce.");

const FILTERS = ["healthcare-medical", "fashion-jewellery", "ecommerce-retail", "education", "real-estate", "technology", "professional-services", "other"];

export default async function ClientsPage() {
  const [clients, industries, cases, testimonials] = await Promise.all([getClients(), getIndustries(), getCaseStudies(), getTestimonials()]);
  const filters = FILTERS.map((s) => industries.find((i) => i.slug === s)).filter(Boolean) as typeof industries;
  const clientTestimonials = testimonials.filter((t) => t.client_id);
  return (
    <>
      <PageHero title="Our Clients. Our Partnerships. Our Work." crumbs={[{ name: "Clients", path: "/clients" }]}
        description="We work with businesses across India, helping them build stronger brands, powerful websites, creative identities and successful digital businesses.">
        <a href="#directory" className="btn-primary">Explore Our Clients</a>
        <Link href="/contact" className="btn-ghost">Start Your Project</Link>
      </PageHero>

      <section id="directory" className="section scroll-mt-24 pt-4" aria-labelledby="dir-h">
        <div className="wrap"><SectionHeading id="dir-h" title="Client showcase" intro="Filter by industry. Select a client to see what we did for them." />
          <ClientDirectory clients={clients} industries={filters} /></div>
      </section>

      <section className="section light-section" aria-labelledby="cs-h">
        <div className="wrap">
          <SectionHeading id="cs-h" light title="Client case studies" intro="The challenge, what we did and what changed, with results only where they're verified." />
          {cases.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {cases.map((c) => (
                <Link key={c.id} href={`/clients/case-studies/${c.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {(c.after_image_url || c.before_image_url) && <Image src={(c.after_image_url || c.before_image_url)!} alt={c.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />}
                    {c.client?.is_demo && <DemoBadge className="absolute left-3 top-3 !bg-amber-100 !text-amber-800" />}
                  </div>
                  <div className="p-6"><p className="text-sm font-semibold text-electric">{c.client?.client_name}</p><h3 className="mt-2 group-hover:text-electric">{c.title}</h3>{c.summary && <p className="mt-2 text-slate-600">{c.summary}</p>}</div>
                </Link>
              ))}
            </div>
          ) : <p className="text-slate-600">Case studies will be published here as client projects are documented.</p>}
        </div>
      </section>

      <section className="section" aria-labelledby="ct-h">
        <div className="wrap"><SectionHeading id="ct-h" align="center" title="Client testimonials" />
          {clientTestimonials.length ? <TestimonialSlider items={clientTestimonials} /> : <EmptyState title="Testimonials coming soon" text="We only publish genuine feedback from our clients." />}</div>
      </section>

      <CtaBand title="Let's Make Your Business Our Next Success Story." text="Have a project in mind? Let's discuss how HRIDAYA IT SOLUTIONS can help your business grow." secondary={null} />
    </>
  );
}
