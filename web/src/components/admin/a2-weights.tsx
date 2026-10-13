"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { PortalShell, ADM, Panel, Kpi, KpiRow, DataTable } from "../portal/shell";
import { Bars } from "../charts";
import { Button, Status } from "../ui";
import { Icon } from "../icon";
import { CountUp, EASE } from "../motion";
import { useToast } from "../toast";
import { CHECKS, MISMATCHES } from "@/lib/data-admin2";
import { R } from "@/lib/routes";

export function A2Weights() {
  const toast = useToast();
  const [all, setAll] = useState(false);
  const reduce = useReducedMotion();
  return (
    <PortalShell cfg={ADM} active="Weight checks" title="Weight checks" sub="Weight in must match weight out at every handover."
      actions={<Link href={R.adminSettings} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold text-deep transition-colors hover:bg-mist"><Icon name="scale" size={18} />Allowed loss: 2%</Link>}>
      <KpiRow>
        <Kpi l="Checks today" v="214" d="At 9 points" icon="scale" />
        <Kpi l="Passed" v="212" d="99.1%" icon="circle-check" />
        <Kpi l="Mismatches" v="2" d="Both held" icon="triangle-alert" tone="danger" bg="bg-danger-bg" />
        <Kpi l="Avg. loss" v="0.8%" d="Moisture and trimming" icon="activity" tone="muted" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {MISMATCHES.map((m, i) => {
          const pct = Math.round(((m.inn - m.out) / m.out) * 100);
          return (
            <motion.section key={m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }} className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-danger-bg p-4 md:p-6">
              {/* Gentle pulse: a soft tomato wash breathes every 2.4 s. */}
              {!reduce && <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-tomato/10" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }} />}
              <div className="relative flex items-start justify-between gap-3">
                <div><h2 className="text-[18px] font-semibold">{m.id} · {m.crop}</h2><p className="mt-1 text-[14px] text-muted">{m.route}</p></div>
                <span className="relative inline-flex shrink-0 items-center rounded-full bg-danger px-3 py-1.5 text-[14px] font-semibold text-white">
                  {!reduce && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-danger" />}<span className="relative tabular">{pct}%</span>
                </span>
              </div>
              <div className="relative flex items-center gap-2">
                <div className="flex-1 rounded-2xl bg-white px-4 py-3"><div className="text-[13px] text-muted">Out</div><div className="text-[20px] font-semibold tabular">{m.out} kg</div></div>
                <Icon name="arrow-right" size={18} className="shrink-0 text-muted" />
                <div className="flex-1 rounded-2xl bg-white px-4 py-3"><div className="text-[13px] text-muted">In</div><CountUp value={`${m.inn} kg`} className="text-[20px] font-semibold text-danger" /></div>
              </div>
              <div className="relative flex flex-wrap gap-2.5">
                <Button href={R.adminBatches} size="M">Investigate</Button>
                <Button size="M" variant="light" icon="phone" onClick={() => toast(`Calling ${m.officer} about ${m.id}`, "info")}>Call officer</Button>
              </div>
            </motion.section>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">Latest checks</h2><button onClick={() => setAll((a) => !a)} className="text-[14px] font-semibold text-leaf hover:text-deep">{all ? "Show fewer" : "See all"}</button></div>
          <DataTable key={String(all)} cols={[["Batch"], ["Point"], ["Out"], ["In"], ["Result"]]} rows={CHECKS.slice(0, all ? CHECKS.length : 4).map(([b, p, o, n, r]) => [b, p, o, n, <Status key="r" tone={r === "Pass" ? "success" : "danger"}>{r}</Status>])} />
        </Panel>
        <Panel title="Mismatches, last 8 weeks">
          <Bars values={[29, 19, 24, 14, 14, 9, 4, 9]} labels={["W35", "W36", "W37", "W38", "W39", "W40", "W41", "W42"]} hi={7} height={140} color="#FDE4DF" hiColor="#E5412B" />
          <p className="text-[14px] text-success">Down 67% since every handover was weighed.</p>
        </Panel>
      </div>
    </PortalShell>
  );
}
