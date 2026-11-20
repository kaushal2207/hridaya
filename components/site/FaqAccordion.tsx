"use client";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs, light = false }: { faqs: { question: string; answer: string }[]; light?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className={cn("divide-y border-y", light ? "divide-slate-200 border-slate-200" : "divide-white/10 border-white/10")}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3 className="!font-sans !text-base sm:!text-lg">
              <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className={cn("flex w-full items-center justify-between gap-6 py-5 text-left font-semibold", light ? "text-navy-950" : "text-white")}>
                {f.question}
                <Plus className={cn("h-5 w-5 shrink-0 text-electric transition-transform duration-300", isOpen && "rotate-45")} aria-hidden />
              </button>
            </h3>
            <div id={`${id}-${i}`} role="region" hidden={!isOpen} className={cn("max-w-[70ch] pb-6", light ? "text-slate-600" : "text-slate-300")}>{f.answer}</div>
          </div>
        );
      })}
    </div>
  );
}
