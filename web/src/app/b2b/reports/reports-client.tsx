"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { ProofChip } from "@/components/ui";
import { cx } from "@/components/tokens";
import { CountUp, EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { Thumb } from "@/components/b2b/kit";
import { farmBySlug, plotAround, PLACES } from "@/lib/data";
import { CROP_IMG, farmRoad, KITCHEN, REPORTS } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

export function ReportsClient() {
  const toast = useToast();
  const [sel, setSel] = useState(REPORTS[0].id);
  const [pin, setPin] = useState<string | undefined>();
  const r = REPORTS.find((x) => x.id === sel)!;
  const slugs = Array.from(new Set(r.batches.map((b) => b.slug)));
  const pins = [
    ...slugs.map((s) => { const f = farmBySlug(s); return { id: s, lat: f.lat, lng: f.lng, kind: "farm" as const, label: f.name }; }),
    { id: "tamale", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, kind: "handover" as const, icon: "warehouse", label: "Tamale packhouse" },
    { id: "kitchen", lat: KITCHEN.lat, lng: KITCHEN.lng, kind: "buyer" as const, label: KITCHEN.name },
  ];

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-[340px_1fr]">
      <section className="flex flex-col gap-2 self-start rounded-[20px] bg-white p-3 md:p-4">
        <h2 className="px-1 pb-1 pt-1 text-[18px] font-semibold">Reports</h2>
        <LayoutGroup id="reports">
          <ul className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 xl:mx-0 xl:flex-col xl:gap-1 xl:overflow-visible xl:px-0">
            {REPORTS.map((x, i) => {
              const on = x.id === sel;
              return (
                <motion.li key={x.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} className="shrink-0">
                  <button onClick={() => { setSel(x.id); setPin(undefined); }} aria-pressed={on} className={cx("relative flex w-[220px] items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors xl:w-full", on ? "" : "bg-paper hover:bg-mist xl:bg-transparent")}>
                    {on && <motion.span layoutId="rep-hi" className="absolute inset-0 rounded-xl bg-mist ring-1 ring-deep/10" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                    <span className={cx("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", on ? "bg-deep text-lime" : "bg-white text-deep")}><Icon name="file-check" size={18} /></span>
                    <span className="relative min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{x.title}</span><span className="block truncate text-[13px] text-muted">{x.range}</span></span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </LayoutGroup>
      </section>

      <section className="flex flex-col gap-5 rounded-[20px] bg-white p-4 md:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={r.id + "head"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div><div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-leaf">{r.id}</div><h2 className="text-[22px] font-semibold">Trace report · {r.title}</h2><p className="text-[14px] text-muted">{r.range} · Osu Kitchen Group</p></div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => toast(`${r.id} PDF is downloading`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-deep px-4 text-[14px] font-semibold text-white hover:bg-forest active:scale-[0.97]"><Icon name="download" size={16} />PDF</button>
                <button onClick={() => toast(`${r.id} map file (GeoJSON) is downloading`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-[14px] font-semibold text-deep hover:bg-mint active:scale-[0.97]"><Icon name="map" size={16} />Map file</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[["Deliveries", String(r.deliveries)], ["Weight", r.kg], ["Avg. freshness", r.fresh], ["Spray records", r.spray]].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-paper px-4 py-3"><div className="text-[13px] text-muted">{l}</div>{/\d/.test(v) ? <CountUp value={v} className="text-[18px] font-semibold" /> : <div className="text-[15px] font-semibold text-success">{v}</div>}</div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <LiveMap height="h-[300px] md:h-[400px]" rounded="rounded-2xl" focus={{ lat: 7.7, lng: -1.1, zoom: 5.8 }} active={pin} onPin={setPin}
          live={`${slugs.length} farms · ${r.batches.length} batches`}
          plots={slugs.map((s) => { const f = farmBySlug(s); return { id: s, coords: plotAround(f.lat, f.lng, 0.02, 0.005) }; })}
          routes={slugs.map((s) => ({ id: s, coords: farmRoad(s) }))}
          pins={pins} legend={[["#BBEA70", "Farm plot"], ["#FFFFFF", "Collection"], ["#FF7006", "Your kitchen"]]} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2">
            <div className="hidden grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1.4fr)_90px_220px] rounded-xl bg-paper px-4 py-2.5 text-[13px] font-medium text-muted lg:grid"><span>Batch</span><span>Product</span><span>Farm</span><span>Weight</span><span>Proof</span></div>
            {r.batches.map((b, i) => (
              <motion.div key={b.batch} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
                className={cx("grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl border-b border-line px-2 py-3 transition-colors last:border-0 lg:grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1.4fr)_90px_220px] lg:px-4", pin === b.slug && "bg-mist")}>
                <Link href={R.trace(b.code)} className="font-semibold text-deep hover:text-leaf">{b.batch}</Link>
                <span className="flex items-center gap-2.5 justify-self-end lg:justify-self-start"><Thumb img={CROP_IMG[b.product]} size={32} className="rounded-lg" /><span className="text-[15px]">{b.product}</span></span>
                <button onClick={() => setPin(b.slug)} className="flex items-center gap-1.5 text-left text-[14px] text-muted hover:text-deep lg:text-[15px] lg:text-ink"><Icon name="map-pin" size={15} className="shrink-0 text-leaf" /><span className="truncate">{b.farm}</span></button>
                <span className="justify-self-end text-[15px] tabular lg:justify-self-start">{b.kg}</span>
                <motion.span className="col-span-2 lg:col-span-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.06 }}><ProofChip level={b.proof} /></motion.span>
              </motion.div>
            ))}
            <p className="pt-2 text-[13px] text-muted">Tap a farm to fly to its plot. Batch numbers open the public trace page your guests see.</p>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
