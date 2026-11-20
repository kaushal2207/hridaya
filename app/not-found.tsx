import Link from "next/link";
import { PulseLine } from "@/components/site/PulseLine";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <div className="aurora" />
      <PulseLine className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 opacity-30" />
      <div className="wrap relative">
        <p className="font-display text-7xl font-semibold text-white/90 sm:text-9xl">404</p>
        <h1 className="mt-6 !text-3xl sm:!text-4xl">This page doesn’t exist</h1>
        <p className="mt-4 max-w-md text-slate-300">The link may be broken or the page may have moved. Try the homepage, our services, or search the site.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="btn-primary">Go to homepage</Link><Link href="/services" className="btn-ghost">View services</Link><Link href="/search" className="btn-ghost">Search</Link></div>
      </div>
    </main>
  );
}
