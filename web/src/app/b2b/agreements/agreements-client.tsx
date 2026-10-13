"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Panel } from "@/components/portal/shell";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { Thumb } from "@/components/b2b/kit";
import { CROP_IMG, dropsFor } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w, i) => ({ w, n: 12 + i, drops: dropsFor(new Date(2026, 9, 12 + i)) }));

export function WeekStrip() {
  const [day, setDay] = useState(15);
  const sel = WEEK.find((d) => d.n === day)!;
  return (
    <Panel title="This week" link={["Full calendar", R.b2bCalendar]}>
      <LayoutGroup id="ag-week">
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {WEEK.map((d) => {
            const on = d.n === day;
            return (
              <button key={d.n} onClick={() => setDay(d.n)} aria-pressed={on} className={cx("relative flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors md:py-4", on ? "text-white" : "bg-paper hover:bg-mist")}>
                {on && <motion.span layoutId="ag-day" className="absolute inset-0 rounded-xl bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className={cx("relative text-[13px]", on ? "text-lime" : "text-muted")}>{d.w}</span>
                <span className="relative text-[17px] font-semibold tabular">{d.n}</span>
                <span className={cx("relative h-1.5 w-1.5 rounded-full", d.drops.length ? (on ? "bg-lime" : "bg-leaf") : "bg-transparent")} />
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-wrap gap-2">
          {sel.drops.length === 0 && <span className="text-[14px] text-muted">No deliveries on {sel.w} {sel.n} Oct.</span>}
          {sel.drops.map((x) => (
            <span key={x.crop} className="inline-flex items-center gap-2 rounded-full bg-paper py-1 pl-1 pr-3.5 text-[14px]"><Thumb img={CROP_IMG[x.crop]} size={28} className="rounded-full" /><span className="font-semibold">{x.crop}</span><span className="text-muted">{x.qty} · {x.time}</span></span>
          ))}
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}
