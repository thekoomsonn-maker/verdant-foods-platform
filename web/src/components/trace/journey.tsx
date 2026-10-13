"use client";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../icon";
import { LiveMap, type Pin } from "../map";
import { EASE } from "../motion";
import { cx } from "../tokens";
import { JOURNEY, plotAround } from "@/lib/data";
import { HANDOVER_LOSS } from "@/lib/data-trace";

type Step = (typeof JOURNEY.steps)[number];
const KIND = (i: number, n: number): Pin["kind"] => (i === 0 ? "farm" : i === n - 1 ? "home" : i === 3 ? "van" : "handover");
const SHORT = ["Plot A, Nyankpala", "Tolon collection", "Tamale packhouse", "Cold van", "Your door, Osu"];

/** Scroll-linked journey: the sticky map follows the step that is in the middle of the screen (spec §8). */
export function Journey() {
  const steps = JOURNEY.steps;
  const [active, setActive] = useState(0);
  const [reached, setReached] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 62%", "end 62%"] });
  const rail = useSpring(scrollYProgress, { stiffness: 180, damping: 36 });

  const enter = (i: number) => { setActive(i); setReached((r) => Math.max(r, i)); };
  const goTo = (i: number) => { enter(i); items.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); };

  const pins: Pin[] = steps.map((s, i) => ({ id: String(i), lat: s.lat, lng: s.lng, kind: KIND(i, steps.length), label: SHORT[i], sub: s.kg || undefined }));
  const done = reached >= steps.length - 1;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-6">
      {/* Map: sticky on every size; on phones it sits under the navigation. */}
      <div className="sticky top-[64px] z-20 -mx-5 self-start bg-white px-5 pb-3 pt-2 md:-mx-8 md:px-8 lg:top-24 lg:mx-0 lg:bg-transparent lg:p-0">
        <div className="relative">
          <LiveMap
            height="h-[240px] md:h-[380px] lg:h-[calc(100svh-150px)] lg:max-h-[620px]"
            rounded="rounded-[20px] lg:rounded-3xl"
            focus={{ lat: 7.55, lng: -0.62, zoom: 5.9 }}
            plots={[{ id: "a", coords: plotAround(steps[0].lat, steps[0].lng, 0.03, 0.006) }]}
            routes={[{ id: "r", coords: steps.map((x) => [x.lng, x.lat]) }]}
            pins={pins}
            active={String(active)}
            onPin={(id) => goTo(Number(id))}
            live={`Route of batch ${JOURNEY.batch}`}
            legend={[["#BBEA70", "Farm plot"], ["#FFFFFF", "Handover"], ["#FF7006", "You"]]}
          />
          <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden md:block">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 text-white">
                <span className="text-[13px] tabular text-lime">{active + 1} of {steps.length}</span>
                <span className="text-[14px] font-semibold">{steps[active].title}</span>
                <span className="text-[13px] text-white/70">{steps[active].time}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ol ref={list} className="relative">
          <span aria-hidden className="absolute bottom-10 left-[21px] top-6 w-[2px] rounded-full bg-mint" />
          <motion.span aria-hidden style={{ scaleY: reduce ? 1 : rail }} className="absolute bottom-10 left-[21px] top-6 w-[2px] origin-top rounded-full bg-leaf" />
          {steps.map((s, i) => (
            <StepRow key={s.title} s={s} i={i} last={i === steps.length - 1} on={active === i} past={i <= reached}
              onEnter={() => enter(i)} onClick={() => goTo(i)} setEl={(el) => { items.current[i] = el; }} />
          ))}
        </ol>
        <motion.div layout className={cx("flex items-center gap-3 rounded-2xl px-5 py-4 transition-colors duration-500", done ? "bg-success-bg text-success" : "bg-mist text-muted")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
            <motion.path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: done ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }} />
          </svg>
          <span className="text-[15px] font-medium">{done ? "Weights match at every handover. Nothing was added or swapped." : "Weights are compared at every handover as the batch moves."}</span>
        </motion.div>
      </div>
    </div>
  );
}

function StepRow({ s, i, last, on, past, onEnter, onClick, setEl }: { s: Step; i: number; last: boolean; on: boolean; past: boolean; onEnter: () => void; onClick: () => void; setEl: (el: HTMLLIElement | null) => void }) {
  const inner = useRef<HTMLLIElement | null>(null);
  const inView = useInView(inner, { margin: "-48% 0px -42% 0px" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (inView) onEnter(); }, [inView]);
  const loss = HANDOVER_LOSS[i];
  return (
    <li ref={(el) => { inner.current = el; setEl(el); }} className={cx("relative", !last && "pb-3")}>
      <button onClick={onClick} aria-current={on ? "step" : undefined} className={cx("group/st flex w-full gap-4 rounded-2xl p-2 pr-3 text-left transition-colors duration-300", on ? "bg-mist" : "hover:bg-paper")}>
        <motion.span animate={{ scale: on ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className={cx("relative z-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-colors duration-300", last ? (past ? "bg-lime text-night" : "bg-lime-soft text-deep") : past ? "bg-deep text-lime" : "bg-mint text-deep")}>
          {on && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-leaf/40" />}
          <Icon name={s.icon} size={20} className="relative" />
        </motion.span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 pt-1.5">
          <span className="flex items-start justify-between gap-3">
            <span className={cx("text-[18px] font-semibold leading-tight transition-colors", on ? "text-deep" : "text-ink")}>{s.title}</span>
            <span className="shrink-0 pt-0.5 text-[13px] tabular text-muted">{s.time}</span>
          </span>
          <span className="text-[14px] text-muted">{s.place}</span>
          {(s.kg || s.note) && (
            <span className="mt-1.5 flex flex-wrap gap-2">
              {s.kg && <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[13px] font-semibold text-deep tabular"><Icon name="scale" size={14} />{s.kg}</span>}
              {s.note && <span className="rounded-full bg-paper px-3 py-1.5 text-[13px] text-muted ring-1 ring-line">{s.note}</span>}
            </span>
          )}
          <AnimatePresence initial={false}>
            {loss && past && (
              <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 0.2 }} className="overflow-hidden">
                <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-success"><Icon name="circle-check" size={15} />{loss}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>
    </li>
  );
}
