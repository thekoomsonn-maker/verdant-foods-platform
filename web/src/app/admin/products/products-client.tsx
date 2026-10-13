"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { A1Table } from "@/components/admin/a1-ui";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { ADM, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { Button, Pills, ProofChip, Status } from "@/components/ui";
import { LOTS } from "@/lib/data-admin1";

const FILTERS = ["All lots", "Safe to sell", "Blocked", "Needs a record"];

export function ProductsClient() {
  const toast = useToast();
  const [sel, setSel] = useState("VF-PEP-00052");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState("All lots");
  const [held, setHeld] = useState(false);
  const [told, setTold] = useState(false);
  const rows = useMemo(() => LOTS.filter((l) => filter === "All lots" || (filter === "Blocked" ? l.blocked : filter === "Needs a record" ? l.gapTone === "warning" : l.gapTone === "success")), [filter]);
  const lot = LOTS.find((l) => l.code === sel);

  return (
    <PortalShell cfg={ADM} active="Products and harvests" title="Products and harvests" sub="Every lot is checked for proof and safe spray gaps before it can be sold"
      actions={<Button size="M" arrow onClick={() => toast("New product draft started", "info")}>Add product</Button>}>
      <KpiRow>
        <Kpi l="Lots on sale" v="64" icon="leaf" />
        <Kpi l="Weighed and photographed" v="41" d="64% of lots" icon="badge-check" />
        <Kpi l="Blocked by spray rule" v="1" d="Kumbungu Pepper Farm" icon="spray-can" tone="danger" />
        <Kpi l="Avg. age on sale" v="1.6 days" icon="timer" />
      </KpiRow>

      <Panel>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold">Harvest lots</h2>
          <button onClick={() => setShowFilter((s) => !s)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf hover:text-deep"><Icon name="list-filter" size={16} />Filter</button>
        </div>
        <AnimatePresence initial={false}>
          {showFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
              <Pills items={FILTERS} value={filter} onChange={setFilter} size="S" />
            </motion.div>
          )}
        </AnimatePresence>
        <A1Table sel={sel} onSel={setSel} empty="No lots match this filter"
          cols={[["Lot", "1.3fr"], ["Product", "1.2fr"], ["Farm", "1.8fr"], ["Weight", "0.8fr"], ["Proof", "1.9fr"], ["Spray gap", "1.3fr"]]}
          rows={rows.map((l) => ({ key: l.code, cells: [l.code, l.product, l.farm, `${l.kg} kg`, <ProofChip key="p" level={l.proof} />, <Status key="g" tone={l.code === "VF-PEP-00052" && held ? "warning" : l.gapTone}>{l.code === "VF-PEP-00052" && held ? "Held · 18 Oct" : l.gap}</Status>] }))} />
      </Panel>

      <AnimatePresence mode="wait">
        {lot?.blocked ? (
          <motion.section key="blocked" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-4 rounded-[20px] bg-tomato-soft p-5 md:flex-row md:items-center md:p-6">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center text-danger">
              {!held && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-tomato/30" />}
              <Icon name="spray-can" size={22} className="relative" />
            </span>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-danger">{lot.code} is {held ? "held until 18 October" : "blocked from sale"}</h3>
              <p className="mt-1 text-[14px] text-ink">Copper fungicide was sprayed 9 days before harvest. The safe gap is 14 days. It can be sold from 18 October.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="M" onClick={() => { setTold(true); toast("Issah Mahama has been told by SMS and in the farmer app"); }} icon={told ? "check" : undefined}>{told ? "Farmer told" : "Tell the farmer"}</Button>
              <Button size="M" variant="light" onClick={() => { setHeld(true); toast("Lot held. It goes on sale on 18 October"); }}>{held ? "Held until 18 Oct" : "Hold until 18 Oct"}</Button>
            </div>
          </motion.section>
        ) : lot ? (
          <motion.section key={lot.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-4 rounded-[20px] bg-lime-soft p-5 md:flex-row md:items-center md:p-6">
            <Icon name="circle-check" size={22} className="shrink-0 text-success" />
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-deep">{lot.code} · {lot.product}</h3>
              <p className="mt-1 text-[14px] text-ink">{lot.gapTone === "warning" ? "No spray record yet. The lot can be sold once the farmer logs it or an officer checks it." : `${lot.kg} kg from ${lot.farm}. Spray gap kept, on sale now.`}</p>
            </div>
            {lot.gapTone === "warning" && <Button size="M" onClick={() => toast("Reminder sent to the farmer to log sprays")}>Ask for the record</Button>}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </PortalShell>
  );
}
