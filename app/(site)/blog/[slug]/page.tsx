import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { getPost, getPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";
import { SITE_URL } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;
export async function generateStaticParams() { return (await getPosts()).map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPost(params.slug);
  if (!p) return {};
  const m = await pageMetadata(`/blog/${p.slug}`, p.seo_title || p.title, p.seo_description || p.excerpt || p.title, p.og_image_url || p.cover_image_url);
  return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: p.published_at ?? undefined } };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const p = await getPost(params.slug);
  if (!p) notFound();
  const more = (await getPosts()).filter((x) => x.id !== p.id).slice(0, 3);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.excerpt, image: p.cover_image_url ?? undefined, datePublished: p.published_at, dateModified: p.updated_at, author: { "@type": "Organization", name: p.author_name || "HRIDAYA IT SOLUTIONS" }, publisher: { "@id": `${SITE_URL}/#org` }, mainEntityOfPage: `${SITE_URL}/blog/${p.slug}` }} />
      <article className="pb-10 pt-32 sm:pt-40">
        <header className="wrap max-w-3xl">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }]} />
          <h1 className="mt-6 !text-3xl sm:!text-5xl">{p.title}</h1>
          <p className="mt-5 text-slate-400">{[p.author_name, formatDate(p.published_at), p.reading_minutes ? `${p.reading_minutes} min read` : null].filter(Boolean).join(", ")}</p>
        </header>
        {p.cover_image_url && <div className="wrap mt-10 max-w-5xl"><Image src={p.cover_image_url} alt={p.cover_alt || ""} width={1600} height={900} priority className="aspect-[16/9] w-full rounded-3xl object-cover" /></div>}
        <div className="wrap prose-hridaya mt-12 max-w-3xl text-lg">
          <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} target={href?.startsWith("http") ? "_blank" : undefined}>{children}</a> }}>{p.content}</ReactMarkdown>
        </div>
        {p.tags.length > 0 && <div className="wrap mt-10 flex max-w-3xl flex-wrap gap-2">{p.tags.map((t) => <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full border border-white/15 px-3 py-1 text-sm text-slate-300 hover:border-cyan">#{t}</Link>)}</div>}
      </article>
      {more.length > 0 && <section className="wrap max-w-3xl border-t border-white/10 py-12"><h2 className="!text-2xl">Keep reading</h2><ul className="mt-6 space-y-4">{more.map((m) => <li key={m.id}><Link href={`/blog/${m.slug}`} className="text-lg text-white hover:text-cyan">{m.title}</Link></li>)}</ul></section>}
      <CtaBand />
    </>
  );
}
