"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { CountUp, EASE } from "../motion";
import { FRESH_SEGMENTS } from "@/lib/data-trace";

/** Hours since picking. The bar fills segment by segment, in journey order (spec §11). */
export function FreshnessClock({ hours }: { hours: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const total = FRESH_SEGMENTS.reduce((a, s) => a + s.hours, 0);
  const start = 0.7;
  let t = start;
  const timing = FRESH_SEGMENTS.map((s) => { const d = reduce ? 0 : 0.25 + (s.hours / total) * 1.1; const at = t; t += d; return { at, d }; });
  return (
    <div ref={ref} className="glass-dark rounded-3xl p-5 text-white md:p-6">
      <div className="text-[14px] font-semibold text-lime">Freshness clock</div>
      <div className="mt-3 flex items-baseline gap-2">
        <CountUp value={`${hours} h`} className="text-[48px] font-medium leading-none tracking-[-0.03em] md:text-[56px]" duration={1.4} />
        <span className="text-[14px] text-white/75">since picking</span>
      </div>
      <div className="mt-4 flex gap-1.5" role="img" aria-label={FRESH_SEGMENTS.map((s) => `${s.label} ${s.hours} hours`).join(", ")}>
        {FRESH_SEGMENTS.map((s, i) => (
          <div key={s.label} className="h-3 overflow-hidden rounded-full bg-white/10" style={{ flexGrow: s.hours, flexBasis: 0 }}>
            <motion.div className="h-full w-full origin-left rounded-full" style={{ background: s.color }} initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: inView || reduce ? 1 : 0 }} transition={{ duration: timing[i].d, delay: timing[i].at, ease: i === FRESH_SEGMENTS.length - 1 ? EASE : "linear" }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
        {FRESH_SEGMENTS.map((s, i) => (
          <motion.span key={s.label} className="inline-flex items-center gap-1.5" initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: inView || reduce ? 1 : 0 }} transition={{ duration: 0.25, delay: timing[i].at + timing[i].d }}>
            <span className="h-2 w-2 rounded-[3px]" style={{ background: s.color }} />{s.label}<span className="tabular text-white/60">{s.hours} h</span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}
