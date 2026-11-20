"use client";
import { motion, useReducedMotion } from "framer-motion";

export const scoreColor = (v: number) => (v >= 80 ? "#34d399" : v >= 50 ? "#fbbf24" : "#fb7185");

export function ScoreGauge({ value, label = "Overall SEO score", size = 200 }: { value: number; label?: string; size?: number }) {
  const reduce = useReducedMotion();
  const r = 80, c = Math.PI * r; // half circle
  return (
    <figure className="flex flex-col items-center" aria-label={`${label}: ${value} out of 100`}>
      <svg viewBox="0 0 200 120" width={size} height={size * 0.6} aria-hidden>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="16" strokeLinecap="round" />
        <motion.path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={scoreColor(value)} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: reduce ? c * (1 - value / 100) : c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.2, ease: "easeOut" }} />
        <text x="100" y="92" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="600" fontFamily="Unbounded, sans-serif">{value}</text>
      </svg>
      <figcaption className="mt-1 text-sm text-slate-400">{label}</figcaption>
    </figure>
  );
}

export function Bar({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-slate-300">{label}{note && <span className="ml-2 text-xs text-slate-500">{note}</span>}</span><span className="font-semibold text-white">{value}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <motion.div className="h-full rounded-full" style={{ background: scoreColor(value) }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}
