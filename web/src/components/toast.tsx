"use client";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon";

type Toast = { id: number; text: string; tone: "success" | "info" | "danger" };
const Ctx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
/** const toast = useToast(); toast("Saved") — slides up, dismisses after 4 s, pauses on hover (spec §7). */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const drop = (id: number) => setItems((t) => t.filter((x) => x.id !== id));
  const arm = (id: number) => timers.current.set(id, setTimeout(() => drop(id), 4000));
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t.slice(-2), { id, text, tone }]);
    arm(id);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:items-end">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => clearTimeout(timers.current.get(t.id))} onMouseLeave={() => arm(t.id)}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-night px-4 py-3 text-[14px] font-medium text-white shadow-[var(--shadow-3)]" role="status">
              <span className={t.tone === "danger" ? "text-tomato" : "text-lime"}><Icon name={t.tone === "danger" ? "circle-alert" : t.tone === "info" ? "info" : "circle-check"} size={18} /></span>{t.text}
              <button onClick={() => drop(t.id)} aria-label="Dismiss" className="ml-1 text-white/60 hover:text-white"><Icon name="x" size={16} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
