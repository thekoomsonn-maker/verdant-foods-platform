"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PortalShell, ADM, Panel, Kpi, KpiRow, DataTable } from "../portal/shell";
import { LiveMap, type Pin, type Plot, type Van } from "../map";
import { Icon, type IconName } from "../icon";
import { Status } from "../ui";
import { cx } from "../tokens";
import { FARMS, PLACES, plotAround } from "@/lib/data";
import { COLLECTION_POINTS, EVENTS_POOL, EVENTS_START, MAP_PROBLEMS, MAP_ROUTES, MAP_VANS, type LiveEvent } from "@/lib/data-admin2";
import { R } from "@/lib/routes";
import { ago, DetailCard, IconBox, useTick } from "./a2-ui";

const LAYERS: [string, IconName][] = [["Farms", "sprout"], ["Collection points", "scale"], ["Vans", "truck"], ["Problems", "triangle-alert"], ["Plots", "layers"]];

// Three plots around each farm; the farm with a spray problem is outlined in tomato.
const PLOTS: Plot[] = FARMS.flatMap((f, i) => [[0, 0], [0.028, -0.02], [-0.024, 0.026]].map(([dy, dx], j) => ({
  id: `${f.slug}-${j}`, name: f.name, color: f.slug === "kumbungu-pepper-farm" ? "#E5412B" : "#BBEA70",
  coords: plotAround(f.lat + dy, f.lng + dx, 0.011 + ((i + j) % 3) * 0.002, 0.003),
})));

const PIN_FARMS: Pin[] = FARMS.map((f) => ({ id: f.slug, kind: "farm", lat: f.lat, lng: f.lng, label: f.name.split(" ")[0], sub: f.district }));
const PIN_POINTS: Pin[] = [
  { id: "packhouse", kind: "handover", icon: "warehouse", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, label: "Tamale packhouse" },
  ...COLLECTION_POINTS.map((c): Pin => ({ id: c.id, kind: "handover", lat: c.lat, lng: c.lng, label: c.name, sub: c.sub })),
];
const PIN_PROBLEMS: Pin[] = MAP_PROBLEMS.map((p) => ({ id: p.id, kind: "problem", lat: p.lat, lng: p.lng, label: p.name, sub: p.sub }));

type Ev = LiveEvent & { key: number; born: number };

export function A2LiveMap() {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(LAYERS.map(([l]) => [l, true])));
  const [sel, setSel] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const tick = useTick(1000);
  const tickRef = useRef(0);
  tickRef.current = tick;
  const [events, setEvents] = useState<Ev[]>(() => EVENTS_START.map((e, i) => ({ ...e, key: i, born: -e.ago })));
  const [focus, setFocus] = useState({ lat: 8.55, lng: -1.45, zoom: 6.6 });

  useEffect(() => { if (window.innerWidth < 768) setFocus({ lat: 8.4, lng: -1.4, zoom: 5.7 }); }, []);

  // A new field event slides in every few seconds while live.
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setEvents((ev) => [{ ...EVENTS_POOL[(ev[0].key + 1) % EVENTS_POOL.length], key: ev[0].key + 1, born: tickRef.current }, ...ev].slice(0, 6));
    }, 5200);
    return () => clearInterval(id);
  }, [live]);

  const updated = tick - (events[0].key >= EVENTS_START.length ? events[0].born : -12);
  const pins = useMemo(() => [...(on.Farms ? PIN_FARMS : []), ...(on["Collection points"] ? PIN_POINTS : []), ...(on.Problems ? PIN_PROBLEMS : [])], [on]);
  const vans: Van[] = useMemo(() => (on.Vans ? MAP_VANS.map((v) => ({ id: v.id, label: v.id.split("-")[0], route: v.route, speed: v.speed, offset: v.offset })) : []), [on.Vans]);
  const routes = useMemo(() => (on.Vans ? MAP_ROUTES : []), [on.Vans]);
  const plots = useMemo(() => (on.Plots ? PLOTS : []), [on.Plots]);
  const close = useCallback(() => setSel(null), []);

  return (
    <PortalShell cfg={ADM} active="Live supply map" title="Live supply map" sub="Every farm, handover and van, right now."
      actions={
        <button onClick={() => setLive((l) => !l)} aria-pressed={live} className={cx("inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors duration-200", live ? "bg-success text-white" : "bg-white text-deep")}>
          <span className="relative flex h-4 w-4 items-center justify-center"><Icon name="activity" size={18} />{live && <span className="absolute -right-1 -top-1 h-2 w-2 animate-breathe rounded-full bg-lime" />}</span>{live ? "Live" : "Paused"}
        </button>
      }>
      <KpiRow>
        <Kpi l="Farms harvesting" v="38" d="2,480 kg logged" icon="sprout" />
        <Kpi l="Vans out" v="7" d="All within 2 °C to 8 °C" icon="truck" />
        <Kpi l="At packhouse" v="2.1 t" d="Tamale · 3 batches" icon="warehouse" tone="muted" />
        <Kpi l="Alerts" v="2" d="1 weight, 1 spray" icon="triangle-alert" tone="danger" bg="bg-danger-bg" />
      </KpiRow>

      <div className="flex flex-wrap gap-2">
        {LAYERS.map(([l, i]) => {
          const a = on[l]; const danger = l === "Problems";
          return (
            <button key={l} aria-pressed={a} onClick={() => setOn((o) => ({ ...o, [l]: !o[l] }))}
              className={cx("inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.97]", a ? (danger ? "bg-danger text-white" : "bg-deep text-white") : "bg-white text-deep hover:bg-mist")}>
              <Icon name={i} size={18} />{l}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <LiveMap height="h-[440px] md:h-[560px] lg:h-[620px]" focus={focus} plots={plots} pins={pins} vans={vans} routes={routes}
          active={sel ?? undefined} onPin={(id) => setSel(id)}
          live={`Updated ${updated < 60 ? `${updated} s` : ago(updated)} ago`}
          legend={[["#BBEA70", "Farm"], ["#FFFFFF", "Handover"], ["#FF7006", "Van"], ["#E5412B", "Problem"]]} />
        <DetailCard open={!!sel} onClose={close} title="Selected on the map">{sel && <Detail id={sel} />}</DetailCard>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.45fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">Live events</h2><button onClick={() => setLive((l) => !l)} className="text-[14px] font-semibold text-leaf hover:text-deep">{live ? "Pause" : "Resume"}</button></div>
          <div className="flex flex-col">
            <AnimatePresence initial={false} mode="popLayout">
              {events.slice(0, 5).map((e, n) => (
                <motion.button layout key={e.key} onClick={() => e.pin && setSel(e.pin)}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-0">
                  {n === 0 && e.born >= 0 && tick - e.born < 3 && <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.4 }} className="pointer-events-none absolute -inset-x-2 inset-y-1 rounded-xl bg-lime-soft" />}
                  <span className="relative"><IconBox icon={e.icon} tone={e.tone ?? "plain"} /></span>
                  <span className="relative min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{e.title}</span><span className="block truncate text-[13px] text-muted">{e.sub}</span></span>
                  <span className="relative shrink-0 text-[13px] text-muted tabular">{ago(tick - e.born)}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </Panel>
        <Panel title="Vans on the road">
          <DataTable cols={[["Van"], ["Stops"], ["Temp"], ["Status"]]} rows={MAP_VANS.slice(0, 3).map((v) => [
            <button key="v" onClick={() => setSel(`van:${v.id}`)} className="font-semibold hover:text-leaf">{v.id}</button>,
            v.stops, `${v.temp} °C`,
            <Status key="s" tone={v.temp > 8 ? "danger" : "success"}>{v.status}</Status>,
          ])} />
          <Link href={R.adminDeliveries} className="text-[14px] font-semibold text-leaf hover:text-deep">All deliveries</Link>
        </Panel>
      </div>
    </PortalShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between gap-3 text-[14px]"><span className="text-muted">{k}</span><span className="font-semibold">{v}</span></div>;
}
function CardHead({ icon, tone, t, s }: { icon: IconName; tone: "danger" | "warning" | "success" | "info"; t: string; s: string }) {
  return <div className="flex items-center gap-3 pr-10"><IconBox icon={icon} tone={tone} size={44} /><div className="min-w-0"><div className="text-[17px] font-semibold leading-tight">{t}</div><div className="text-[13px] text-muted">{s}</div></div></div>;
}
function Go({ href, children }: { href: string; children: string }) {
  return <Link href={href} className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-deep px-5 text-[14px] font-semibold text-white transition-colors hover:bg-forest">{children}<Icon name="arrow-right" size={18} /></Link>;
}

function Detail({ id }: { id: string }) {
  const f = FARMS.find((x) => x.slug === id);
  if (f) return (
    <>
      <CardHead icon="sprout" tone="success" t={f.name} s={`${f.district} · ${f.region}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.photo} alt="" className="h-32 w-full rounded-2xl object-cover" />
      <Row k="Leader" v={f.leader} /><Row k="Members" v={String(f.members)} /><Row k="Mapped land" v={`${f.ha} ha · 3 plots`} /><Row k="With Verdant since" v={String(f.since)} />
      <Go href={R.farm(f.slug)}>Farm profile</Go>
      <Link href={R.adminFarmers} className="text-center text-[14px] font-semibold text-leaf">All farmers and farms</Link>
    </>
  );
  if (id === "packhouse") return (
    <>
      <CardHead icon="warehouse" tone="info" t="Tamale packhouse" s="Sorting, packing and cold store" />
      <Row k="On hand" v="2.1 t" /><Row k="Batches" v="3 packing" /><Row k="Cold room" v="5 °C" /><Row k="Next van out" v="16:00 to Kumasi" />
      <Go href={R.adminBatches}>Batches and handovers</Go>
    </>
  );
  const c = COLLECTION_POINTS.find((x) => x.id === id);
  if (c) return (
    <>
      <CardHead icon="scale" tone="info" t={c.name} s={c.sub} />
      <Row k="Today" v={c.today} /><Row k="Crates weighed" v={String(c.crates)} /><Row k="Scale checked" v="This morning" />
      <Go href={R.adminWeights}>Weight checks</Go>
    </>
  );
  const p = MAP_PROBLEMS.find((x) => x.id === id);
  if (p) return (
    <>
      <CardHead icon="triangle-alert" tone="danger" t={p.name} s={p.sub} />
      <p className="text-[15px] leading-relaxed">{p.detail}</p>
      <Go href={p.href === "weights" ? R.adminWeights : p.href === "recalls" ? R.adminRecalls : R.adminProblems}>{p.action}</Go>
    </>
  );
  const v = MAP_VANS.find((x) => `van:${x.id}` === id);
  if (v) return (
    <>
      <CardHead icon="truck" tone={v.temp > 8 ? "danger" : "warning"} t={v.id} s={`${v.driver} · to ${v.to}`} />
      <Row k="Stops" v={v.stops} /><Row k="Cold box" v={`${v.temp} °C`} /><Row k="Status" v={v.status} />
      <Go href={R.adminDeliveries}>Deliveries</Go>
    </>
  );
  return null;
}
