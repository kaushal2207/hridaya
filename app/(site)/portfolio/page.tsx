import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { PortfolioGallery } from "@/components/shared/PortfolioGallery";
import { getPortfolioCategories, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/portfolio", "Portfolio", "Website development, graphic design, digital marketing, e-commerce and social media projects by HRIDAYA IT SOLUTIONS.");

export default async function Portfolio() {
  const [projects, categories] = await Promise.all([getProjects(), getPortfolioCategories()]);
  return (
    <>
      <PageHero title="Portfolio" crumbs={[{ name: "Portfolio", path: "/portfolio" }]} description="A selection of websites, designs, campaigns and e-commerce projects. Filter by category." />
      <section className="section pt-4"><div className="wrap"><PortfolioGallery projects={projects} categories={categories} /></div></section>
      <CtaBand />
    </>
  );
}
