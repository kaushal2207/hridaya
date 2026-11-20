import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="HRIDAYA IT SOLUTIONS home">
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4169FF" /><stop offset="1" stopColor="#00D4FF" /></linearGradient></defs>
        <rect width="64" height="64" rx="16" fill="url(#lg)" opacity=".14" />
        <path d="M6 34h13l5-12 8 22 6-14 4 4h16" fill="none" stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[15px] font-semibold tracking-tight text-white">HRIDAYA</span>
        {!compact && <span className="mt-1 block text-[11px] font-medium tracking-[0.08em] text-slate-400">IT Solutions</span>}
      </span>
    </Link>
  );
}
