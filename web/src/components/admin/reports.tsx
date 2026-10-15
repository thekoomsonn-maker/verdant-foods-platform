"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PortalShell, ADM, Panel } from "../portal/shell";
import { AreaChart, Legend } from "../charts";
import { Stagger } from "../motion";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { useToast } from "../toast";
import { AUTO_REPORTS, REPORTS, SALES_30, SALES_PREV } from "@/lib/data-admin-ops";
import { R } from "@/lib/routes";
import { Switch } from "./widgets";

const RANGES: Record<string, { n: number; labels: string[] }> = {
  "Last 7 days": { n: 7, labels: ["7 Oct", "9 Oct", "11 Oct", "13 Oct"] },
  "Last 30 days": { n: 30, labels: ["14 Sep", "21 Sep", "28 Sep", "5 Oct", "13 Oct"] },
};
const ghs = (v: number) => `GH₵ ${Math.round(v * 1000).toLocaleString("en-GH")}`;

export function AdminReports() {
  const toast = useToast();
  const [range, setRange] = useState("Last 30 days");
  const [open, setOpen] = useState(false);
  const [got, setGot] = useState<Record<string, boolean>>({});
  const [auto, setAuto] = useState(() => AUTO_REPORTS.map((a) => a.on));
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const r = RANGES[range];
  const vals = SALES_30.slice(-r.n), prev = SALES_PREV.slice(-r.n);

  return (
    <PortalShell cfg={ADM} active="Reports" title="Reports" sub="Download, schedule or share."
      actions={
        <div ref={menu} className="relative">
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold text-deep transition-colors hover:bg-mist">
            {range}<Icon name="chevron-down" size={16} className={cx("transition-transform duration-200", open && "rotate-180")} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, scale: 0.96, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }} className="absolute left-0 z-20 mt-2 w-48 origin-top rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)] md:left-auto md:right-0">
                {Object.keys(RANGES).map((k) => (
                  <button key={k} onClick={() => { setRange(k); setOpen(false); }} className={cx("flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-medium hover:bg-paper", k === range && "text-deep")}>{k}{k === range && <Icon name="check" size={16} />}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }>
      <Stagger className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {REPORTS.map((t) => (
          <div key={t.t} className={cx("group/r relative flex h-full flex-col gap-1.5 rounded-[20px] p-5 transition-transform duration-300 hover:-translate-y-1", t.bg)}>
            <div className="mb-4 flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-deep"><Icon name={t.icon} size={20} /></span>
              <button onClick={() => { setGot((g) => ({ ...g, [t.t]: true })); toast(`${t.t} report for ${range.toLowerCase()} is downloading`); }} aria-label={`Download ${t.t} report`}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-deep transition-transform duration-150 hover:scale-105 active:scale-95">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={got[t.t] ? "y" : "n"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}><Icon name={got[t.t] ? "check" : "download"} size={18} /></motion.span>
                </AnimatePresence>
              </button>
            </div>
            <Link href={R[t.href]} className="text-[19px] font-semibold after:absolute after:inset-0 after:rounded-[20px]">{t.t}</Link>
            <span className="text-[14px] text-muted">{t.s}</span>
          </div>
        ))}
      </Stagger>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel title={`Sales, ${range.toLowerCase()}`}>
          <AreaChart key={range} values={vals} compare={prev} labels={r.labels} tip={[ghs(vals[vals.length - 1]), "Today"]} fmt={ghs} height={200} />
          <Legend items={[["#024639", "This period"], ["#C9D3CE", "Last period"]]} />
        </Panel>
        <Panel title="Sent automatically">
          <div className="flex flex-col gap-5">
            {AUTO_REPORTS.map((a, i) => (
              <div key={a.t} className="flex items-center justify-between gap-4">
                <div><div className="text-[15px] font-semibold">{a.t}</div><div className="text-[13px] text-muted">{a.s}</div></div>
                <Switch on={auto[i]} label={a.t} onChange={(v) => { setAuto((x) => x.map((y, j) => (j === i ? v : y))); toast(`${a.t} ${v ? "will be sent" : "paused"}`, v ? "success" : "info"); }} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
