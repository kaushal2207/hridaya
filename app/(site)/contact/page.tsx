import { Mail, MapPin, Globe2, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getServices, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { safeHref, whatsappLink } from "@/lib/utils";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/contact", "Contact Us", "Contact HRIDAYA IT SOLUTIONS in Noida for a free consultation on websites, design, digital marketing and e-commerce.");

export default async function Contact() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const wa = whatsappLink(settings.contact.whatsapp);
  const map = safeHref(settings.contact.map_embed_url);
  return (
    <>
      <PageHero title="Let's talk about your project" crumbs={[{ name: "Contact Us", path: "/contact" }]}
        description="Share a few details and we'll come back with ideas and a clear quote. Consultations are free." />
      <section className="section pt-4">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
          <div className="space-y-6">
            <div className="panel p-7">
              <ul className="space-y-5 text-slate-300">
                <li className="flex gap-3"><Mail className="mt-1 h-5 w-5 text-cyan" aria-hidden /><div><p className="text-sm text-slate-400">Email</p><a href={`mailto:${settings.contact.email}`} className="break-all font-semibold text-white hover:text-cyan">{settings.contact.email}</a></div></li>
                {wa && <li className="flex gap-3"><MessageCircle className="mt-1 h-5 w-5 text-cyan" aria-hidden /><div><p className="text-sm text-slate-400">WhatsApp</p><a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-cyan">Chat with us</a></div></li>}
                <li className="flex gap-3"><MapPin className="mt-1 h-5 w-5 text-cyan" aria-hidden /><div><p className="text-sm text-slate-400">Location</p><p className="font-semibold text-white">{settings.company.location}</p></div></li>
                <li className="flex gap-3"><Globe2 className="mt-1 h-5 w-5 text-cyan" aria-hidden /><div><p className="text-sm text-slate-400">Service coverage</p><p className="font-semibold text-white">All India (remote services)</p></div></li>
              </ul>
            </div>
            {map && <iframe title="HRIDAYA IT SOLUTIONS location in Noida" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-2xl border border-white/10" />}
          </div>
          <EnquiryForm formType="general" services={services.map((s) => ({ slug: s.slug, name: s.name }))} title="Send us an enquiry" />
        </div>
      </section>
    </>
  );
}
