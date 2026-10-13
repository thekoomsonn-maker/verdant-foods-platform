"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { DrawCheck, ghs, Input, Select, Thumb, Tween } from "@/components/b2b/kit";
import { farmBySlug, plotAround, PROOF } from "@/lib/data";
import { CROP_IMG, FREQ, LOTS, QUOTE_PRODUCTS, type Crop } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

type Row = { key: number; crop: Crop; qty: string; freq: string };
const P = (c: Crop) => QUOTE_PRODUCTS.find((p) => p.crop === c)!;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MARKET_UPLIFT = 1.1;

export function QuoteClient() {
  const toast = useToast();
  const n = useRef(3);
  const [rows, setRows] = useState<Row[]>([{ key: 0, crop: "Tomatoes", qty: "480", freq: "Every week" }, { key: 1, crop: "Red onions", qty: "300", freq: "Every week" }, { key: 2, crop: "Kontomire", qty: "60", freq: "Twice a week" }]);
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("Mon 3 November");
  const [len, setLen] = useState("6 months");
  const [to, setTo] = useState("Osu Kitchen, Oxford Street");
  const [time, setTime] = useState("5 to 7 am");
  const [days, setDays] = useState(["Mon", "Wed", "Fri"]);
  const [notes, setNotes] = useState("Firm, medium size, grade A only");
  const [sent, setSent] = useState(false);

  const week = rows.reduce((a, r) => a + (parseFloat(r.qty.replace(/,/g, "")) || 0) * P(r.crop).price * (FREQ.find((f) => f[0] === r.freq)?.[1] ?? 1), 0);
  const farms = useMemo(() => Array.from(new Set(rows.flatMap((r) => P(r.crop).farms))), [rows]);
  const proof = useMemo(() => {
    const ls = LOTS.filter((l) => rows.some((r) => r.crop === l.crop));
    const avg = ls.length ? Math.round(ls.reduce((a, l) => a + l.proof, 0) / ls.length) : 2;
    return PROOF[Math.min(3, Math.max(1, avg)) as 1 | 2 | 3].label;
  }, [rows]);
  const unused = QUOTE_PRODUCTS.filter((p) => !rows.some((r) => r.crop === p.crop));
  const upd = (key: number, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const add = (c: Crop) => { setRows((rs) => [...rs, { key: n.current++, crop: c, qty: c === "Kontomire" ? "40" : "100", freq: "Every week" }]); setAdding(false); };
  const remove = (r: Row) => { setRows((rs) => rs.filter((x) => x.key !== r.key)); toast(`${P(r.crop).name} removed from the request`, "info"); };

  const pins = farms.map((s) => { const f = farmBySlug(s); return { id: s, lat: f.lat, lng: f.lng, kind: "farm" as const }; });
  const plots = farms.length ? farms.map((s) => { const f = farmBySlug(s); return { id: s, coords: plotAround(f.lat, f.lng, 0.03, 0.006) }; }) : [{ id: "none", coords: plotAround(0, 0, 0, 0) }];

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4 md:gap-6">
        <section className="flex flex-col gap-4 rounded-[20px] bg-white p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] font-semibold">What you need</h2>
            <div className="relative">
              <button onClick={() => setAdding((a) => !a)} disabled={!unused.length} aria-expanded={adding} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-leaf hover:text-deep disabled:opacity-40">
                <motion.span animate={{ rotate: adding ? 45 : 0 }} className="flex"><Icon name="plus" size={18} /></motion.span>Add item
              </button>
              <AnimatePresence>
                {adding && (
                  <motion.ul initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2, ease: EASE }}
                    className="absolute right-0 z-40 mt-2 w-[240px] origin-top-right rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)]">
                    {unused.map((p) => (
                      <li key={p.crop}><button onClick={() => add(p.crop)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[14px] hover:bg-paper"><Thumb img={CROP_IMG[p.crop]} size={32} className="rounded-lg" /><span className="flex-1 font-semibold">{p.name}</span><span className="text-[12px] text-muted">GH₵ {p.price}</span></button></li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((r) => {
                const p = P(r.crop);
                return (
                  <motion.li key={r.key} layout initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: EASE }}>
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-paper p-3">
                      <Thumb img={CROP_IMG[r.crop]} size={44} />
                      <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold">{p.name}</div><div className="text-[13px] text-muted">About GH₵ {p.price} per {p.unit === "kg" ? "kg" : "bunch"}</div></div>
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <label className="flex h-10 flex-1 items-center gap-1.5 rounded-lg bg-white px-3 text-[14px] font-semibold ring-1 ring-transparent focus-within:ring-deep sm:w-[132px] sm:flex-none">
                          <input inputMode="numeric" value={r.qty} onChange={(e) => upd(r.key, { qty: e.target.value })} aria-label={`${p.name} amount`} className="w-full min-w-0 bg-transparent text-right tabular outline-none" />
                          <span className="text-muted">{p.unit}</span>
                        </label>
                        <Select variant="mini" value={r.freq} options={FREQ.map((f) => f[0])} onChange={(v) => upd(r.key, { freq: v })} />
                        <button onClick={() => remove(r)} aria-label={`Remove ${p.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-danger"><Icon name="trash-2" size={17} /></button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          {rows.length === 0 && <p className="py-6 text-center text-muted">Add at least one item to get an estimate.</p>}
        </section>

        <section className="flex flex-col gap-5 rounded-[20px] bg-white p-4 md:p-6">
          <h2 className="text-[20px] font-semibold">Delivery</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Start date" icon="calendar" value={start} options={["Mon 20 October", "Mon 27 October", "Mon 3 November", "Mon 10 November"]} onChange={setStart} />
            <Select label="For how long" value={len} options={["1 month", "3 months", "6 months", "12 months"]} onChange={setLen} />
            <Input label="Deliver to" icon="map-pin" value={to} onChange={setTo} />
            <Select label="Time" value={time} options={["5 to 7 am", "7 to 9 am", "9 to 11 am"]} onChange={setTime} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[14px] font-semibold">Days</span>
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button key={d} aria-pressed={on} onClick={() => setDays((x) => (on ? x.filter((y) => y !== d) : [...x, d]))} className={cx("relative rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors", on ? "text-white" : "bg-mist text-deep hover:bg-mint")}>
                  <AnimatePresence>{on && <motion.span initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }} className="absolute inset-0 rounded-full bg-deep" />}</AnimatePresence>
                  <span className="relative">{d}</span>
                </button>
              );
            })}
          </div>
          <Input label="Quality notes" area value={notes} onChange={setNotes} />
        </section>
      </div>

      <aside className="flex flex-col gap-4 self-start rounded-[20px] bg-deep p-5 text-white md:p-6 xl:sticky xl:top-[96px]">
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-start gap-4">
              <DrawCheck size={56} />
              <div className="text-[22px] font-semibold">Request sent to {farms.length} farms</div>
              <p className="text-[15px] text-white/75">Replies arrive within 24 hours. You’ll see them as bids you can accept or counter.</p>
              <div className="flex flex-wrap gap-2"><Link href={R.b2bBids} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-night">Go to bids <Icon name="arrow-right" size={18} /></Link><button onClick={() => setSent(false)} className="h-11 rounded-full bg-white/10 px-5 text-[15px] font-semibold hover:bg-white/20">Edit request</button></div>
            </motion.div>
          ) : (
            <motion.div key="est" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              <div><div className="text-[14px] text-white/70">Your estimate</div>
                <div className="mt-1 text-[32px] font-semibold leading-tight tracking-[-0.02em]"><Tween value={week} fmt={(v) => ghs(Math.round(v / 10) * 10)} /> <span className="text-[20px] font-medium text-white/80">a week</span></div>
                <div className="mt-2 text-[14px] text-lime">About {Math.round((1 - 1 / MARKET_UPLIFT) * 100)}% below Accra market prices</div>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/15 pt-4 text-[14px]">
                <div className="flex justify-between gap-3"><span className="text-white/75">Farms that can supply</span><Tween value={farms.length} fmt={(v) => String(Math.round(v))} className="font-semibold" /></div>
                <div className="flex justify-between gap-3"><span className="text-white/75">Avg. proof level</span><span className="text-right font-semibold">{proof}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/75">Delivery fee</span><span className="font-semibold">{week >= 2000 ? "Free over GH₵ 2,000" : "GH₵ 120 a delivery"}</span></div>
              </div>
              <LiveMap height="h-[200px]" rounded="rounded-2xl" controls={false} intro={false} focus={{ lat: 9.95, lng: -1.75, zoom: 6.6 }}
                live={`${farms.length} farms`} pins={pins} plots={plots} />
              <button disabled={!rows.length} onClick={() => { setSent(true); toast(`Quote request sent to ${farms.length} farms. Replies within 24 hours.`); }}
                className="group/b inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-semibold text-night transition-colors hover:bg-leaf-light active:scale-[0.98] disabled:opacity-50">
                Send request <Icon name="arrow-right" size={20} className="transition-transform group-hover/b:translate-x-[3px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
