import { PageHero } from "@/components/site/PageHero";
import { KeywordTool } from "@/components/seo/KeywordTool";
import { pageMetadata } from "@/lib/seo-meta";

export const generateMetadata = () => pageMetadata("/seo-tools/keywords", "Free Keyword Research Tool", "Get primary, secondary, long-tail and local keyword ideas grouped by search intent, plus title and meta description suggestions.");

export default function Page() {
  return (
    <>
      <PageHero title="Keyword Research Tool" crumbs={[{ name: "AI SEO Tools", path: "/seo-tools" }, { name: "Keyword Research Tool", path: "/seo-tools/keywords" }]} description="Get primary, secondary, long-tail and local keyword ideas grouped by search intent, plus title and meta description suggestions." />
      <section className="section pt-2"><div className="wrap max-w-5xl"><KeywordTool /></div></section>
    </>
  );
}
