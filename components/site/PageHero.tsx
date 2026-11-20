import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PulseLine } from "@/components/site/PulseLine";

export function PageHero({ title, description, crumbs, children }: {
  title: string; description?: string | null; crumbs: { name: string; path: string }[]; children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="aurora" /><div className="grid-lines absolute inset-0" aria-hidden />
      <PulseLine className="pointer-events-none absolute -right-20 bottom-0 h-28 w-[70%] opacity-40" />
      <div className="wrap relative">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-6 max-w-4xl">{title}</h1>
        {description && <p className="lede mt-6">{description}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
