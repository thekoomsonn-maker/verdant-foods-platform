"use client";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { PortalShell, ADM, Kpi, KpiRow } from "../portal/shell";
import { LiveMap, type Pin, type RouteLine, type Van } from "../map";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { DELIVERY_DEPOT, DELIVERY_VANS } from "@/lib/data-admin2";
import { ActionPill, GrowBar, IconBox } from "./a2-ui";

const VANS: Van[] = DELIVERY_VANS.map((v) => ({ id: v.id, label: v.id.split("-")[0], route: v.route, speed: v.speed, offset: v.offset }));

export function A2Deliveries() {
  const toast = useToast();
  const [done, setDone] = useState(() => DELIVERY_VANS.map((v) => v.done));
  const [temps, setTemps] = useState(() => DELIVERY_VANS.map((v) => v.temp));
  const [sel, setSel] = useState<string | null>(null);

  // Live: a stop is completed every few seconds and the cold boxes drift a little.
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n++;
      setDone((d) => { const i = n % d.length; return d.map((x, j) => (j === i && x < DELIVERY_VANS[j].total ? x + 1 : x)); });
      setTemps((t) => t.map((x, j) => (j === 2 ? x : Math.max(3, Math.min(7, x + (((n + j) % 3) - 1) * 0.5)))));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const pins: Pin[] = useMemo(() => [
    { id: "depot", kind: "handover", icon: "warehouse", lat: DELIVERY_DEPOT.lat, lng: DELIVERY_DEPOT.lng, label: "Depot", sub: "Accra" },
    ...DELIVERY_VANS.flatMap((v, j) => v.route.slice(1).map(([lng, lat], k): Pin => {
      const reached = (k + 1) / (v.route.length - 1) <= done[j] / v.total;
      return { id: `${v.id}-${k}`, kind: reached ? "farm" : "handover", icon: reached ? "check" : "house", lat, lng, label: reached ? "Delivered" : "Next stop", sub: v.id.split("-")[0] };
    })),
  ], [done]);
  const routes: RouteLine[] = useMemo(() => DELIVERY_VANS.map((v) => ({ id: v.id, coords: v.route, color: !sel || sel === v.id ? v.color : "#C9D3CE" })), [sel]);
  const nextStop = (j: number) => { const v = DELIVERY_VANS[j]; const k = Math.min(v.route.length - 2, Math.floor((done[j] / v.total) * (v.route.length - 1))); return `${v.id}-${k}`; };
  const active = sel ? nextStop(DELIVERY_VANS.findIndex((v) => v.id === sel)) : undefined;

  return (
    <PortalShell cfg={ADM} active="Deliveries" title="Deliveries" sub="Today: 146 orders, 7 vans, 3 cities."
      actions={<ActionPill arrow onClick={() => toast("Tomorrow: 152 orders across 7 vans. Routes are being built.", "info")}>Plan tomorrow</ActionPill>}>
      <KpiRow>
        <Kpi l="Delivered" v="82" d="of 146" icon="circle-check" spark={[10, 18, 26, 37, 45, 58, 70, 82]} />
        <Kpi l="On time" v="96%" d="Target 95%" icon="timer" />
        <Kpi l="Failed" v="2" d="Customer not home" icon="circle-x" tone="danger" />
        <Kpi l="Cold chain" v="6 of 7" d="1 van too warm" icon="thermometer-snowflake" tone="warning" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.25fr_1fr]">
        <LiveMap styleName="light" height="h-[380px] md:h-[480px] lg:h-[520px]" focus={{ lat: 5.615, lng: -0.17, zoom: 10.9 }} pins={pins} vans={VANS} routes={routes}
          active={active} onPin={(id) => setSel(DELIVERY_VANS.find((v) => id.startsWith(v.id))?.id ?? null)}
          live="Accra · 4 vans" legend={[["#BBEA70", "Delivered"], ["#FF7006", "Van"], ["#FFFFFF", "Next stops"]]} />
        <div className="flex flex-col gap-3">
          {DELIVERY_VANS.map((v, j) => {
            const warm = temps[j] > 8; const on = sel === v.id;
            return (
              <motion.button key={v.id} onClick={() => setSel(on ? null : v.id)} aria-pressed={on}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + j * 0.06, duration: 0.45, ease: EASE }}
                className={cx("flex flex-col gap-3 rounded-[20px] p-4 text-left transition-[background-color,transform] duration-200 hover:-translate-y-0.5 md:p-5", on ? "bg-mist" : "bg-white")}>
                <div className="flex items-center gap-3">
                  <IconBox icon="truck" tone="warning" size={40} />
                  <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold">{v.id} · {done[j]} of {v.total} stops</div><div className="text-[13px] text-muted">{v.driver}</div></div>
                  <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium tabular", warm ? "bg-danger-bg text-danger" : "bg-success-bg text-success")}>
                    <span className={cx("h-1.5 w-1.5 rounded-full bg-current", warm && "animate-breathe")} />{temps[j].toFixed(0)} °C
                  </span>
                </div>
                <GrowBar pct={(done[j] / v.total) * 100} color={warm ? "bg-tomato" : "bg-leaf"} delay={0.3 + j * 0.08} />
                {warm && <span className="flex items-center gap-1.5 text-[13px] text-danger"><Icon name="thermometer" size={14} />Above 8 °C. Driver told to check the cold box.</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
