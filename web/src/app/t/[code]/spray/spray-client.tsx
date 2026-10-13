"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Icon } from "@/components/icon";
import { CountUp, EASE } from "@/components/motion";
import { SAFE_GAP } from "@/lib/data-trace";

/** Safe-gap bar: the waiting period fills first, then the extra days past it, then the check pops. */
export function SafeGap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const g = SAFE_GAP;
  const wait = (g.needed / g.span) * 100, extra = ((g.actual - g.needed) / g.span) * 100;
  const go = inView || !!reduce;
  return (
    <div ref={ref} className="flex flex-col gap-5 rounded-[28px] bg-deep p-5 text-white md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[15px] text-white/80">Harvested <CountUp value={`${g.actual} days`} /> after the last spray</div>
          <motion.div className="mt-1 text-[44px] font-medium leading-none tracking-[-0.03em] text-lime md:text-[64px]" initial={{ opacity: 0, y: 12 }} animate={go ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : 1.6 }}>Safe to eat</motion.div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px]"><Icon name="shield-check" size={15} className="text-lime" />Needs at least {g.needed} days</span>
      </div>
      <div className="relative h-11 overflow-hidden rounded-xl bg-forest" role="img" aria-label={`Waited ${g.actual} days. ${g.needed} days needed.`}>
        <motion.div className="absolute inset-y-0 left-0 flex origin-left items-center rounded-l-xl bg-sun px-3 text-[13px] font-semibold text-night" style={{ width: `${wait}%` }}
          initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: go ? 1 : 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: go ? 1 : 0 }} transition={{ delay: reduce ? 0 : 0.9 }} className="whitespace-nowrap">Waiting · {g.needed} days</motion.span>
        </motion.div>
        <motion.div className="absolute inset-y-0 flex origin-left items-center justify-center bg-lime text-night" style={{ left: `${wait}%`, width: `${extra}%` }}
          initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: go ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 1.3 }}>
          <motion.span initial={{ scale: 0 }} animate={{ scale: go ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: reduce ? 0 : 1.65 }}><Icon name="check" size={18} /></motion.span>
        </motion.div>
      </div>
      <div className="relative h-5 text-[12px] md:text-[13px]">
        <span className="absolute left-0 text-white/75">{g.lastSpray} · last spray</span>
        <span className="absolute hidden -translate-x-1/2 text-white/75 sm:block" style={{ left: `${wait}%` }}>{g.safeOn} · safe</span>
        <span className="absolute right-0 text-lime">{g.picked} · picked</span>
      </div>
    </div>
  );
}
