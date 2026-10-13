"use client";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { EASE } from "@/components/motion";
import { ProductCard } from "@/components/site/sections";
import { cx } from "@/components/tokens";
import type { Product } from "@/lib/data";
import { plotAround } from "@/lib/data";

/* ---------- Quantity stepper: the number rolls up or down ---------- */
export function QtyStepper({ value, onInc, onDec, min = 1, size = "M", className }: { value: number; onInc: () => void; onDec: () => void; min?: number; size?: "M" | "S"; className?: string }) {
  const prev = useRef(value);
  const dir = value >= prev.current ? 1 : -1;
  prev.current = value;
  const h = size === "M" ? "h-12" : "h-9";
  const b = size === "M" ? "h-10 w-10" : "h-7 w-7";
  return (
    <div className={cx("inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-line", h, className)}>
      <button onClick={onDec} disabled={value <= min} aria-label="Less" className={cx("flex items-center justify-center rounded-full text-deep transition-[background-color,transform] hover:bg-mist active:scale-90 disabled:opacity-35", b)}><Icon name="minus" size={16} /></button>
      <span className="relative w-7 overflow-hidden text-center text-[15px] font-semibold tabular" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span key={value} custom={dir} className="block" initial={{ y: dir * 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -dir * 14, opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>{value}</motion.span>
        </AnimatePresence>
      </span>
      <button onClick={onInc} aria-label="More" className={cx("flex items-center justify-center rounded-full text-deep transition-[background-color,transform] hover:bg-mist active:scale-90", b)}><Icon name="plus" size={16} /></button>
    </div>
  );
}

/* ---------- A check that draws itself (spec §10) ---------- */
export function DrawCheck({ size = 64, className, delay = 0.2 }: { size?: number; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span className={cx("inline-flex items-center justify-center rounded-full bg-lime text-night", className)} style={{ width: size, height: size }}
      initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay }}>
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" aria-hidden>
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, ease: EASE, delay: delay + 0.25 }} />
      </svg>
    </motion.span>
  );
}

/* ---------- Stars ---------- */
export function Stars({ n, size = 16, className }: { n: number; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex gap-0.5", className)} aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" fill={i <= Math.round(n) ? "#F7C33C" : "#E2E8E4"} /></svg>
      ))}
    </span>
  );
}

/* ---------- Rating bar that fills when in view ---------- */
export function RatingBars({ bars }: { bars: [number, number][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className="flex flex-1 flex-col gap-2.5">
      {bars.map(([s, pct], i) => (
        <div key={s} className="flex items-center gap-3 text-[14px]">
          <span className="w-3 font-semibold">{s}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-white">
            <motion.span className="block h-full origin-left rounded-full bg-sun" style={{ width: `${Math.max(pct, 1.5)}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: EASE }} />
          </span>
          <span className="w-9 text-right tabular text-muted">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Product grid that animates filtering (layout + exit) ---------- */
export function LiveGrid({ items, cols = 3, insertAt, insert, empty }: { items: Product[]; cols?: 3 | 4; insertAt?: number; insert?: React.ReactNode; empty?: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (!items.length) return <>{empty}</>;
  return (
    <motion.div layout={!reduce} className={cx("grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-9", cols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4")}>
      <AnimatePresence mode="popLayout" initial={true}>
        {items.flatMap((p, i) => {
          const card = (
            <motion.div key={p.slug} layout={!reduce} initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.04 }}>
              <ProductCard p={p} />
            </motion.div>
          );
          return insert && insertAt !== undefined && i === insertAt - 1 && items.length > insertAt
            ? [card, <motion.div key="__insert" layout={!reduce} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-2 md:col-span-3 lg:col-span-full">{insert}</motion.div>]
            : [card];
        })}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Verified journey mini map ---------- */
export function JourneyMap({ steps, height = "h-[190px]", plot = true, labels = true }: { steps: { title: string; lat: number; lng: number }[]; height?: string; plot?: boolean; labels?: boolean }) {
  const lats = steps.map((s) => s.lat), lngs = steps.map((s) => s.lng);
  const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
  const zoom = span > 3 ? 5.6 : span > 1 ? 6.6 : 8.6;
  return (
    <LiveMap height={height} rounded="rounded-2xl" controls={false}
      focus={{ lat: (Math.max(...lats) + Math.min(...lats)) / 2, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2, zoom }}
      plots={plot ? [{ id: "p", coords: plotAround(steps[0].lat, steps[0].lng, 0.03, 0.006) }] : []}
      routes={[{ id: "r", coords: steps.map((s) => [s.lng, s.lat]) }]}
      pins={steps.map((s, i) => ({ id: String(i), lat: s.lat, lng: s.lng, kind: i === 0 ? "farm" : i === steps.length - 1 ? "home" : s.title.includes("road") ? "van" : "handover", label: labels && (i === 0 || i === 2) ? (i === 0 ? "Farm" : "Packhouse") : undefined }))}
    />
  );
}

/* ---------- Small dropdown menu ---------- */
export function Menu<V extends string>({ value, options, onChange, className }: { value: V; options: [V, string][]; onChange: (v: V) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const label = options.find((o) => o[0] === value)?.[1];
  return (
    <div ref={ref} className={cx("relative", className)}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 text-[14px] font-semibold text-deep transition-colors hover:bg-mint">
        {label}<motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><Icon name="chevron-down" size={16} /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-12 z-20 w-[200px] origin-top-right rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)]" role="listbox">
            {options.map(([v, l]) => (
              <li key={v}><button role="option" aria-selected={v === value} onClick={() => { onChange(v); setOpen(false); }} className={cx("flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-mist", v === value && "font-semibold text-deep")}>{l}{v === value && <Icon name="check" size={16} />}</button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
