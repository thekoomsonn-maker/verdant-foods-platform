"use client";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { PortalShell, ADM, Panel } from "../portal/shell";
import { Button, Pills, Status, type Tone } from "../ui";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { BATCHES, type Batch, type Stage } from "@/lib/data-admin2";
import { R } from "@/lib/routes";
import { IconBox } from "./a2-ui";

const STAGE_TONE: Record<Stage, Tone> = { Packed: "success", "In transit": "info", Held: "danger", "At point": "warning" };
const OUT_BG = { sun: "bg-sun-soft", orange: "bg-orange-soft", tomato: "bg-danger-bg", mist: "bg-mist" } as const;

export function A2Batches() {
  const [id, setId] = useState("VF-B-1182");
  const [filter, setFilter] = useState(false);
  const [stage, setStage] = useState("All");
  const b = BATCHES.find((x) => x.id === id)!;
  const rows = BATCHES.filter((x) => stage === "All" || x.stage === stage);
  return (
    <PortalShell cfg={ADM} active="Batches and handovers" title="Batches and handovers" sub="Every split and merge, with weights."
      actions={<Button href={R.adminCodes} size="M" arrow>Scan a code</Button>}>
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold">Today · 46 batches</h2>
          <button onClick={() => setFilter((f) => !f)} aria-expanded={filter} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf hover:text-deep"><Icon name="list-filter" size={16} />Filter</button>
        </div>
        <AnimatePresence initial={false}>
          {filter && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <Pills items={["All", "Packed", "In transit", "Held", "At point"]} value={stage} onChange={setStage} size="S" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col">
          <div className="hidden grid-cols-[1.1fr_1.5fr_1.5fr_1fr_1fr] rounded-xl bg-paper px-4 py-2.5 text-[13px] font-medium text-muted md:grid"><span>Batch</span><span>Crop</span><span>From</span><span>In / out</span><span>Stage</span></div>
          {rows.map((x, i) => (
            <motion.button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35 }}
              className={cx("relative grid grid-cols-2 gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 text-left text-[14px] transition-colors last:border-0 md:grid-cols-[1.1fr_1.5fr_1.5fr_1fr_1fr] md:items-center", x.id === id ? "" : "hover:bg-paper/70")}>
              {x.id === id && <motion.span layoutId="batch-row" className="absolute inset-0 rounded-xl bg-mist" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
              <span className="relative font-semibold">{x.id}</span>
              <span className="relative text-right md:text-left">{x.crop}</span>
              <span className="relative text-muted md:text-ink">{x.from}</span>
              <span className="relative text-right tabular md:text-left">{x.io}</span>
              <span className="relative col-span-2 md:col-span-1"><Status tone={STAGE_TONE[x.stage]}>{x.stage}</Status></span>
            </motion.button>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="text-[18px] font-semibold">{b.id} · how it moved</h2>
        <Flow key={b.id} b={b} />
      </Panel>

      <Panel>
        <h2 className="text-[18px] font-semibold">Handovers</h2>
        <Timeline key={b.id} b={b} />
      </Panel>
    </PortalShell>
  );
}

/** Merge and split diagram: inputs arrive, the arrows draw, the batch lands, then the outputs fan out. */
function Flow({ b }: { b: Batch }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const toast = useToast();
  const d = (s: number) => (reduce ? 0 : s);
  const show = (delay: number, x = 0) => ({ initial: { opacity: 0, x: reduce ? 0 : x, scale: reduce ? 1 : 0.96 }, animate: inView ? { opacity: 1, x: 0, scale: 1 } : {}, transition: { duration: 0.5, delay: d(delay), ease: EASE } });
  const held = b.mode === "Held";
  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex flex-col gap-2.5">
          {b.inputs.map((n, i) => (
            <motion.div key={n.id} {...show(i * 0.12, -16)} className="rounded-2xl bg-lime-soft px-4 py-3 md:min-w-[170px]">
              <div className="text-[15px] font-semibold">{n.t}</div><div className="text-[13px] text-muted">{n.s}</div>
            </motion.div>
          ))}
        </div>
        <Arrow delay={d(0.3)} on={inView} />
        <motion.div {...show(0.55)} className={cx("relative flex flex-col gap-2 overflow-hidden rounded-2xl px-5 py-4 text-white md:min-w-[200px]", held ? "bg-danger" : "bg-deep")}>
          {!reduce && inView && <motion.span className="pointer-events-none absolute inset-0 bg-white/10" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }} />}
          <span className={cx("inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold", held ? "bg-white text-danger" : "bg-lime text-night")}>
            <Icon name={b.mode === "Merged" ? "git-merge" : held ? "triangle-alert" : "package"} size={15} />{b.mode === "Single" ? "One farm" : b.mode}
          </span>
          <span className="text-[20px] font-semibold">{b.id}</span>
          <span className="text-[13px] text-white/80 tabular">{b.centre}</span>
        </motion.div>
        <Arrow delay={d(0.85)} on={inView} />
        <div className="flex flex-col gap-2.5">
          {b.outputs.map((n, i) => (
            <motion.div key={n.id} {...show(1.05 + i * 0.12, 16)} className={cx("rounded-2xl px-4 py-3 md:min-w-[180px]", OUT_BG[n.tone])}>
              <div className="text-[15px] font-semibold">{n.t}</div><div className="text-[13px] text-muted">{n.s}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => toast(held ? `${b.id} stays held until the weight is explained` : `Split started for ${b.id}. Scan the new crates in the packhouse app.`, held ? "info" : "success")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper px-3.5 text-[14px] font-medium text-deep transition-colors hover:bg-mist">
          <Icon name="split" size={16} />Split
        </button>
        {b.mode !== "Merged" && !held && (
          <button onClick={() => toast(`Pick a batch to merge with ${b.id}`, "info")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper px-3.5 text-[14px] font-medium text-deep transition-colors hover:bg-mist"><Icon name="git-merge" size={16} />Merge</button>
        )}
      </div>
    </div>
  );
}

function Arrow({ delay, on }: { delay: number; on: boolean }) {
  return (
    <svg viewBox="0 0 48 16" className="mx-auto h-4 w-12 shrink-0 rotate-90 text-muted md:mx-0 md:rotate-0" aria-hidden>
      <motion.path d="M2 8 H40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="1 0" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 0.35, delay, ease: EASE }} />
      <motion.path d="M34 3 L40 8 L34 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.2, delay: delay + 0.3 }} />
    </svg>
  );
}

/** Handover timeline: the spine grows downward and each step arrives in order. */
function Timeline({ b }: { b: Batch }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="relative flex flex-col">
      <motion.span className="absolute bottom-6 left-[17px] top-6 w-[2px] origin-top rounded-full bg-mint" initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.2 * b.steps.length + 0.3, ease: EASE }} />
      {b.steps.map((s, i) => (
        <motion.div key={s.t} initial={{ opacity: 0, x: reduce ? 0 : -8 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: reduce ? 0 : 0.2 + i * 0.2, duration: 0.4, ease: EASE }} className="relative flex items-center gap-3 py-3">
          <span className="relative"><IconBox icon={s.icon} tone={s.warn ? "danger" : "info"} /></span>
          <div className="min-w-0 flex-1"><div className="text-[15px] font-semibold">{s.t}</div><div className="text-[13px] text-muted">{s.s}</div></div>
          <span className="shrink-0 text-[14px] text-muted tabular">{s.time}</span>
        </motion.div>
      ))}
    </div>
  );
}
