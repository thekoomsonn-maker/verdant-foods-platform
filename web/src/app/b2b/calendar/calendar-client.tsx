"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Bars, Legend } from "@/components/charts";
import { Icon } from "@/components/icon";
import { Panel } from "@/components/portal/shell";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { StatusFor, Thumb } from "@/components/b2b/kit";
import { CROP_COLOR, CROP_IMG, dropsFor, OUTLOOK } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

const TODAY = new Date(2026, 9, 13);
const MONTHS = [new Date(2026, 9, 1), new Date(2026, 10, 1), new Date(2026, 11, 1)];
const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const fmtMonth = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export function CalendarClient() {
  const [m, setM] = useState(0);
  const [dir, setDir] = useState(1);
  const [day, setDay] = useState(TODAY);
  const first = MONTHS[m];
  const lead = (first.getDay() + 6) % 7; // Monday first
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))];
  const drops = dropsFor(day);
  const go = (n: number) => { setDir(n > m ? 1 : -1); setM(n); setDay(n === 0 ? TODAY : MONTHS[n]); };
  const status = (d: Date, time: string) => (d < TODAY ? "Received" : same(d, TODAY) ? (time.startsWith("6") ? "Received" : "On the way") : "Booked");

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_340px]">
      <section className="flex flex-col gap-4 overflow-hidden rounded-[20px] bg-white p-3 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Legend items={Object.entries(CROP_COLOR).map(([c, col]) => [col, c === "Red onions" ? "Onions" : c])} />
          <div className="flex items-center gap-1 self-start rounded-full bg-paper p-1 sm:self-auto">
            <button onClick={() => go(m - 1)} disabled={m === 0} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-full text-deep hover:bg-white disabled:opacity-30"><Icon name="chevron-left" size={18} /></button>
            <span className="min-w-[132px] text-center text-[15px] font-semibold text-deep">{fmtMonth(first)}</span>
            <button onClick={() => go(m + 1)} disabled={m === MONTHS.length - 1} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-full text-deep hover:bg-white disabled:opacity-30"><Icon name="chevron-right" size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[13px] text-muted md:gap-1.5">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}</div>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={m} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 30 }} transition={{ duration: 0.3, ease: EASE }}>
            <LayoutGroup id="cal">
              <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                {cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} />;
                  const on = same(d, day), ds = dropsFor(d), past = d < TODAY && !same(d, TODAY);
                  return (
                    <motion.button key={d.getDate()} onClick={() => setDay(d)} aria-pressed={on} aria-label={`${d.getDate()} ${fmtMonth(d)}, ${ds.length} deliveries`}
                      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: Math.min(i, 35) * 0.008 }}
                      className={cx("relative flex aspect-square flex-col items-start gap-1.5 rounded-lg p-1.5 text-left transition-colors md:aspect-auto md:h-[120px] md:rounded-xl md:p-2.5 xl:h-[136px]", on ? "text-white" : "bg-paper hover:bg-mist")}>
                      {on && <motion.span layoutId="cal-day" className="absolute inset-0 rounded-lg bg-deep md:rounded-xl" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                      <span className={cx("relative text-[13px] font-semibold tabular md:text-[15px]", past && !on && "text-muted")}>{d.getDate()}</span>
                      <span className="relative flex flex-wrap gap-0.5 md:gap-1">{ds.map((x) => <span key={x.crop} className="h-1.5 w-1.5 rounded-full md:h-2 md:w-2" style={{ background: CROP_COLOR[x.crop] }} />)}</span>
                      {same(d, TODAY) && !on && <span className="relative mt-auto hidden text-[11px] font-semibold text-leaf md:block">Today</span>}
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="flex flex-col gap-4 md:gap-6">
        <Panel>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={day.toDateString()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-col gap-4">
              <h2 className="text-[20px] font-semibold">{same(day, TODAY) ? "Today" : day.toLocaleDateString("en-GB", { weekday: "long" })} · {day.getDate()} {day.toLocaleDateString("en-GB", { month: "short" })}</h2>
              {drops.length === 0 && <p className="text-[14px] text-muted">No deliveries booked. <Link href={R.b2bQuote} className="font-semibold text-leaf hover:text-deep">Request a quote</Link> to add a day.</p>}
              <ul className="flex flex-col gap-3">
                {drops.map((x, i) => (
                  <motion.li key={x.crop} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={R.b2bOrders} className="flex items-center gap-3 rounded-xl transition-colors hover:bg-paper">
                      <Thumb img={CROP_IMG[x.crop]} size={40} />
                      <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{x.crop === "Red onions" ? "Onions" : x.crop} · {x.qty}</span><span className="block text-[13px] text-muted">{x.time}</span></span>
                      <StatusFor s={status(day, x.time)} />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </Panel>
        <Panel title="Harvest outlook">
          <p className="-mt-2 text-[14px] text-muted">Expected tomato kg per week, next 6 weeks</p>
          <Bars values={OUTLOOK.kg} labels={OUTLOOK.weeks} hi={OUTLOOK.peak} color="#FDE4DF" hiColor="#E5412B" height={120} />
          <Link href={R.b2bQuote} className="group/o flex items-start gap-3 rounded-2xl bg-lime-soft px-4 py-3.5 text-[15px] text-deep">
            <Icon name="trending-up" size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">Tomato peak in week 47. Lock a price now.</span>
            <Icon name="arrow-up-right" size={18} className="shrink-0 transition-transform group-hover/o:-translate-y-0.5 group-hover/o:translate-x-0.5" />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
