"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Reveal, Stagger } from "@/components/motion";
import { Button, Container } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { useBag } from "@/components/site/bag";
import { cedi } from "@/lib/data";
import { PACKS, packProduct, type Pack } from "@/lib/data-market";
import { R } from "@/lib/routes";

export function PackHeroButton() {
  return <Button variant="light" arrow onClick={() => document.getElementById("packs")?.scrollIntoView({ behavior: "smooth" })}>Build my pack</Button>;
}

function PackCard({ k }: { k: Pack }) {
  const { add } = useBag();
  const btn = useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);
  return (
    <div className={cx("group/pk flex h-full flex-col overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-2)]", k.tint)}>
      <div className="relative h-[200px] overflow-hidden md:h-[230px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={k.photo} alt="" className={cx("h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/pk:scale-105", k.photo.startsWith("/products") && "mix-blend-multiply")} />
        {k.popular && <span className="absolute left-3 top-3 rounded-full bg-deep px-3 py-1 text-[12px] font-semibold text-white">Most popular</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="text-[18px] font-semibold">{k.name}</span>
        <span className="text-[14px] text-muted">{k.desc}</span>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div><div className="text-[22px] font-semibold text-deep tabular">{cedi(k.price)}</div><div className="text-[13px] text-muted">{k.people}</div></div>
          <button ref={btn} onClick={() => { add(packProduct(k), btn.current); setDone(true); setTimeout(() => setDone(false), 1600); }} className="group/ad inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-deep px-4 text-[14px] font-semibold text-white transition-[background-color,transform] hover:bg-forest active:scale-95">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(done)} className="inline-flex items-center gap-1.5" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }}>
                {done ? <><Icon name="check" size={16} className="text-lime" />Added</> : <>Add<Icon name="arrow-right" size={16} className="transition-transform group-hover/ad:translate-x-[3px]" /></>}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PackGrid() {
  return <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{PACKS.map((k) => <PackCard key={k.slug} k={k} />)}</Stagger>;
}

function Choice({ id, items, value, onChange }: { id: string; items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <LayoutGroup id={id}>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button key={it} onClick={() => onChange(it)} className={cx("relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", it === value ? "text-night" : "bg-white/10 text-white hover:bg-white/20")}>
            {it === value && <motion.span layoutId={`${id}-on`} className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative">{it}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

export function SubscribePanel() {
  const [often, setOften] = useState("Every week");
  const [day, setDay] = useState("Thu");
  const [pack, setPack] = useState(PACKS[0].slug);
  const k = PACKS.find((p) => p.slug === pack)!;
  const off = often === "Every week" ? 0.1 : often === "Every 2 weeks" ? 0.07 : 0.05;
  const price = Math.round(k.price * (1 - off));
  return (
    <section className="bg-deep py-[72px] text-white md:py-24 lg:py-[120px]">
      <Container className="grid items-center gap-10 lg:grid-cols-[1fr_480px] lg:gap-20">
        <Reveal className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime"><span className="h-1.5 w-1.5 rounded-full bg-lime" />Subscribe and save</span>
          <h2 className={T.h1}>Get your pack every week</h2>
          <p className="text-[18px] text-white/75">Save 10% when you subscribe. Change items, skip or pause from your account.</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-5 rounded-3xl bg-forest p-6">
          <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">Which pack?</span><Choice id="sub-pack" items={PACKS.slice(0, 4).map((p) => p.name)} value={k.name} onChange={(n) => setPack(PACKS.find((p) => p.name === n)!.slug)} /></div>
          <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">How often?</span><Choice id="sub-often" items={["Every week", "Every 2 weeks", "Monthly"]} value={often} onChange={setOften} /></div>
          <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">Delivery day</span><Choice id="sub-day" items={["Tue", "Thu", "Sat"]} value={day} onChange={setDay} /></div>
          <div className="flex items-end justify-between border-t border-white/10 pt-4">
            <div><div className="text-[13px] text-white/70">{k.name}</div><div className="text-[22px] font-semibold tabular">{cedi(price)} / {often === "Monthly" ? "month" : often === "Every 2 weeks" ? "2 weeks" : "week"}</div></div>
            <span className="text-[13px] font-semibold text-lime">Save {cedi(k.price - price)}</span>
          </div>
          <Button href={R.weeklyBox} variant="lime" arrow full>Start weekly delivery</Button>
        </Reveal>
      </Container>
    </section>
  );
}
