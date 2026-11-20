import { PageHero } from "@/components/site/PageHero";
import { ScoreTool } from "@/components/seo/ScoreTool";
import { pageMetadata } from "@/lib/seo-meta";

export const generateMetadata = () => pageMetadata("/seo-tools/score", "Free SEO Score Checker", "See how well a page targets a keyword, and how it compares with a competitor page.");

export default function Page() {
  return (
    <>
      <PageHero title="SEO Score Checker" crumbs={[{ name: "AI SEO Tools", path: "/seo-tools" }, { name: "SEO Score Checker", path: "/seo-tools/score" }]} description="See how well a page targets a keyword, and how it compares with a competitor page." />
      <section className="section pt-2"><div className="wrap max-w-5xl"><ScoreTool /></div></section>
    </>
  );
}
