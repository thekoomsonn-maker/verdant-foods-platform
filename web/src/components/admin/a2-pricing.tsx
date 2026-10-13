"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PortalShell, ADM, Panel, Kpi, KpiRow, DataTable } from "../portal/shell";
import { AreaChart, Legend } from "../charts";
import { Pills } from "../ui";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { PRICE_LIST, PRICE_SERIES } from "@/lib/data-admin2";
import { ActionPill, GrowBar } from "./a2-ui";

const money = (n: number) => `GH₵ ${n.toFixed(2)}`;
const WEEKS = ["W31", "W34", "W37", "W40", "W42"];

export function A2Pricing() {
  const toast = useToast();
  const [crop, setCrop] = useState("Tomatoes");
  const s = PRICE_SERIES[crop];
  const unit = crop === "Tomatoes" ? "Tomatoes, per kg" : `${crop}, per kg`;
  return (
    <PortalShell cfg={ADM} active="Pricing" title="Pricing" sub="Farm-gate price first. Then ours."
      actions={<ActionPill arrow onClick={() => toast("Prices published to the shop and business portal")}>Publish prices</ActionPill>}>
      <KpiRow>
        <Kpi l="Farmer share" v="62%" d="Of every cedi" icon="hand-coins" bg="bg-lime-soft" />
        <Kpi l="Below market" v="9%" d="Avg. across 64 items" icon="trending-up" />
        <Kpi l="Prices to review" v="5" d="Market moved over 10%" icon="tag" tone="warning" />
        <Kpi l="Active offers" v="3" d="Ends Sunday" icon="percent" tone="muted" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-[18px] font-semibold">{unit}</h2>
            <Pills items={Object.keys(PRICE_SERIES)} value={crop} onChange={setCrop} size="S" />
          </div>
          <span className="-mt-2 text-[13px] text-muted">Last 12 weeks</span>
          <AnimatePresence mode="wait">
            <motion.div key={crop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AreaChart values={s.ours} compare={s.market} labels={WEEKS} tip={[money(s.now), "Our price"]} fmt={money} height={220} />
            </motion.div>
          </AnimatePresence>
          <Legend items={[["#024639", "Our price"], ["#C9D3CE", "Accra market"]]} />
        </Panel>
        <section className="flex flex-col gap-4 rounded-[20px] bg-deep p-4 text-white md:p-6">
          <h2 className="text-[18px] font-semibold">Where {money(s.now)} goes</h2>
          <div className="flex flex-col gap-4">
            {s.split.map(([l, v, c], i) => (
              <motion.div key={crop + l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[15px]"><span className="text-white/85">{l}</span><span className="font-semibold tabular">{money(v)}</span></div>
                <GrowBar pct={(v / s.now) * 100} color={c} track="bg-white/10" delay={0.1 + i * 0.05} />
              </motion.div>
            ))}
          </div>
          <p className="text-[13px] text-white/70">The farmer gets {Math.round((s.split[0][1] / s.now) * 100)}% of the shelf price.</p>
        </section>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">Price list · 64 items</h2><button onClick={() => toast("Price list exported to CSV")} className="text-[14px] font-semibold text-leaf hover:text-deep">Export</button></div>
        <DataTable cols={[["Product", "40%"], ["Farm gate"], ["Our price"], ["Market"], ["Change"]]} rows={PRICE_LIST.map(([p, f, o, m, c]) => [
          p, money(f), money(o), money(m),
          <span key="c" className={cx("inline-flex rounded-full px-2.5 py-1 text-[13px] font-medium tabular", c > 0 ? "bg-danger-bg text-danger" : "bg-success-bg text-success")}>{c > 0 ? `+${c}` : c}%</span>,
        ])} />
      </Panel>
    </PortalShell>
  );
}
