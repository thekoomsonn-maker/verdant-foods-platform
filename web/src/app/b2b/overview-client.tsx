"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { AreaChart, Legend } from "@/components/charts";
import { Icon } from "@/components/icon";
import { Panel } from "@/components/portal/shell";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { StatusFor, Thumb } from "@/components/b2b/kit";
import { R } from "@/lib/routes";

export function SpendChart() {
  return (
    <Panel title="Spend vs market price">
      <AreaChart values={[31, 33.5, 32, 38, 36.4, 42, 40.5, 48.6]} compare={[33, 36, 35.5, 41, 40.2, 45.6, 44.8, 52.8]} labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
        tip={["GH₵ 48,620", "You saved GH₵ 4,210"]} height={210} fmt={(v) => `GH₵ ${Math.round(v * 1000).toLocaleString("en-GH")}`} />
      <Legend items={[["#024639", "You paid"], ["#C9D3CE", "Market price"]]} />
    </Panel>
  );
}

const DAYS: [string, number, string[][]][] = [
  ["Mon", 12, [["tomatoes", "Tomatoes · 480 kg", "6:04 am · Nyankpala", "Delivered"]]],
  ["Tue", 13, [["tomatoes", "Tomatoes · 120 kg", "6:00 am · Nyankpala", "On the way"], ["onions", "Red onions · 80 kg", "6:00 am · Savelugu", "On the way"], ["kontomire", "Kontomire · 40 bunches", "Thu · Nadowli", "Packed"]]],
  ["Wed", 14, []],
  ["Thu", 15, [["okra", "Okra · 120 kg", "6:00 am · Wa", "Packed"], ["tomatoes", "Tomatoes · 120 kg", "6:00 am · Nyankpala", "Packed"]]],
  ["Fri", 16, [["onions", "Red onions · 300 kg", "6:00 am · Savelugu", "Packed"]]],
  ["Sat", 17, []],
];

export function NextDeliveries() {
  const [day, setDay] = useState(13);
  const items = DAYS.find((d) => d[1] === day)![2];
  return (
    <Panel title="Next deliveries" link={["Calendar", R.b2bCalendar]}>
      <LayoutGroup id="ov-days">
        <div className="grid grid-cols-6 gap-1.5">
          {DAYS.map(([w, n, it]) => {
            const on = n === day;
            return (
              <button key={n} onClick={() => setDay(n)} aria-pressed={on} className={cx("relative flex flex-col items-center gap-1 rounded-xl py-2.5 transition-colors", on ? "text-white" : "bg-paper text-ink hover:bg-mist")}>
                {on && <motion.span layoutId="ov-day" className="absolute inset-0 rounded-xl bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className={cx("relative text-[13px]", on ? "text-lime" : "text-muted")}>{w}</span>
                <span className="relative text-[17px] font-semibold tabular">{n}</span>
                <span className={cx("relative h-1.5 w-1.5 rounded-full", it.length ? (on ? "bg-lime" : "bg-leaf") : "bg-transparent")} />
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      <div className="min-h-[170px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-col gap-3">
            {items.length === 0 && <li className="py-6 text-center text-[14px] text-muted">No deliveries this day</li>}
            {items.map(([img, t, s, st], i) => (
              <motion.li key={t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={R.b2bOrders} className="flex items-center gap-3 rounded-xl transition-colors hover:bg-paper">
                  <Thumb img={img} size={40} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{t}</span><span className="block truncate text-[13px] text-muted">{s}</span></span>
                  <StatusFor s={st} />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </Panel>
  );
}

export function TracePanel() {
  const toast = useToast();
  return (
    <>
      <Link href={R.b2bReports} className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-lime transition-transform hover:rotate-[-6deg]" aria-label="Trace reports"><Icon name="file-check" size={22} /></Link>
      <Link href={R.b2bReports} className="mt-auto text-[24px] font-semibold leading-tight hover:text-lime">3 trace reports ready</Link>
      <p className="text-[15px] text-white/75">Farms, plots, handovers, weights and spray records for last week’s deliveries.</p>
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => toast("Trace report PDF for week of 6 Oct is downloading")} className="group/b inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-night transition-colors hover:bg-leaf-light active:scale-[0.97]">Download PDF <Icon name="arrow-right" size={18} className="transition-transform group-hover/b:translate-x-[3px]" /></button>
        <button onClick={() => toast("Map file (GeoJSON) for week of 6 Oct is downloading")} className="inline-flex h-11 items-center rounded-full bg-white/10 px-5 text-[15px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20 active:scale-[0.97]">Map file</button>
      </div>
    </>
  );
}
