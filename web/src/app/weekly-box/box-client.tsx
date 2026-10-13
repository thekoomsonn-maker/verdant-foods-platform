"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { CountUp, EASE, Reveal } from "@/components/motion";
import { Button, Container, Head } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { cedi, TINT } from "@/lib/data";
import { BOX_ITEMS, BOX_SIZES } from "@/lib/data-market";
import { R } from "@/lib/routes";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function BoxHeroActions() {
  return (
    <>
      <Button variant="lime" arrow onClick={() => scrollTo("sizes")}>Choose my box</Button>
      <Button variant="glass" onClick={() => scrollTo("inside")}>See this week</Button>
    </>
  );
}
export function BoxPrice() {
  return (
    <div className="glass-dark rounded-3xl p-5 text-white">
      <div className="text-[13px] text-white/70">From</div>
      <div className="mt-1 text-[28px] font-medium tracking-[-0.02em]"><CountUp value="GH₵ 120" /> a week</div>
      <div className="mt-1 text-[14px] text-lime">Skip or pause any week.</div>
    </div>
  );
}

const DAYS = [["Mon", "12"], ["Tue", "13"], ["Wed", "14"], ["Thu", "15"], ["Fri", "16"], ["Sat", "17"]];
const TIMES = ["7 to 9 am", "9 to 11 am", "12 to 2 pm", "4 to 6 pm"];

function Slide({ id, items, value, onChange, render, className }: { id: string; items: string[]; value: string; onChange: (v: string) => void; render: (v: string, on: boolean) => ReactNode; className?: string }) {
  return (
    <LayoutGroup id={id}>
      <div className={className}>
        {items.map((it) => {
          const on = it === value;
          return (
            <button key={it} onClick={() => onChange(it)} aria-pressed={on} className={cx("relative rounded-xl transition-colors", on ? "text-white" : "hover:bg-mist")}>
              {on && <motion.span layoutId={`${id}-hl`} className="absolute inset-0 rounded-xl bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative block">{render(it, on)}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function BoxBuilder() {
  const [size, setSize] = useState<string>("medium");
  const [day, setDay] = useState("Wed");
  const [time, setTime] = useState("9 to 11 am");
  const toast = useToast();
  const s = BOX_SIZES.find((b) => b.id === size)!;
  const items = BOX_ITEMS.slice(0, s.items);
  return (
    <>
      <section id="sizes" className="scroll-mt-20 py-[72px] md:py-24">
        <Container className="flex flex-col gap-10">
          <Head title="Choose a size" sub="Change it any week." />
          <LayoutGroup id="box-size">
            <div className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Box size">
              {BOX_SIZES.map((b, i) => {
                const on = b.id === size;
                return (
                  <Reveal key={b.id} delay={i * 0.06}>
                    <button role="radio" aria-checked={on} onClick={() => setSize(b.id)} className={cx("relative flex h-full w-full flex-col gap-1 overflow-hidden rounded-3xl p-6 text-left transition-transform duration-300 hover:-translate-y-1 md:p-7", !on && b.tint)}>
                      {on && <motion.span layoutId="size-hl" className="absolute inset-0 rounded-3xl bg-deep" transition={{ type: "spring", stiffness: 300, damping: 32 }} />}
                      <span className={cx("relative flex items-center justify-between text-[19px] font-semibold", on && "text-white")}>{b.name}{"popular" in b && <span className={cx("rounded-full px-2.5 py-1 text-[12px] font-semibold", on ? "bg-lime text-night" : "bg-white text-deep")}>Most chosen</span>}</span>
                      <span className={cx("relative text-[14px]", on ? "text-white/70" : "text-muted")}>{b.people}</span>
                      <span className={cx("relative mt-5 text-[40px] font-medium leading-none tracking-[-0.03em] tabular", on ? "text-lime" : "text-deep")}>{cedi(b.price)}</span>
                      <span className={cx("relative mt-2 text-[14px]", on ? "text-white/70" : "text-muted")}>{b.items} items · free delivery</span>
                      <span className={cx("relative mt-6 flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors", on ? "bg-lime text-night" : "bg-deep text-white")}>
                        {on ? <>Selected <Icon name="check" size={16} /></> : "Choose"}
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </LayoutGroup>
        </Container>
      </section>

      <section id="inside" className="scroll-mt-20 bg-paper py-[72px] md:py-24">
        <Container className="flex flex-col gap-8">
          <Head title={`In this week’s ${s.name.toLowerCase()} box`} sub="From 7 farms. Picked 13 October." />
          <motion.div layout className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map(([img, name, qty], i) => (
                <motion.div key={name} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, ease: EASE, delay: Math.max(0, i - 7) * 0.04 }}
                  className="group/bi flex flex-col gap-2 rounded-2xl bg-white p-2.5">
                  <span className="block aspect-[4/3] overflow-hidden rounded-xl" style={{ background: TINT[img] }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/products/${img}.jpg`} alt="" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover/bi:scale-105" loading="lazy" />
                  </span>
                  <span className="px-1 text-[14px] font-semibold leading-tight">{name}</span>
                  <span className="px-1 pb-1 text-[12px] text-muted">{qty}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-lime-soft px-5 py-3.5 text-[14px] text-deep"><Icon name="repeat" size={18} />Swap up to 3 items each week in your account.</div>
        </Container>
      </section>

      <section className="py-[72px] md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_640px] lg:items-start lg:gap-20">
          <Reveal className="flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-leaf"><span className="h-1.5 w-1.5 rounded-full bg-leaf" />Delivery</span>
            <h2 className={cx(T.h2, "text-deep")}>Pick your day</h2>
            <p className="text-muted">Same day each week. Change it before Sunday 8 pm.</p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-5 rounded-3xl bg-paper p-5 md:p-6">
            <Slide id="box-day" items={DAYS.map((d) => d[0])} value={day} onChange={setDay} className="grid grid-cols-6 gap-1"
              render={(d, on) => { const n = DAYS.find((x) => x[0] === d)![1]; return <span className="flex flex-col items-center gap-0.5 py-3"><span className={cx("text-[12px]", on ? "text-white/70" : "text-muted")}>{d}</span><span className="text-[17px] font-semibold">{n}</span><span className={cx("h-1 w-1 rounded-full", on ? "bg-lime" : d === "Sun" ? "" : "bg-leaf/50")} /></span>; }} />
            <Slide id="box-time" items={TIMES} value={time} onChange={setTime} className="grid grid-cols-2 gap-2 md:grid-cols-4"
              render={(t) => <span className="block rounded-xl px-3 py-2.5 text-center text-[14px] font-semibold ring-1 ring-line">{t}</span>} />
            <div className="flex items-center justify-between border-t border-line pt-4 text-[15px]">
              <span className="text-muted">{s.name} box, every {{ Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" }[day]}, {time}</span>
              <AnimatePresence mode="popLayout" initial={false}><motion.span key={s.price} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-semibold tabular">{cedi(s.price)}</motion.span></AnimatePresence>
            </div>
            <Button href={R.myBox} arrow full onClick={() => toast(`${s.name} box set for ${day}, ${time}`)}>Start my weekly box</Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

