import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { EmptyState } from "@/components/shared/Cards";
import { getPosts, searchPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("/blog", "Blog", "Practical guides on websites, SEO, digital marketing and selling on Amazon, Myntra, Flipkart and Shopify.");

export default async function Blog({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const q = (searchParams.q ?? "").slice(0, 80).trim();
  let posts = q ? await searchPosts(q) : await getPosts();
  if (searchParams.tag) posts = posts.filter((p) => p.tags.includes(searchParams.tag!));
  return (
    <>
      <PageHero title="Blog" crumbs={[{ name: "Blog", path: "/blog" }]} description="Practical guides for growing your business online.">
        <form action="/blog" className="flex w-full max-w-md gap-2" role="search">
          <label htmlFor="bq" className="sr-only">Search articles</label>
          <input id="bq" name="q" defaultValue={q} placeholder="Search articles" className="field" />
          <button className="btn-primary shrink-0">Search</button>
        </form>
      </PageHero>
      <section className="section pt-4"><div className="wrap">
        {q && <p className="mb-8 text-slate-400">{posts.length} result(s) for “{q}”. <Link href="/blog" className="text-cyan">Clear search</Link></p>}
        {posts.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.id} className="group relative flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-navy-800">
                  {p.cover_image_url && <Image src={p.cover_image_url} alt={p.cover_alt || ""} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />}
                </div>
                <p className="mt-5 text-sm text-slate-400">{formatDate(p.published_at)}{p.reading_minutes ? `, ${p.reading_minutes} min read` : ""}</p>
                <h2 className="mt-2 !text-xl"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-cyan">{p.title}</Link></h2>
                {p.excerpt && <p className="mt-2 line-clamp-3 text-slate-400">{p.excerpt}</p>}
              </article>
            ))}
          </div>
        ) : <EmptyState title={q ? "No articles found" : "Articles coming soon"} text={q ? "Try a different search term." : "New articles will appear here once they're published from the admin dashboard."} />}
      </div></section>
    </>
  );
}
