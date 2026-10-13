"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { Countdown, Input, perKg, Select, StatusFor, Thumb, UTabs } from "@/components/b2b/kit";
import { BIDS, CROP_IMG, MARKET, type Bid, type Crop } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

/** Header action: jumps to the new-bid form and focuses it. */
export function NewBidButton() {
  return <Button size="M" arrow onClick={() => { const f = document.getElementById("new-bid"); f?.scrollIntoView({ behavior: "smooth", block: "center" }); f?.querySelector("input")?.focus({ preventScroll: true }); }}>New bid</Button>;
}

const TAB_OF: Record<string, (b: Bid) => boolean> = {
  open: (b) => b.status === "Waiting" || b.status === "Countered",
  countered: (b) => b.status === "Countered",
  accepted: (b) => b.status === "Accepted",
  closed: (b) => b.status === "Closed",
};

export function BidsClient() {
  const toast = useToast();
  const [bids, setBids] = useState<Bid[]>(BIDS);
  const [tab, setTab] = useState("open");
  const count = (k: string) => bids.filter(TAB_OF[k]).length;
  const list = bids.filter(TAB_OF[tab]);
  const update = (id: string, p: Partial<Bid>) => setBids((bs) => bs.map((b) => (b.id === id ? { ...b, ...p } : b)));

  return (
    <>
      <UTabs value={tab} onChange={setTab} items={[["open", `Open ${count("open")}`], ["countered", `Countered ${count("countered")}`], ["accepted", `Accepted ${count("accepted")}`], ["closed", "Closed"]]} />
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-3 md:gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((b, i) => (
              <BidCard key={b.id} b={b} i={i}
                onAccept={() => { update(b.id, { status: "Accepted", yours: b.counter ?? b.yours }); toast(`Accepted GH₵ ${(b.counter ?? b.yours).toFixed(2)}/kg from ${b.farm}. It is now in Accepted.`); }}
                onCounter={(p) => { update(b.id, { status: "Waiting", yours: p, counter: undefined, dueH: 48, whose: "theirs" }); toast(`Counter of GH₵ ${p.toFixed(2)}/kg sent to ${b.farm}`); }}
                onEdit={(p) => { update(b.id, { yours: p }); toast(`Bid updated to GH₵ ${p.toFixed(2)}/kg`); }} />
            ))}
            {list.length === 0 && <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[20px] bg-white p-10 text-center text-muted">No bids here yet.</motion.p>}
          </AnimatePresence>
        </div>
        <NewBid onSend={(b) => { setBids((bs) => [b, ...bs]); setTab("open"); toast(`Bid sent to farms growing ${b.crop.toLowerCase()}. Replies within 48 hours.`); }} />
      </div>
    </>
  );
}

function BidCard({ b, i, onAccept, onCounter, onEdit }: { b: Bid; i: number; onAccept: () => void; onCounter: (p: number) => void; onEdit: (p: number) => void }) {
  const [mode, setMode] = useState<null | "counter" | "edit">(null);
  const [val, setVal] = useState("");
  const open = (m: "counter" | "edit") => { setMode(mode === m ? null : m); setVal(m === "counter" ? ((b.yours + (b.counter ?? b.yours)) / 2).toFixed(2) : b.yours.toFixed(2)); };
  const live = b.status === "Waiting" || b.status === "Countered";
  return (
    <motion.article layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }} transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
      className="flex flex-col gap-4 rounded-[20px] bg-white p-4 md:p-5">
      <div className="flex items-start gap-3">
        <Thumb img={CROP_IMG[b.crop]} size={48} />
        <div className="min-w-0 flex-1"><div className="text-[17px] font-semibold">{b.crop} · {b.kg.toLocaleString("en-GH")} kg</div><div className="truncate text-[14px] text-muted">{b.farm}</div></div>
        <StatusFor s={b.status} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-paper px-3.5 py-3"><div className="text-[13px] text-muted">Your bid</div><div className="text-[17px] font-semibold tabular">{perKg(b.yours)}</div></div>
        <div className={cx("rounded-xl px-3.5 py-3", b.counter ? "bg-info-bg" : "bg-paper")}><div className="text-[13px] text-muted">Their counter</div><div className="text-[17px] font-semibold tabular">{b.counter ? perKg(b.counter) : "None yet"}</div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {live ? <Countdown hours={b.dueH} prefix={b.whose === "yours" ? "Your reply due in" : "Reply due in"} tone={b.whose === "yours" ? "success" : "warning"} /> : <span className="text-[13px] text-muted">{b.status === "Accepted" ? "Added to your orders" : "Bid closed without a deal"}</span>}
        <div className="flex gap-2">
          {b.status === "Countered" && <>
            <button onClick={() => open("counter")} className={cx("h-10 rounded-full px-4 text-[15px] font-semibold text-deep transition-colors hover:bg-mist", mode === "counter" && "bg-mist")}>Counter</button>
            <button onClick={onAccept} className="h-10 rounded-full bg-deep px-4 text-[15px] font-semibold text-white transition-colors hover:bg-forest active:scale-[0.97]">Accept GH₵ {b.counter?.toFixed(2)}</button>
          </>}
          {b.status === "Waiting" && <button onClick={() => open("edit")} className={cx("h-10 rounded-full px-4 text-[15px] font-semibold text-deep transition-colors hover:bg-mist", mode === "edit" && "bg-mist")}>Edit bid</button>}
          {b.status === "Accepted" && <Link href={R.b2bOrders} className="flex h-10 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-deep hover:bg-mist">See order <Icon name="arrow-up-right" size={16} /></Link>}
          {b.status === "Closed" && <Link href={R.b2bSource} className="flex h-10 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-deep hover:bg-mist">Source again <Icon name="arrow-up-right" size={16} /></Link>}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {mode && (
          <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden"
            onSubmit={(e) => { e.preventDefault(); const p = parseFloat(val); if (!p) return; setMode(null); (mode === "counter" ? onCounter : onEdit)(p); }}>
            <div className="flex flex-col gap-2.5 rounded-2xl bg-paper p-3 sm:flex-row sm:items-center">
              <span className="text-[14px] font-semibold">{mode === "counter" ? "Your counter" : "New price"}</span>
              <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-white px-3.5 ring-1 ring-transparent focus-within:ring-deep">
                <span className="text-muted">GH₵</span><input autoFocus inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label="Price per kg" className="w-full min-w-0 bg-transparent tabular outline-none" /><span className="text-muted">/kg</span>
              </label>
              <button type="submit" className="h-11 rounded-full bg-deep px-5 text-[15px] font-semibold text-white hover:bg-forest">{mode === "counter" ? "Send counter" : "Save"}</button>
            </div>
            {mode === "counter" && <p className="mt-2 px-1 text-[13px] text-muted">You can counter once. The farm then accepts or declines.</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

const CROPS = Object.keys(MARKET) as Crop[];
function NewBid({ onSend }: { onSend: (b: Bid) => void }) {
  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const [kg, setKg] = useState("2,000");
  const [price, setPrice] = useState("8.90");
  const [by, setBy] = useState("Friday 17 Oct");
  const m = MARKET[crop]!;
  return (
    <form id="new-bid" onSubmit={(e) => { e.preventDefault(); onSend({ id: `BD-${Math.floor(Math.random() * 900 + 320)}`, crop, kg: parseInt(kg.replace(/\D/g, "")) || 0, farm: "Sent to farms near you", yours: parseFloat(price) || 0, status: "Waiting", dueH: 48, whose: "theirs" }); }}
      className="flex h-fit flex-col gap-4 rounded-[20px] bg-white p-5 md:p-6 xl:sticky xl:top-[96px]">
      <h2 className="text-[20px] font-semibold">Make a new bid</h2>
      <Select label="Crop" value={crop} options={CROPS} onChange={(v) => setCrop(v as Crop)} />
      <Input label="Amount" value={kg} onChange={setKg} suffix="kg" />
      <Input label="Your price per kg" value={price} onChange={setPrice} suffix="GH₵/kg" />
      <Select label="Deliver by" icon="calendar" value={by} options={["Thursday 16 Oct", "Friday 17 Oct", "Saturday 18 Oct", "Monday 20 Oct", "Tuesday 21 Oct"]} onChange={setBy} />
      <div className="flex items-center gap-2.5 rounded-xl bg-lime-soft px-3.5 py-3 text-[14px] text-deep">
        <Icon name="chart-line" size={18} className="shrink-0" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={crop} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>Market price this week: GH₵ {m[0].toFixed(2)} to {m[1].toFixed(2)}</motion.span>
        </AnimatePresence>
      </div>
      <Button type="submit" full arrow>Send bid to farms</Button>
    </form>
  );
}
