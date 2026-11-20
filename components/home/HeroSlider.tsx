"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PulseLine } from "@/components/site/PulseLine";
import type { Slide } from "@/lib/types";
import { cn } from "@/lib/utils";

const DELAY = 6500;

function Visual({ variant }: { variant: string }) {
  // Four abstract visuals, one per slide theme. Pure SVG/CSS: no image weight, no layout shift.
  if (variant === "grid") return (
    <div className="relative aspect-square w-full max-w-[460px]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass absolute rounded-2xl" style={{ inset: `${i * 12}%`, transform: `rotate(${i * 6 - 6}deg)`, opacity: 1 - i * 0.2 }}>
          <div className="m-4 h-2 w-1/3 rounded-full bg-gradient-to-r from-electric to-cyan" />
          <div className="mx-4 h-2 w-1/2 rounded-full bg-white/15" /><div className="mx-4 mt-2 h-2 w-2/5 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
  if (variant === "marketplace") return (
    <div className="relative grid aspect-square w-full max-w-[460px] grid-cols-2 gap-4 p-6">
      {["Amazon", "Myntra", "Flipkart", "Shopify"].map((m, i) => (
        <div key={m} className="glass flex animate-drift flex-col justify-between rounded-2xl p-5" style={{ animationDelay: `${i * -2}s` }}>
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-electric to-violet" />
          <span className="font-display text-sm text-white">{m}</span>
        </div>
      ))}
    </div>
  );
  if (variant === "pulse") return (
    <div className="relative flex aspect-square w-full max-w-[460px] items-center justify-center">
      {[1, 0.75, 0.5].map((s, i) => <span key={i} className="absolute rounded-full border border-cyan/25" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />)}
      <span className="h-24 w-24 rounded-full bg-gradient-to-br from-electric via-cyan to-violet opacity-80 blur-[2px]" />
    </div>
  );
  return (
    <div className="relative flex aspect-square w-full max-w-[460px] items-center justify-center">
      <span className="absolute inset-[6%] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-electric/40" />
      <span className="absolute inset-[22%] animate-[spin_28s_linear_infinite_reverse] rounded-full border border-cyan/30" />
      <span className="absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-cyan shadow-[0_0_20px_#00D4FF]" />
      <span className="absolute bottom-[18%] right-[16%] h-2.5 w-2.5 rounded-full bg-violet shadow-[0_0_20px_#8B5CF6]" />
      <div className="glass flex h-40 w-40 items-center justify-center rounded-[2rem]">
        <svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden><path d="M6 34h13l5-12 8 22 6-14 4 4h16" fill="none" stroke="#00D4FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    if (paused || reduce || n < 2) return;
    const t = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go, n]);

  const s = slides[i];
  const Heading = i === 0 ? "h1" : "p";

  return (
    <section aria-roledescription="carousel" aria-label="Highlights" className="relative isolate overflow-hidden pt-[72px]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      <div className="aurora" /><div className="grid-lines absolute inset-0" aria-hidden />
      <PulseLine className="pointer-events-none absolute inset-x-0 bottom-10 h-40 w-full opacity-70" />
      <div className="wrap relative grid min-h-[min(820px,calc(100svh-72px))] items-center gap-10 py-16 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-h-[360px] sm:min-h-[400px]" aria-live={paused ? "polite" : "off"}>
          <AnimatePresence mode="wait">
            <motion.div key={s.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}
              initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              {s.eyebrow && <p className="mb-5 text-[15px] font-medium text-cyan">{s.eyebrow}</p>}
              <Heading className="font-display text-[2.15rem] font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[4.1rem]" style={{ letterSpacing: "-0.02em" }}>{s.heading}</Heading>
              {s.description && <p className="lede mt-6">{s.description}</p>}
              <div className="mt-9 flex flex-wrap gap-3">
                {s.primary_cta_label && s.primary_cta_href && <Link href={s.primary_cta_href} className="btn-primary">{s.primary_cta_label}</Link>}
                {s.secondary_cta_label && s.secondary_cta_href && <Link href={s.secondary_cta_href} className="btn-ghost">{s.secondary_cta_label}</Link>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hidden justify-center lg:flex">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} className="w-full" initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0, scale: 0.97 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center"><Visual variant={s.visual_variant} /></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {n > 1 && (
        <div className="wrap relative -mt-6 flex items-center gap-4 pb-10">
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-cyan"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-cyan"><ChevronRight className="h-5 w-5" /></button>
          <div className="ml-2 flex gap-2" role="tablist" aria-label="Choose slide">
            {slides.map((sl, k) => (
              <button key={sl.id} type="button" role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className="group py-3">
                <span className={cn("block h-1 rounded-full transition-all duration-500", k === i ? "w-10 bg-gradient-to-r from-electric to-cyan" : "w-5 bg-white/25 group-hover:bg-white/50")} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
