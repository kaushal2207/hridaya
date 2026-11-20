import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { CookieConsent } from "@/components/site/CookieConsent";
import { JsonLd } from "@/components/site/JsonLd";
import { getCategories, getServices, getSettings } from "@/lib/data";
import { organizationLd } from "@/lib/seo-meta";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, categories] = await Promise.all([getSettings(), getServices(), getCategories()]);
  const groups = categories.map((c) => ({
    name: c.name,
    items: services.filter((s) => s.show_in_nav && s.category_id === c.id).map((s) => ({ name: s.name, slug: s.slug, category: c.name })),
  })).filter((g) => g.items.length);
  return (
    <>
      <JsonLd data={organizationLd(settings.contact.email, settings.social)} />
      <Header groups={groups} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <FloatingActions whatsapp={settings.contact.whatsapp} />
      <CookieConsent />
    </>
  );
}
