"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function StatCounter({ value, prefix, suffix, label }: { value: number; prefix?: string | null; suffix?: string | null; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setN(value); return; }
    let raf = 0; const start = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - start) / 1400); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);
  return (
    <div ref={ref} className="border-l border-white/10 pl-5">
      <p className="font-display text-4xl font-semibold text-white sm:text-5xl">{prefix}{n.toLocaleString("en-IN")}{suffix}</p>
      <p className="mt-2 text-slate-400">{label}</p>
    </div>
  );
}
