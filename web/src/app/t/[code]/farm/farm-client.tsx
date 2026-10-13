"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { LiveMap } from "@/components/map";
import { EASE } from "@/components/motion";
import { cx } from "@/components/tokens";
import { MONTHS, PLOTS, SEASON, TRACE_FARM } from "@/lib/data-trace";

/** Plots list + satellite map. Picking a plot flies the map to it. */
export function FarmPlots() {
  const [active, setActive] = useState<string | undefined>(undefined);
  const total = PLOTS.reduce((a, p) => a + p.ha, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-10">
      <div className="flex flex-col gap-4">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-leaf"><span className="h-1.5 w-1.5 rounded-full bg-leaf" />Mapped plots</span>
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-deep md:text-[32px] lg:text-[36px]">Where it grows</h2>
        <p className="text-muted">Each plot was walked with GPS by a field officer.</p>
        <div className="flex flex-col gap-2">
          {PLOTS.map((p) => {
            const on = active === p.id;
            return (
              <button key={p.id} onClick={() => setActive(on ? undefined : p.id)} aria-pressed={on}
                className={cx("relative flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] transition-colors", on ? "text-white" : "bg-paper hover:bg-mist")}>
                {on && <motion.span layoutId="plot-on" className="absolute inset-0 rounded-xl bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative h-3 w-3 shrink-0 rounded-[4px]" style={{ background: p.color }} />
                <span className="relative flex-1 font-semibold">{p.name} · {p.crop}</span>
                <span className={cx("relative tabular", on ? "text-white/75" : "text-muted")}>{p.ha} ha</span>
              </button>
            );
          })}
        </div>
      </div>
      <LiveMap
        height="h-[360px] md:h-[460px] lg:h-[520px]"
        focus={{ lat: TRACE_FARM.lat, lng: TRACE_FARM.lng, zoom: 13.6 }}
        plots={PLOTS.map((p) => ({ id: p.id, name: p.name, coords: p.coords, color: p.color }))}
        pins={PLOTS.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, kind: "farm" as const, label: p.name, sub: p.crop }))}
        active={active}
        onPin={(id) => setActive(id)}
        live={`${PLOTS.length} plots · ${total} ha`}
        legend={PLOTS.map((p) => [p.color, p.crop] as [string, string])}
      />
    </div>
  );
}

/** Growing calendar. Each crop's bar grows from its first month, staggered (spec §9). */
export function SeasonChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const now = 9; // October
  return (
    <div ref={ref} className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <div className="min-w-[640px] rounded-[20px] bg-white p-4 md:p-6">
        <div className="grid grid-cols-[96px_repeat(12,1fr)] gap-1.5 md:grid-cols-[130px_repeat(12,1fr)]">
          <span />
          {MONTHS.map((m, i) => <span key={i} className={cx("pb-2 text-center text-[12px]", i === now ? "font-semibold text-deep" : "text-muted")}>{m}</span>)}
          {SEASON.map(([crop, color, a, b], r) => (
            <div key={crop} className="contents">
              <span className="flex items-center text-[14px] font-medium">{crop}</span>
              <div className="relative col-span-12 grid h-7 grid-cols-12 gap-1.5">
                {MONTHS.map((_, i) => <span key={i} className={cx("rounded-md", i === now ? "bg-mint" : "bg-paper")} />)}
                <motion.span
                  className="absolute inset-y-0 origin-left rounded-md"
                  style={{ background: color, left: `calc(${(a / 12) * 100}% + 1px)`, width: `calc(${((b - a + 1) / 12) * 100}% - 7px)` }}
                  initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: inView || reduce ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + r * 0.08, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px] bg-mint" />This month</div>
      </div>
    </div>
  );
}
