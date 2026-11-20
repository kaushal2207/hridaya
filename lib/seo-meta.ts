import type { Metadata } from "next";
import { SITE_URL } from "@/lib/env";
import { getPageSeo } from "@/lib/data";

/** Builds page metadata; admin overrides in the page_seo table win over code defaults. */
export async function pageMetadata(path: string, title: string, description: string, image?: string | null): Promise<Metadata> {
  const o = await getPageSeo(path);
  const t = o?.title || title;
  const d = o?.description || description;
  const img = o?.og_image_url || image || `${SITE_URL}/opengraph-image`;
  const canonical = o?.canonical_url || `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title: t,
    description: d,
    alternates: { canonical },
    robots: o?.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title: t, description: d, url: canonical, siteName: "HRIDAYA IT SOLUTIONS", images: [{ url: img }], locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title: t, description: d, images: [img] },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function organizationLd(email: string, social: Record<string, string | null>) {
  return {
    "@context": "https://schema.org", "@type": "ProfessionalService", "@id": `${SITE_URL}/#org`,
    name: "HRIDAYA IT SOLUTIONS", url: SITE_URL, email, slogan: "Your Complete Digital Growth Partner.",
    address: { "@type": "PostalAddress", addressLocality: "Noida", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
    areaServed: { "@type": "Country", name: "India" },
    sameAs: Object.values(social).filter(Boolean),
  };
}

export function serviceLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org", "@type": "Service", name, description, url: `${SITE_URL}${path}`,
    provider: { "@id": `${SITE_URL}/#org` }, areaServed: { "@type": "Country", name: "India" },
  };
}

export function faqLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}
