"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Card } from "@/components/site/account";
import { Thumb } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { CountUp, EASE } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Status } from "@/components/ui";
import { cedi, productBySlug } from "@/lib/data";
import { BOX } from "@/lib/data-account";
import { R } from "@/lib/routes";

const price = (size: string) => BOX.sizes.find((s) => s.id === size)!.price;

export function WeeklyBox() {
  const toast = useToast();
  const [size, setSize] = useState(BOX.size);
  const [sizing, setSizing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [weeks, setWeeks] = useState(BOX.upcoming);
  const [items, setItems] = useState(BOX.items);
  const [swaps, setSwaps] = useState(BOX.swaps);
  const [swapping, setSwapping] = useState<string | null>(null);

  const next = paused ? null : weeks.find((w) => !w.skipped);
  const firstSkipped = weeks[0].skipped;
  const count = BOX.sizes.find((s) => s.id === size)!.items;

  const skipThis = () => {
    setWeeks((ws) => ws.map((w, i) => (i === 0 ? { ...w, skipped: !w.skipped } : w)));
    toast(firstSkipped ? `${weeks[0].date} is back on` : `Skipped ${weeks[0].date}. Next box ${weeks.slice(1).find((w) => !w.skipped)?.date}`, firstSkipped ? "success" : "info");
  };
  const swap = (from: string, to: string) => {
    const a = productBySlug(from), b = productBySlug(to);
    setItems((xs) => xs.map((x) => (x.slug === from ? { ...x, slug: to } : x)));
    setSwaps((n) => n - 1); setSwapping(null);
    toast(`${a.name} swapped for ${b.name}`);
  };

  return (
    <>
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="flex flex-col gap-4 rounded-[20px] bg-deep p-5 text-white md:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] text-white/75">Next box</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-2.5 py-1 text-[12px] font-semibold text-warning"><Icon name="timer" size={13} />Edit until {BOX.editUntil}</span>
          </div>
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={next?.date ?? "paused"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE }} className="text-[30px] font-medium leading-tight tracking-[-0.02em] md:text-[40px]">
                {next ? next.long : "Box paused"}
              </motion.div>
            </AnimatePresence>
            <div className="mt-1.5 text-[15px] text-white/75">{next ? `${BOX.window} · Osu, Accra · ${cedi(price(next === weeks[0] ? size : next.size))}` : "No boxes until you restart. Your farms are told."}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!paused && <button onClick={skipThis} className="h-10 rounded-full bg-lime px-4 text-[14px] font-semibold text-night transition-colors hover:bg-leaf-light active:scale-[0.97]">{firstSkipped ? "Undo skip" : "Skip this week"}</button>}
            <button onClick={() => { setPaused(!paused); toast(paused ? "Your weekly box is back on" : "Weekly box paused. Restart any time.", paused ? "success" : "info"); }} className="h-10 rounded-full bg-white/10 px-4 text-[14px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20">{paused ? "Restart" : "Pause"}</button>
            {!paused && <button onClick={() => setSizing(!sizing)} aria-expanded={sizing} className="h-10 rounded-full bg-white/10 px-4 text-[14px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20">Change size</button>}
          </div>
          <AnimatePresence initial={false}>
            {sizing && !paused && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                <LayoutGroup id="box-size">
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {BOX.sizes.map((s) => {
                      const on = s.id === size;
                      return (
                        <button key={s.id} onClick={() => { setSize(s.id); setSizing(false); toast(`${s.id} box from ${weeks[0].date}, ${cedi(s.price)} a week`); }} aria-pressed={on} className={cx("relative flex flex-col gap-0.5 rounded-2xl p-3 text-left transition-colors", on ? "text-night" : "bg-forest hover:bg-white/15")}>
                          {on && <motion.span layoutId="size-on" className="absolute inset-0 rounded-2xl bg-lime" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                          <span className="relative font-semibold">{s.id}</span>
                          <span className={cx("relative text-[13px]", on ? "text-night/75" : "text-white/70")}>{s.items} items · {cedi(s.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section className="flex flex-col gap-2 rounded-[20px] bg-lime-soft p-5 md:p-6">
          <Icon name="piggy-bank" size={22} className="text-deep" />
          <CountUp value={cedi(BOX.saved)} className="text-[28px] font-medium tracking-[-0.02em] text-deep" />
          <p className="text-[14px] text-muted">saved versus buying the same items one by one</p>
        </section>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold md:text-[20px]">In this box · {count} items</h2>
          <span className="text-[14px] font-semibold text-leaf">Swaps left: {swaps}</span>
        </div>
        <div className="grid gap-2.5 md:grid-cols-2">
          {items.map((it, i) => {
            const p = productBySlug(it.slug); const open = swapping === it.slug;
            return (
              <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.05 }} className="flex flex-col rounded-2xl bg-paper">
                <div className="flex items-center gap-3 p-2.5 pr-3">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={p.slug} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}><Thumb p={p} size={44} /></motion.span>
                  </AnimatePresence>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.name}</span><span className="block text-[13px] text-muted">{it.amount}</span></span>
                  <button onClick={() => { if (!swaps && !open) { toast("No swaps left this week", "info"); return; } setSwapping(open ? null : it.slug); }} aria-expanded={open}
                    className={cx("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors", open ? "bg-deep text-white" : "bg-white text-deep hover:bg-mint")}>
                    <Icon name={open ? "x" : "repeat"} size={14} />{open ? "Close" : "Swap"}
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
                      <div className="flex flex-wrap gap-1.5 px-2.5 pb-3">
                        {BOX.swapFor.filter((s) => !items.some((x) => x.slug === s)).map((s) => (
                          <button key={s} onClick={() => swap(it.slug, s)} className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-3 text-[13px] font-semibold text-deep hover:bg-mint">
                            <Thumb p={productBySlug(s)} size={24} className="!rounded-full" />{productBySlug(s).name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        {count > items.length && <p className="text-[13px] text-muted">Plus {count - items.length} seasonal items chosen by the farms on packing day.</p>}
      </Card>

      <Card>
        <h2 className="text-[18px] font-semibold md:text-[20px]">Coming up</h2>
        <div className="overflow-hidden rounded-xl">
          <div className="grid grid-cols-[1fr_auto] gap-3 bg-paper px-3 py-2.5 text-[13px] text-muted md:grid-cols-[1.4fr_1fr_1fr_1fr]"><span>Date</span><span className="hidden md:block">Size</span><span className="hidden md:block">Total</span><span>Status</span></div>
          {weeks.map((w, i) => {
            const off = w.skipped || paused;
            const sz = i === 0 ? size : w.size;
            return (
              <button key={w.date} disabled={paused} onClick={() => { setWeeks((ws) => ws.map((x) => (x.date === w.date ? { ...x, skipped: !x.skipped } : x))); toast(w.skipped ? `${w.date} is back on` : `Skipped ${w.date}`, w.skipped ? "success" : "info"); }}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-3.5 text-left text-[14px] transition-colors last:border-0 hover:bg-paper disabled:hover:bg-transparent md:grid-cols-[1.4fr_1fr_1fr_1fr]" aria-label={`${w.date}: ${off ? "skipped, tap to restore" : "scheduled, tap to skip"}`}>
                <span><span className={cx("block font-semibold", off && "text-muted")}>{w.date}</span><span className="block text-[13px] text-muted md:hidden">{sz} · {cedi(price(sz))}</span></span>
                <span className="hidden md:block">{sz}</span>
                <span className="hidden tabular md:block">{cedi(price(sz))}</span>
                <span><Status tone={off ? "neutral" : "info"}>{paused ? "Paused" : w.skipped ? "Skipped" : "Scheduled"}</Status></span>
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-muted">Tap a week to skip it or bring it back.</p>
      </Card>

      <section className="flex items-center gap-3 rounded-[20px] bg-white p-4 md:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sun text-[11px] font-bold text-night">MTN</span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">MTN MoMo · 024 ••• 0182</span><span className="block text-[13px] text-muted">Charged the day before delivery</span></span>
        <Link href={R.addresses} className="text-[14px] font-semibold text-leaf hover:text-deep">Change</Link>
      </section>
    </>
  );
}
