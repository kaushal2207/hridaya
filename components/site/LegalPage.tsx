import { PageHero } from "@/components/site/PageHero";

export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero title={title} crumbs={[{ name: title, path }]} description={`Last updated: ${updated}`} />
      <section className="pb-24"><div className="wrap prose-hridaya">{children}
        <p className="mt-10 text-sm text-slate-500">This page is a general template. Have it reviewed by a legal professional before relying on it.</p></div></section>
    </>
  );
}
