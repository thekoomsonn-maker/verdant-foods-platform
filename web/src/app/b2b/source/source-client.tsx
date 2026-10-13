"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { Pills, ProofChip } from "@/components/ui";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { perKg, Select, Thumb } from "@/components/b2b/kit";
import { plotAround } from "@/lib/data";
import { CROP_COLOR, CROP_IMG, LOTS, type Lot } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

const CROPS = ["All crops", "Tomatoes", "Red onions", "Okra", "Kontomire", "Pepper", "Yam"];
const REGIONS = ["All regions", "Northern Region", "Upper West Region"];
const PICKED = ["Any time", "Picked today", "Picked within 3 days", "Picked within a week"];
const PROOFS = ["Any proof", "Proof: weighed", "Proof: officer or better"];

export function SourceClient() {
  const [crop, setCrop] = useState("Tomatoes");
  const [region, setRegion] = useState("Northern Region");
  const [picked, setPicked] = useState("Picked within 3 days");
  const [proof, setProof] = useState("Any proof");
  const [active, setActive] = useState<string | undefined>();

  const lots = useMemo(() => LOTS.filter((l) =>
    (crop === "All crops" || l.crop === crop) &&
    (region === "All regions" || region.startsWith(l.region)) &&
    (picked === "Any time" || l.pickedDays <= (picked === "Picked today" ? 0 : picked === "Picked within 3 days" ? 3 : 7)) &&
    (proof === "Any proof" || l.proof >= (proof === "Proof: weighed" ? 3 : 2)),
  ), [crop, region, picked, proof]);
  const total = lots.reduce((a, l) => a + l.kg, 0);
  const focus = region === "Upper West Region" ? { lat: 10.3, lng: -2.62, zoom: 8.6 } : region === "Northern Region" ? { lat: 9.5, lng: -0.95, zoom: 9.6 } : { lat: 9.85, lng: -1.7, zoom: 7.4 };
  const reset = () => { setCrop("All crops"); setRegion("All regions"); setPicked("Any time"); setProof("Any proof"); };

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Pills items={CROPS} value={crop} onChange={setCrop} light className="-mx-5 px-5 md:mx-0 md:px-0" key={crop === "All crops" && region === "All regions" ? "reset" : "set"} />
        <div className="flex flex-wrap gap-2">
          <Select variant="chip" value={region} options={REGIONS} onChange={setRegion} active={region !== REGIONS[0]} />
          <Select variant="chip" value={picked} options={PICKED} onChange={setPicked} active={picked !== PICKED[0]} />
          <Select variant="chip" value={proof} options={PROOFS} onChange={setProof} active={proof !== PROOFS[0]} />
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
        <div className="xl:sticky xl:top-[96px] xl:self-start">
          <LiveMap height="h-[340px] md:h-[440px] xl:h-[560px]" focus={focus} active={active}
            live={`${total.toLocaleString("en-GH")} kg ready this week`}
            legend={[[CROP_COLOR[crop] ?? "#BBEA70", crop === "All crops" ? "Produce ready" : `${crop} ready`]]}
            plots={lots.length ? lots.map((l) => ({ id: l.id, coords: plotAround(l.lat, l.lng, 0.012, 0.003), color: CROP_COLOR[l.crop] ?? "#BBEA70" })) : [{ id: "none", coords: plotAround(0, 0, 0, 0) }]}
            pins={lots.map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, kind: "farm" as const, label: `${l.kg.toLocaleString("en-GH")} kg`, icon: "sprout" }))} />
        </div>

        <motion.div layout className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {lots.map((l, i) => <LotCard key={l.id} l={l} i={i} on={active === l.id} onPick={() => setActive(l.id)} />)}
            {lots.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 rounded-[20px] bg-white p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-deep"><Icon name="search" /></span>
                <div className="font-semibold">Nothing matches these filters</div>
                <p className="text-[14px] text-muted">Widen the region or freshness, or post a bid and let farms come to you.</p>
                <div className="flex gap-2"><button onClick={reset} className="h-10 rounded-full bg-mist px-4 text-[14px] font-semibold text-deep hover:bg-mint">Clear filters</button><Link href={R.b2bBids} className="flex h-10 items-center rounded-full bg-deep px-4 text-[14px] font-semibold text-white">Make a bid</Link></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex items-start gap-3 rounded-[20px] bg-mist px-5 py-4 text-[15px] text-deep">
        <Icon name="info" size={20} className="mt-0.5 shrink-0" />
        <p>Proof level shows how each lot was verified: weighed and photographed, checked by an officer, or logged by the farmer.</p>
      </div>
    </>
  );
}

function LotCard({ l, i, on, onPick }: { l: Lot; i: number; on: boolean; onPick: () => void }) {
  const toast = useToast();
  const [bid, setBid] = useState(false);
  const [price, setPrice] = useState((l.price - 0.4).toFixed(2));
  const [bought, setBought] = useState(false);
  const picked = l.pickedDays === 0 ? "Picked today" : l.pickedDays === 1 ? "Picked yesterday" : `Picked ${l.pickedDays} days ago`;
  return (
    <motion.article layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
      onMouseEnter={onPick} onFocus={onPick}
      className={cx("flex flex-col gap-4 rounded-[20px] bg-white p-4 transition-shadow md:p-5", on && "shadow-[var(--shadow-2)]")}>
      <div className="flex items-start gap-3.5">
        <Thumb img={CROP_IMG[l.crop]} size={56} />
        <div className="min-w-0 flex-1">
          {l.slug ? <Link href={R.farm(l.slug)} className="block truncate text-[17px] font-semibold hover:text-deep">{l.farm}</Link> : <div className="truncate text-[17px] font-semibold">{l.farm}</div>}
          <div className="truncate text-[14px] text-muted">{l.plot} · {l.district} · {picked}</div>
        </div>
        <div className="shrink-0 text-right text-[18px] font-semibold text-deep tabular md:text-[20px]">{perKg(l.price)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
        <span className="text-[15px] font-semibold tabular">{l.kg.toLocaleString("en-GH")} kg · Grade {l.grade}</span>
        <ProofChip level={l.proof} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setBid((b) => !b)} aria-expanded={bid} className={cx("h-10 rounded-full px-4 text-[15px] font-semibold transition-colors", bid ? "bg-mist text-deep" : "text-deep hover:bg-mist")}>Bid</button>
          <button onClick={() => { setBought(true); toast(`${l.kg.toLocaleString("en-GH")} kg of ${l.crop.toLowerCase()} from ${l.farm} added to your order`); }}
            className={cx("relative flex h-10 min-w-[76px] items-center justify-center gap-1.5 rounded-full px-4 text-[15px] font-semibold transition-colors active:scale-[0.97]", bought ? "bg-lime text-night" : "bg-deep text-white hover:bg-forest")}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(bought)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
                {bought ? <><Icon name="check" size={16} />Added</> : "Buy"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {bid && (
          <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden"
            onSubmit={(e) => { e.preventDefault(); setBid(false); toast(`Bid of GH₵ ${price}/kg sent to ${l.farm}. They have 48 hours to reply.`); }}>
            <div className="flex flex-col gap-2.5 rounded-2xl bg-paper p-3 sm:flex-row sm:items-center">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-white px-3.5 text-[15px] ring-1 ring-transparent focus-within:ring-deep">
                <span className="text-muted">GH₵</span>
                <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Your price per kg" className="w-full min-w-0 bg-transparent tabular outline-none" />
                <span className="text-muted">/kg</span>
              </label>
              <span className="text-[13px] text-muted">for {l.kg.toLocaleString("en-GH")} kg</span>
              <button type="submit" className="h-11 rounded-full bg-deep px-5 text-[15px] font-semibold text-white hover:bg-forest">Send bid</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
