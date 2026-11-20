import { PageHero } from "@/components/site/PageHero";
import { AuditTool } from "@/components/seo/AuditTool";
import { pageMetadata } from "@/lib/seo-meta";

export const generateMetadata = () => pageMetadata("/seo-tools/audit", "Free Website SEO Audit", "Enter any URL for an instant check of titles, meta tags, headings, canonical, indexability, images, links, structured data, HTTPS, mobile and speed.");

export default function Page() {
  return (
    <>
      <PageHero title="Website SEO Audit" crumbs={[{ name: "AI SEO Tools", path: "/seo-tools" }, { name: "Website SEO Audit", path: "/seo-tools/audit" }]} description="Enter any URL for an instant check of titles, meta tags, headings, canonical, indexability, images, links, structured data, HTTPS, mobile and speed." />
      <section className="section pt-2"><div className="wrap max-w-5xl"><AuditTool /></div></section>
    </>
  );
}
