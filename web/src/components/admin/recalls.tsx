"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PortalShell, ADM, Panel, DataTable, Feed } from "../portal/shell";
import { LiveMap, type Pin, type RouteLine } from "../map";
import { Button, Status } from "../ui";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { CountUp, EASE } from "../motion";
import { useToast } from "../toast";
import { PLACES, plotAround } from "@/lib/data";
import { BUYERS_TOLD, RECALL_BUYERS, RECALL_SOURCE, RECALL_STEPS, recallPath } from "@/lib/data-admin-ops";
import { R } from "@/lib/routes";
import { ActionPill, GrowBar, useTick } from "./widgets";

type LngLat = [number, number];
const STAGGER = 80, DRAW = 1100, DELIVERIES = 44;
const PATHS = RECALL_BUYERS.map((b) => recallPath(b));

/** The first fraction f of a polyline, so a line can draw itself. */
function partial(c: LngLat[], f: number): LngLat[] {
  if (f >= 1) return c;
  if (f <= 0) return [];
  const seg = c.slice(1).map((p, i) => Math.hypot(p[0] - c[i][0], p[1] - c[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * f;
  const out: LngLat[] = [c[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) { out.push(c[i + 1]); left -= seg[i]; continue; }
    const k = left / seg[i];
    out.push([c[i][0] + (c[i + 1][0] - c[i][0]) * k, c[i][1] + (c[i + 1][1] - c[i][1]) * k]);
    break;
  }
  return out;
}

const BASE_PINS: Pin[] = [
  { id: "src", kind: "problem", icon: "sprout", lat: RECALL_SOURCE.lat, lng: RECALL_SOURCE.lng, label: "Kumbungu", sub: "source farm" },
  { id: "tamale", kind: "handover", icon: "warehouse", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, label: "Tamale", sub: "packhouse" },
];

export function AdminRecalls() {
  const toast = useToast();
  const tick = useTick(1000);
  const opened = 2 * 3600 + 14 * 60 + tick;
  const [done, setDone] = useState(() => RECALL_STEPS.map((s) => s.done));
  const pct = Math.round(((done.filter(Boolean).length + (done[2] ? 0 : RECALL_STEPS[2].part ?? 0)) / RECALL_STEPS.length) * 100);
  return (
    <PortalShell cfg={ADM} active="Recalls" title="Recalls" sub="Trace forward to every buyer in one click."
      actions={<ActionPill arrow onClick={() => toast("New recall drafted. Choose the batch to trace forward.", "info")}>Start a recall</ActionPill>}>
      <section className="relative flex flex-col gap-5 overflow-hidden rounded-[24px] bg-night p-5 text-white md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-tomato px-3.5 py-1.5 text-[14px] font-semibold">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-tomato" /><Icon name="siren" size={16} className="relative" /><span className="relative">Active · RC-007</span>
            </span>
            <h2 className="text-[30px] font-medium leading-tight tracking-[-0.02em] md:text-[40px]">Pepper batch VF-B-1190</h2>
            <p className="text-white/75">Harvested 9 days after a spray. Needs 14.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1.5 text-[14px] font-medium text-warning tabular"><Icon name="timer" size={16} />Opened {Math.floor(opened / 3600)} h {Math.floor((opened % 3600) / 60)} min ago</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["3", "businesses"], ["41", "shoppers"], ["212 kg", "sold"], ["120 kg", "collected back"]].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-white/[0.07] px-4 py-4 md:px-5"><CountUp value={n} className="text-[24px] font-semibold md:text-[28px]" /><div className="mt-1 text-[14px] text-white/75">{l}</div></div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.65fr_1fr]">
        <TraceForward />
        <Panel title="Recall steps">
          <ol className="flex flex-col gap-1">
            {RECALL_STEPS.map((s, i) => (
              <li key={s.t}>
                <button onClick={() => { setDone((d) => d.map((v, j) => (j === i ? !v : v))); if (!done[i]) toast(`${s.t}: marked done`); }} aria-pressed={done[i]} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition-colors hover:bg-paper">
                  <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200", done[i] ? "bg-success text-white" : "bg-paper")}>
                    {done[i] && <motion.svg viewBox="0 0 16 16" className="h-4 w-4"><motion.path d="M3.5 8.5 L6.5 11.5 L12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: EASE }} /></motion.svg>}
                  </span>
                  <span><span className="block text-[15px] font-semibold">{s.t}</span><span className="block text-[13px] text-muted">{i === 2 && done[i] ? "212 of 212 kg" : s.s}</span></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-3"><GrowBar pct={pct} color="bg-leaf" /><span className="shrink-0 text-[13px] font-semibold text-muted tabular">{pct}%</span></div>
          <Button full onClick={() => toast("Reminder sent to 41 shoppers and Labadi Beach Hotel")}>Send reminder to buyers</Button>
        </Panel>
      </div>

      <Panel title="Buyers told">
        <DataTable cols={[["Buyer", "55%"], ["Bought"], ["Told"], ["Returned"]]} rows={BUYERS_TOLD.map(([b, kg, told, tt, ret, rt]) => [b, kg, <Status key="t" tone={tt}>{told}</Status>, <Status key="r" tone={rt}>{ret}</Status>])} />
      </Panel>

      <Panel title="Past recalls" link={["Problems", R.adminProblems]}>
        <Feed items={[["circle-check", "RC-006 · Cabbage · closed", "Mislabelled weight · 2 buyers", "Aug", "success"], ["circle-check", "RC-005 · Okra · closed", "Spray record missing · 1 buyer", "Jun", "success"]]} />
      </Panel>
    </PortalShell>
  );
}

/** Lines draw from the source farm to every buyer, one after another (spec §8, 80 ms stagger). */
function TraceForward() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [t, setT] = useState(0);
  const total = (PATHS.length - 1) * STAGGER + DRAW;
  const [focus, setFocus] = useState({ lat: 7.55, lng: -1.0, zoom: 5.95 });
  useEffect(() => { if (window.innerWidth < 768) setFocus({ lat: 7.55, lng: -1.0, zoom: 5.4 }); }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setT(total); return; }
    let raf = 0, last = 0;
    setT(0);
    // Wait for the map to fly in on the first run, then draw.
    const wait = setTimeout(() => {
      const t0 = performance.now();
      const loop = (ts: number) => {
        if (ts - last > 30) { last = ts; setT(Math.min(total, ts - t0)); }
        if (ts - t0 < total) raf = requestAnimationFrame(loop); else setT(total);
      };
      raf = requestAnimationFrame(loop);
    }, run === 0 ? 2600 : 150);
    return () => { clearTimeout(wait); cancelAnimationFrame(raf); };
  }, [inView, run, reduce, total]);

  const fr = PATHS.map((_, i) => Math.max(0, Math.min(1, (t - i * STAGGER) / DRAW)));
  const routes: RouteLine[] = useMemo(() => PATHS.map((p, i) => ({ id: RECALL_BUYERS[i].id, coords: partial(p, fr[i]), color: RECALL_BUYERS[i].kind === "buyer" ? "#FF7006" : "#F7C33C" })).filter((r) => r.coords.length > 1), [fr.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const reached = fr.filter((f) => f >= 1).length;
  const pins: Pin[] = useMemo(() => [...BASE_PINS, ...RECALL_BUYERS.filter((_, i) => fr[i] >= 1).map((b): Pin => ({ id: b.id, kind: b.kind, lat: b.lat, lng: b.lng, label: b.kind === "buyer" ? b.name : undefined }))], [reached]); // eslint-disable-line react-hooks/exhaustive-deps
  const plots = useMemo(() => [{ id: "src-plot", coords: plotAround(RECALL_SOURCE.lat, RECALL_SOURCE.lng, 0.04, 0.01), color: "#E5412B" }], []);
  const delivered = reached >= PATHS.length ? DELIVERIES : Math.round((reached / PATHS.length) * DELIVERIES);

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold">Where it went</h2>
        <button onClick={() => setRun((r) => r + 1)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf hover:text-deep"><Icon name="refresh-cw" size={15} />Trace again</button>
      </div>
      <div ref={ref}>
        <LiveMap height="h-[340px] md:h-[400px]" focus={focus} pins={pins} routes={routes} plots={plots} rounded="rounded-2xl"
          live={reached >= PATHS.length ? `${DELIVERIES} deliveries` : `Tracing · ${delivered} of ${DELIVERIES}`}
          legend={[["#E5412B", "Source farm"], ["#FF7006", "Business"], ["#F7C33C", "Shopper"]]} />
      </div>
    </Panel>
  );
}
