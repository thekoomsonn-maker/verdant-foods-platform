"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { EASE, Reveal, SplitWords, Stagger } from "@/components/motion";
import { Button, Crumbs, Pills, Tabs } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { useBag } from "@/components/site/bag";
import { cedi, farmBySlug, JOURNEY, TINT, type Product } from "@/lib/data";
import { galleryOf, journeyOf, PRACTICE_LABEL, practicesOf, RATING, traceCodeOf } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { JourneyMap, QtyStepper, Stars } from "@/components/market/bits";

function sizesOf(p: Product) {
  if (/kg/.test(p.unit) && p.cat !== "packs") return [{ label: "1 kg", mult: 0.5, unit: "1 kg" }, { label: "2 kg", mult: 1, unit: "2 kg" }, { label: "Crate · 25 kg", mult: 11, unit: "25 kg crate" }].map((s) => p.unit === "2 kg" ? s : { ...s, mult: s.mult * (2 / (parseFloat(p.unit) || 2)) });
  if (p.cat === "packs" || p.unit === "box") return [{ label: "One box", mult: 1, unit: p.unit }];
  return [{ label: p.unit, mult: 1, unit: p.unit }, { label: "Pack of 3", mult: 2.8, unit: `3 × ${p.unit}` }, { label: "Crate", mult: 10, unit: "crate" }];
}

/* ---------- Gallery with crossfade, thumbs and swipe ---------- */
function Gallery({ p }: { p: Product }) {
  const imgs = galleryOf(p);
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const code = traceCodeOf(p);
  const go = (n: number) => setI((n + imgs.length) % imgs.length);
  return (
    <div className="flex flex-col gap-3">
      <motion.div className="relative aspect-[4/3.3] overflow-hidden rounded-3xl" style={{ background: TINT[p.img] ?? "#F2F7F4" }}
        drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={(_, info) => { if (info.offset.x < -60) go(i + 1); if (info.offset.x > 60) go(i - 1); }}>
        <AnimatePresence initial={false}>
          <motion.img key={i} src={imgs[i]} alt={i === 0 ? p.name : ""} draggable={false}
            className={cx("absolute inset-0 h-full w-full object-cover", i === 0 && "mix-blend-multiply")}
            initial={{ opacity: 0, scale: reduce ? 1 : 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} />
        </AnimatePresence>
        <span className="glass-dark absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-white"><Icon name="timer" size={15} className="text-lime" />{p.fresh === "Picked today" ? "Picked 31 hours ago" : p.fresh}</span>
        <Link href={p.slug === "vine-tomatoes" ? R.trace(code) : R.traceSearch} className="glass-dark absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-night/60"><Icon name="qr-code" size={15} />{code}</Link>
        <div className="absolute bottom-4 right-4 flex gap-1.5 md:hidden">{imgs.map((_, n) => <span key={n} className={cx("h-1.5 rounded-full transition-all duration-300", n === i ? "w-5 bg-white" : "w-1.5 bg-white/60")} />)}</div>
      </motion.div>
      <LayoutGroup id="thumbs">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {imgs.map((src, n) => (
            <button key={src + n} onClick={() => setI(n)} aria-label={`Photo ${n + 1}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: n === 0 ? TINT[p.img] : undefined }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className={cx("h-full w-full object-cover transition-[transform,opacity] duration-300 hover:scale-105", n === 0 && "mix-blend-multiply", n !== i && "opacity-75")} />
              {n === i && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-2xl ring-[3px] ring-inset ring-deep" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            </button>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

/* ---------- Buy box ---------- */
export function ProductBuy({ p, catLabel }: { p: Product; catLabel: string }) {
  const farm = farmBySlug(p.farm);
  const sizes = sizesOf(p);
  const [size, setSize] = useState((sizes.find((x) => x.mult === 1) ?? sizes[0]).label);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const { add } = useBag();
  const toast = useToast();
  const btn = useRef<HTMLDivElement>(null);
  const s = sizes.find((x) => x.label === size) ?? sizes[0];
  const price = Math.round(p.price * s.mult);
  const steps = journeyOf(p);
  const code = traceCodeOf(p);
  const onAdd = () => {
    const item: Product = s.mult === 1 ? p : { ...p, slug: `${p.slug}--${s.label.replace(/\W+/g, "-").toLowerCase()}`, price, unit: s.unit, name: `${p.name}, ${s.label}` };
    add(item, btn.current);
    for (let n = 1; n < qty; n++) add(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
      <Reveal><Gallery p={p} /></Reveal>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Crumbs items={[["Shop", R.shop], [catLabel, p.cat === "packs" ? R.packs : R.category(p.cat)], [p.name]]} />
          <Link href={R.farm(farm.slug)} className="group/fl inline-flex w-fit items-center gap-2 text-[14px] font-semibold text-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={farm.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
            <span className="group-hover/fl:underline">{farm.name}</span><span className="font-normal text-muted">· {farm.district}</span><Icon name="badge-check" size={16} className="text-leaf" />
          </Link>
          <SplitWords text={p.name} className={cx(T.h1, "text-deep")} delay={0.05} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative overflow-hidden text-[30px] font-semibold tracking-[-0.02em] tabular">
              <AnimatePresence mode="popLayout" initial={false}><motion.span key={price} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>{cedi(price)}</motion.span></AnimatePresence>
            </span>
            <span className="text-[15px] text-muted">per {s.unit}</span>
            {p.was && <span className="rounded-full bg-plum px-2.5 py-1 text-[12px] font-semibold text-white">15% off this week</span>}
          </div>
          <Link href={R.reviews(p.slug)} className="inline-flex w-fit items-center gap-2 text-[14px] text-muted hover:text-deep"><Stars n={RATING.avg} size={15} /><span className="font-semibold text-ink">{RATING.avg}</span>· {RATING.count} reviews</Link>
          <Stagger className="flex flex-wrap gap-2" gap={0.08} y={8}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="circle-check" size={14} className="text-leaf" />Farm checked 6 Oct</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="scale" size={14} className="text-leaf" />{p.proof === 3 ? "Weighed at packhouse" : "Checked by officer"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="spray-can" size={14} className="text-leaf" />Last spray 16 days before harvest</span>
          </Stagger>
        </div>

        {sizes.length > 1 && (
          <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">Size</span><Pills items={sizes.map((x) => x.label)} value={size} onChange={setSize} size="S" /></div>
        )}

        <div className="flex items-center gap-2.5">
          <QtyStepper value={qty} onInc={() => setQty(qty + 1)} onDec={() => setQty(Math.max(1, qty - 1))} />
          <div ref={btn} className="flex-1">
            <button onClick={onAdd} className="group/ab relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-deep px-6 font-semibold text-white transition-[background-color,box-shadow,transform] duration-150 hover:bg-forest hover:shadow-[var(--shadow-1)] active:scale-[0.97]">
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="ok" className="inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.2 }}><Icon name="check" size={18} className="text-lime" />Added to bag</motion.span>
                ) : (
                  <motion.span key="add" className="inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.2 }}>Add to bag · {cedi(price * qty)}<Icon name="arrow-right" size={18} className="transition-transform group-hover/ab:translate-x-[3px]" /></motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <button onClick={() => { setSaved(!saved); toast(saved ? "Removed from saved items" : "Saved to your list"); }} aria-pressed={saved} aria-label="Save" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-deep ring-1 ring-line transition-colors hover:bg-mist">
            <motion.span animate={{ scale: saved ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}><Icon name="heart" size={20} className={saved ? "fill-tomato text-tomato" : ""} /></motion.span>
          </button>
        </div>

        <div className="flex flex-col rounded-2xl bg-paper px-4 py-2">
          {([["truck", "Delivered tomorrow, 9 am to 1 pm", "Accra, Kumasi and Tamale", R.delivery], ["repeat", "Add to your weekly box", "Save 5% on repeat orders", R.weeklyBox], ["shield-check", "Freshness promise", "Not fresh? We refund or replace", R.help]] as const).map(([i, t, d, h]) => (
            <Link key={t} href={h} className="group/il flex items-center gap-3.5 border-b border-line py-3 last:border-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-deep"><Icon name={i} size={18} /></span>
              <span className="flex-1"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[13px] text-muted">{d}</span></span>
              <Icon name="chevron-right" size={18} className="text-muted transition-transform group-hover/il:translate-x-0.5" />
            </Link>
          ))}
        </div>

        <Reveal className="flex flex-col gap-3 rounded-3xl bg-deep p-4 text-white">
          <div className="flex items-center justify-between px-1">
            <span className="text-[16px] font-semibold">Where this batch has been</span>
            <Link href={p.slug === "vine-tomatoes" ? R.trace(code) : R.traceInfo} className="inline-flex items-center gap-1 text-[14px] font-semibold text-lime">Full journey <Icon name="arrow-up-right" size={16} /></Link>
          </div>
          <JourneyMap steps={steps} />
          <div className="grid grid-cols-3 gap-2">
            {[["12 Oct", "Harvested"], [p.slug === "vine-tomatoes" ? `${JOURNEY.steps[0].kg}` : "180 kg", "Weighed"], ["Grade A", "Sorted"]].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-forest px-3 py-2.5"><div className="text-[15px] font-semibold">{n}</div><div className="text-[12px] text-white/70">{l}</div></div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- Record tabs ---------- */
const TABS = ["How it was grown", "Spray and fertiliser record", "Storage and cooking"];
export function ProductRecord({ p }: { p: Product }) {
  const [tab, setTab] = useState(TABS[1]);
  const harvest = JOURNEY.steps[0].time.split(" · ")[0];
  return (
    <div className="flex flex-col gap-8">
      <Tabs items={TABS} value={tab} onChange={setTab} />
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="rounded-3xl bg-white p-5 md:p-6">
            {tab === TABS[1] && (
              <>
                <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><span className="text-[17px] font-semibold">Inputs used on Plot A</span><span className="text-[13px] font-medium text-leaf">Logged by farmer · checked by officer</span></div>
                <div className="overflow-hidden rounded-2xl">
                  <div className="grid grid-cols-[80px_1fr_80px] gap-3 bg-paper px-4 py-2.5 text-[13px] text-muted md:grid-cols-[120px_1fr_120px]"><span>Date</span><span>Input</span><span>Safe after</span></div>
                  {[...JOURNEY.sprays.slice(0, 3).map((s) => [s.date, `${s.input}${s.type === "Organic" ? " (organic)" : ""}`, s.gap === "None" ? "—" : s.gap]), [harvest, "Harvest", "—"]].map(([d, i, g], n) => (
                    <motion.div key={d + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + n * 0.05, duration: 0.3 }} className="grid grid-cols-[80px_1fr_80px] gap-3 border-b border-line px-4 py-3.5 text-[14px] last:border-0 md:grid-cols-[120px_1fr_120px]">
                      <span className="font-medium">{d}</span><span>{i}</span><span className="text-muted">{g}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 flex items-start gap-2.5 rounded-xl bg-success-bg px-4 py-3 text-[14px] text-success"><Icon name="circle-check" size={18} className="mt-px shrink-0" />Safe to eat: last spray was 16 days before harvest. The safe gap is 14 days.</motion.div>
              </>
            )}
            {tab === TABS[0] && (
              <div className="flex flex-col gap-4">
                <span className="text-[17px] font-semibold">Grown on Plot A, {farmBySlug(p.farm).district}</span>
                <p className="text-muted">Planted in late July on a raised bed with compost, watered by drip line from the group’s borehole. Picked by hand in the cool of the morning.</p>
                <ul className="flex flex-col gap-3">
                  {practicesOf(p).map((g) => <li key={g} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-deep"><Icon name="check" size={15} /></span>{PRACTICE_LABEL[g]}</li>)}
                  <li className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-deep"><Icon name="droplets" size={15} /></span>Drip irrigation</li>
                </ul>
              </div>
            )}
            {tab === TABS[2] && (
              <div className="flex flex-col gap-4">
                <span className="text-[17px] font-semibold">Keep it fresh for longer</span>
                <ul className="flex flex-col gap-3 text-[15px]">
                  {["Keep at room temperature until ripe, then move to the fridge.", "Store away from direct sun and do not wash until you use it.", "Best eaten within five days of delivery.", "Great for stew, light soup, jollof and fresh salads."].map((t) => <li key={t} className="flex items-start gap-3"><Icon name="leaf" size={18} className="mt-0.5 shrink-0 text-leaf" />{t}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col gap-4">
          <h3 className={cx(T.h4, "text-deep")}>Why we show this</h3>
          <p className="text-muted">Every spray and fertiliser is logged on the farmer app and checked by a field officer. If a harvest comes too soon after a spray, it cannot be sold.</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="user-check" size={14} className="text-leaf" />Officer Yaw Darko</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="calendar-check" size={14} className="text-leaf" />Checked 6 Oct</span>
          </div>
          <Link href={R.traceSpray()} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-deep">See a full spray record <Icon name="arrow-up-right" size={18} /></Link>
        </div>
      </div>
    </div>
  );
}

export function FarmerActions({ farm, name }: { farm: string; name: string }) {
  const [on, setOn] = useState(false);
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button href={R.farm(farm)} variant="lime" size="M" arrow>Visit the farm</Button>
      <Button variant="glass" size="M" icon={on ? "check" : undefined} onClick={() => { setOn(!on); toast(on ? `You stopped following ${name}` : `You follow ${name}. We will tell you when they harvest.`); }}>{on ? "Following" : "Follow"}</Button>
    </div>
  );
}
