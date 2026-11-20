"use client";
import { createContext, useCallback, useContext, useState } from "react";

type T = { id: number; msg: string; kind: "ok" | "error" };
const Ctx = createContext<(msg: string, kind?: "ok" | "error") => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<T[]>([]);
  const push = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, msg, kind }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
        {list.map((t) => <div key={t.id} role="status" className={`rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${t.kind === "ok" ? "bg-emerald-500 text-navy-950" : "bg-rose-500 text-white"}`}>{t.msg}</div>)}
      </div>
    </Ctx.Provider>
  );
}
