"use client";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { EASE, Stagger } from "@/components/motion";
import { Container } from "@/components/ui";
import { cx } from "@/components/tokens";
import { PLACES } from "@/lib/data";
import { AREA_LOOKUP, ZONES } from "@/lib/data-market";

type Ctx = { zone?: string; setZone: (z?: string) => void; result: { ok: boolean; text: string } | null; setResult: (r: { ok: boolean; text: string } | null) => void };
const C = createContext<Ctx>({ setZone: () => {}, result: null, setResult: () => {} });

export function AreaCheck() {
  const { setZone, setResult } = useContext(C);
  const [v, setV] = useState("East Legon, Accra");
  const check = () => {
    const s = v.toLowerCase();
    const key = Object.keys(AREA_LOOKUP).sort((a, b) => b.length - a.length).find((k) => s.includes(k));
    const z = key ? ZONES.find((x) => x.id === AREA_LOOKUP[key]) : undefined;
    const place = v.split(",")[0].trim() || v;
    if (z) { setZone(z.id); setResult({ ok: true, text: `Good news. We deliver to ${place} ${z.days === "Every day" ? "every day" : z.days === "Mon to Sat" ? "every day except Sunday" : `on ${z.days}`}.` }); }
    else { setZone(undefined); setResult({ ok: false, text: `We do not deliver to ${place} yet. Leave your number at checkout and we will tell you when we do.` }); }
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); check(); }} className="flex w-full max-w-[520px] items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-[var(--shadow-1)]">
      <Icon name="map-pin" size={18} className="shrink-0 text-leaf" />
      <input value={v} onChange={(e) => setV(e.target.value)} aria-label="Your area" placeholder="Your area, e.g. Osu, Accra" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted" />
      <button className="h-10 shrink-0 rounded-full bg-deep px-5 text-[14px] font-semibold text-white transition-colors hover:bg-forest">Check my area</button>
    </form>
  );
}

export function DeliveryZones({ top }: { top: ReactNode }) {
  const [zone, setZone] = useState<string | undefined>();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const route: [number, number][] = [[PLACES.tamale.lng, PLACES.tamale.lat], [PLACES.kumasi.lng, PLACES.kumasi.lat], [PLACES.accra.lng, PLACES.accra.lat]];
  return (
    <C.Provider value={{ zone, setZone, result, setResult }}>
      <div className="-mt-6 bg-mist pb-10 md:-mt-10"><Container>{top}</Container></div>
      <section className="py-10 md:py-14">
        <Container className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={result.text} initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                <div className={cx("flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-[15px] font-medium", result.ok ? "bg-success-bg text-success" : "bg-warning-bg text-warning")}><Icon name={result.ok ? "circle-check" : "circle-alert"} size={18} />{result.text}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <LiveMap styleName="light" height="h-[380px] md:h-[480px] lg:h-[560px]" live="Vans out now: 7" focus={{ lat: 7.5, lng: -1.0, zoom: 6.1 }}
              plots={ZONES.map((z) => ({ id: z.id, name: z.name, color: "#5F9F0D", coords: [[z.lng - z.size, z.lat + z.size * 0.8], [z.lng + z.size * 1.1, z.lat + z.size], [z.lng + z.size, z.lat - z.size * 0.9], [z.lng - z.size * 1.05, z.lat - z.size], [z.lng - z.size, z.lat + z.size * 0.8]] as [number, number][] }))}
              routes={[{ id: "trunk", coords: route, color: "#FF7006" }]}
              vans={[{ id: "v1", route, speed: 0.012 }, { id: "v2", route: [...route].reverse(), speed: 0.01, offset: 0.45 }]}
              pins={ZONES.map((z) => ({ id: z.id, lat: z.lat, lng: z.lng, kind: "home" as const, label: z.name, sub: z.days }))}
              legend={[["#5F9F0D", "Delivery zone"], ["#FF7006", "Van on the road"]]}
              active={zone} onPin={(id) => setZone(id)} />
            <Stagger className="flex flex-col gap-3">
              {ZONES.map((z) => {
                const on = zone === z.id;
                return (
                  <button key={z.id} onClick={() => setZone(on ? undefined : z.id)} aria-pressed={on} className={cx("relative flex w-full flex-col gap-2 rounded-3xl p-5 text-left transition-transform duration-300 hover:-translate-y-0.5 md:p-6", z.tint)}>
                    {on && <motion.span layoutId="zone-on" className="absolute inset-0 rounded-3xl ring-2 ring-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="flex items-center justify-between gap-3"><span className="text-[22px] font-semibold tracking-[-0.01em]">{z.name}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="calendar" size={14} />{z.days}</span></span>
                    <span className="text-[14px] text-muted">{z.areas}</span>
                    <span className="text-[14px] font-semibold text-deep">{z.fee}</span>
                  </button>
                );
              })}
            </Stagger>
          </div>
        </Container>
      </section>
    </C.Provider>
  );
}
