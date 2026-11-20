"use client";
import { useMemo, useState } from "react";
import { ClientTile, ClientPlaceholders } from "@/components/shared/Cards";
import type { Client, Industry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ClientDirectory({ clients, industries }: { clients: Client[]; industries: Industry[] }) {
  const [ind, setInd] = useState("all");
  const list = useMemo(() => (ind === "all" ? clients : clients.filter((c) => c.industry?.slug === ind)), [ind, clients]);
  if (!clients.length) return <ClientPlaceholders count={8} />;
  return (
    <div>
      <div role="tablist" aria-label="Filter clients by industry" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ slug: "all", name: "All Clients" }, ...industries].map((c) => (
          <button key={c.slug} type="button" role="tab" aria-selected={ind === c.slug} onClick={() => setInd(c.slug)}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition", ind === c.slug ? "border-transparent bg-white text-navy-950" : "border-white/15 text-slate-300 hover:border-white/40")}>
            {c.name}
          </button>
        ))}
      </div>
      {list.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map((c) => <ClientTile key={c.id} c={c} />)}</div>
        : <p className="text-slate-400">No clients in this industry yet.</p>}
    </div>
  );
}
