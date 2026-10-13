"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Pills } from "@/components/ui";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { Countdown, StatusFor, Thumb } from "@/components/b2b/kit";
import { CLAIMS, CROP_IMG, type Claim } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

const NOTE = { warning: "bg-warning-bg text-warning", info: "bg-info-bg text-info", success: "bg-success-bg text-success" };

export function ClaimsClient() {
  const toast = useToast();
  const [claims, setClaims] = useState<Claim[]>(CLAIMS);
  const [sel, setSel] = useState(CLAIMS[0].id);
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const detail = useRef<HTMLDivElement>(null);
  const list = claims.filter((c) => filter === "All" || (filter === "Open" ? c.status === "Open" || c.status === "With farm" : c.status === "Credited" || c.status === "Replaced"));
  const c = claims.find((x) => x.id === sel)!;
  const resolve = (status: Claim["status"], note: string, msg: string) => { setClaims((xs) => xs.map((x) => (x.id === c.id ? { ...x, status, note, noteTone: "success", dueH: undefined } : x))); toast(msg); };
  const pick = (id: string) => { setSel(id); if (window.innerWidth < 1280) setTimeout(() => detail.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-[440px_1fr]">
      <section className="flex flex-col gap-3 self-start rounded-[20px] bg-white p-3 md:p-4">
        <div className="flex items-center justify-between px-1 pt-1">
          <h2 className="text-[20px] font-semibold">Claims</h2>
          <button onClick={() => setShowFilter((s) => !s)} aria-expanded={showFilter} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-leaf hover:text-deep"><Icon name="list-filter" size={17} />Filter</button>
        </div>
        <AnimatePresence initial={false}>
          {showFilter && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><Pills size="S" items={["All", "Open", "Resolved"]} value={filter} onChange={setFilter} /></motion.div>}
        </AnimatePresence>
        <LayoutGroup id="claims">
          <ul className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((x, i) => {
                const on = x.id === sel;
                return (
                  <motion.li key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}>
                    <button onClick={() => pick(x.id)} aria-pressed={on} className={cx("relative flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors", !on && "hover:bg-paper")}>
                      {on && <motion.span layoutId="claim-hi" className="absolute inset-0 rounded-xl bg-mist" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                      <span className="relative min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{x.id} · {x.crop === "Red onions" ? "Onions" : x.crop} · {x.short}</span><span className="block text-[14px] text-muted">{x.delivery}</span></span>
                      <span className="relative"><StatusFor s={x.status} /></span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </LayoutGroup>
      </section>

      <div ref={detail} className="scroll-mt-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="flex flex-col gap-5 rounded-[20px] bg-white p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 className="text-[20px] font-semibold">{c.id} · {c.crop === "Tomatoes" ? "Vine tomatoes" : c.crop}</h2><p className="text-[14px] text-muted">{c.detail}</p></div>
              {c.dueH ? <Countdown hours={c.dueH} /> : <StatusFor s={c.status} />}
            </div>
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 + i * 0.06, duration: 0.35, ease: EASE }} className="w-1/3 max-w-[120px]">
                  <Thumb img={CROP_IMG[c.crop]} size={120} className="!h-auto aspect-[4/3] !w-full" />
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="mb-2 text-[16px] font-semibold">What the batch record shows</h3>
              <ol className="relative flex flex-col">
                <motion.span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-line" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }} />
                {c.steps.map((s, i) => (
                  <motion.li key={s.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.35, ease: EASE }} className="relative flex items-center gap-3.5 py-2.5">
                    <span className={cx("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full", s.bad ? "bg-danger-bg text-danger" : "bg-mist text-deep")}><Icon name={s.icon} size={18} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{s.title}</span><span className="block text-[13px] text-muted">{s.time}</span></span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }} className={cx("shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium tabular", s.bad ? "bg-danger-bg text-danger" : "bg-paper text-muted")}>{s.tag}</motion.span>
                  </motion.li>
                ))}
              </ol>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={c.note} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }} className={cx("flex items-start gap-3 rounded-2xl px-4 py-3.5 text-[15px]", NOTE[c.noteTone])}>
                <Icon name={c.noteTone === "warning" ? "triangle-alert" : c.noteTone === "info" ? "info" : "circle-check"} size={18} className="mt-0.5 shrink-0" />{c.note}
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-wrap gap-2.5">
              {c.status === "Open" && <>
                <button onClick={() => resolve("Credited", `GH₵ ${c.credit} credited to your next invoice, INV-2209.`, `GH₵ ${c.credit} credit accepted for ${c.id}`)} className="group/b inline-flex h-11 items-center gap-2 rounded-full bg-deep px-5 text-[15px] font-semibold text-white hover:bg-forest active:scale-[0.97]">Accept GH₵ {c.credit} credit <Icon name="arrow-right" size={18} className="transition-transform group-hover/b:translate-x-[3px]" /></button>
                <button onClick={() => resolve("Replaced", "A replacement is booked on Thursday’s 6 am van at no cost.", `Replacement booked for Thursday on ${c.id}`)} className="h-11 rounded-full bg-mist px-5 text-[15px] font-semibold text-deep hover:bg-mint active:scale-[0.97]">Replace on Thursday</button>
              </>}
              {c.status === "With farm" && <button onClick={() => toast(`Reminder sent to the farm about ${c.id}`)} className="h-11 rounded-full bg-mist px-5 text-[15px] font-semibold text-deep hover:bg-mint">Nudge the farm</button>}
              <Link href={R.b2bReports} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-deep hover:bg-mist">Full trace report <Icon name="arrow-up-right" size={16} /></Link>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
