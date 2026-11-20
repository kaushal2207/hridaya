import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { getClients, getPosts, getProjects, getServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo-meta";

export async function generateMetadata() { return { ...(await pageMetadata("/search", "Search", "Search services, projects, clients and articles.")), robots: { index: false, follow: true } }; }

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const term = q.toLowerCase();
  const has = (...s: (string | null | undefined)[]) => s.some((x) => x?.toLowerCase().includes(term));
  const [services, projects, clients, posts] = q ? await Promise.all([getServices(), getProjects(), getClients(), getPosts()]) : [[], [], [], []];
  const groups = [
    { name: "Services", items: services.filter((s) => has(s.name, s.short_description, s.intro)).map((s) => ({ href: `/services/${s.slug}`, title: s.name, text: s.short_description })) },
    { name: "Portfolio", items: projects.filter((p) => has(p.title, p.summary)).map((p) => ({ href: `/portfolio/${p.slug}`, title: p.title, text: p.summary })) },
    { name: "Clients", items: clients.filter((c) => has(c.client_name, c.short_description)).map((c) => ({ href: `/clients/${c.slug}`, title: c.client_name, text: c.short_description })) },
    { name: "Articles", items: posts.filter((p) => has(p.title, p.excerpt, p.content)).map((p) => ({ href: `/blog/${p.slug}`, title: p.title, text: p.excerpt })) },
  ];
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <PageHero title="Search" crumbs={[{ name: "Search", path: "/search" }]}>
        <form action="/search" role="search" className="flex w-full max-w-xl gap-2">
          <label htmlFor="sq" className="sr-only">Search the site</label>
          <input id="sq" name="q" defaultValue={q} autoFocus placeholder="Try “Shopify” or “SEO”" className="field" />
          <button className="btn-primary shrink-0">Search</button>
        </form>
      </PageHero>
      <section className="pb-24"><div className="wrap max-w-3xl">
        {q && <p className="mb-8 text-slate-400">{total} result(s) for “{q}”</p>}
        {groups.filter((g) => g.items.length).map((g) => (
          <div key={g.name} className="mb-10"><h2 className="!text-xl">{g.name}</h2>
            <ul className="mt-4 divide-y divide-white/10">{g.items.map((it) => <li key={it.href} className="py-4"><Link href={it.href} className="text-lg font-semibold text-white hover:text-cyan">{it.title}</Link>{it.text && <p className="mt-1 text-slate-400">{it.text}</p>}</li>)}</ul></div>
        ))}
        {q && !total && <p className="text-slate-300">Nothing matched. Try a broader term, or <Link href="/contact" className="text-cyan">ask us directly</Link>.</p>}
      </div></section>
    </>
  );
}
