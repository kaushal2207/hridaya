"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";

export function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const t = items[i];
  return (
    <div className="panel relative mx-auto max-w-3xl p-8 sm:p-12">
      <Quote className="h-10 w-10 text-electric" aria-hidden />
      {t.is_demo && <span className="absolute right-6 top-6 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">Demo placeholder, not a real review</span>}
      <blockquote className="mt-6 font-display text-xl font-normal leading-relaxed text-white sm:text-2xl" aria-live="polite">“{t.quote}”</blockquote>
      {t.rating ? <div className="mt-5 flex gap-1" aria-label={`${t.rating} out of 5`}>{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden />)}</div> : null}
      <div className="mt-6 flex items-center gap-4">
        {t.photo_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.photo_url} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" loading="lazy" />}
        <div><p className="font-semibold text-white">{t.author_name}</p><p className="text-sm text-slate-400">{[t.designation, t.company_name].filter(Boolean).join(", ")}</p></div>
      </div>
      {items.length > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <button type="button" aria-label="Previous testimonial" onClick={() => setI((i - 1 + items.length) % items.length)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-cyan"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Next testimonial" onClick={() => setI((i + 1) % items.length)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-cyan"><ChevronRight className="h-5 w-5" /></button>
          <span className="ml-2 text-sm text-slate-400">{i + 1} / {items.length}</span>
        </div>
      )}
    </div>
  );
}
