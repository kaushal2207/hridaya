import { cn } from "@/lib/utils";

export function SectionHeading({ title, intro, align = "left", light = false, id }: { title: string; intro?: string | null; align?: "left" | "center"; light?: boolean; id?: string }) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" && "mx-auto text-center")}>
      <h2 id={id} className={light ? "text-navy-950" : undefined}>{title}</h2>
      {intro && <p className={cn("mt-5 text-lg", light ? "text-slate-600" : "text-slate-300", align === "center" && "mx-auto max-w-[60ch]")}>{intro}</p>}
    </div>
  );
}
