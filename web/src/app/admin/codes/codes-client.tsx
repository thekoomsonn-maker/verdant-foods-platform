"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { A1Swap } from "@/components/admin/a1-ui";
import { Icon } from "@/components/icon";
import { LiveMap, type Pin, type RouteLine } from "@/components/map";
import { CountUp, EASE } from "@/components/motion";
import { ADM, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Button, KV } from "@/components/ui";
import { FARMS, PLACES, plotAround } from "@/lib/data";
import { TRACE_CODES } from "@/lib/data-admin1";
import { R } from "@/lib/routes";

const STEP_PIN = ["farm", "tolon", "tamale", "buyers"];

export function CodesClient() {
  const toast = useToast();
  const [q, setQ] = useState("VF-TOM-00048");
  const [code, setCode] = useState("VF-TOM-00048");
  const [miss, setMiss] = useState(0);
  const [missed, setMissed] = useState<string | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const t = TRACE_CODES[code];
  const farm = FARMS.find((f) => f.slug === t.farm)!;
  const sold = t.buyers.length > 0;
  const collect = farm.slug === "kumbungu-pepper-farm" ? { lat: 9.5321 + 0.02, lng: -0.95, name: "Kumbungu point" } : PLACES.tolon;

  const lookup = (raw = q) => {
    const k = raw.trim().toUpperCase();
    if (TRACE_CODES[k]) { setCode(k); setQ(k); setMissed(null); setStep(null); toast(`${k} traced`, "info"); }
    else { setMissed(k || "that code"); setMiss((m) => m + 1); }
  };

  const map = useMemo(() => {
    const fc: [number, number] = [farm.lng, farm.lat], cc: [number, number] = [collect.lng, collect.lat], tc: [number, number] = [PLACES.tamale.lng, PLACES.tamale.lat];
    const routes: RouteLine[] = [{ id: "in", coords: [fc, cc, tc], color: "#BBEA70" }];
    const pins: Pin[] = [
      { id: "farm", kind: "farm", lat: farm.lat, lng: farm.lng, label: "Farm", sub: farm.name },
      { id: "tolon", kind: "handover", lat: collect.lat, lng: collect.lng, label: collect.name },
      { id: "tamale", kind: sold ? "handover" : "problem", icon: "warehouse", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, label: "Packhouse" },
    ];
    if (sold) {
      routes.push({ id: "kum", coords: [tc, [-1.25, 8.1], [PLACES.kumasi.lng, PLACES.kumasi.lat]] }, { id: "acc", coords: [tc, [-0.95, 7.6], [-0.6, 6.4], [PLACES.accra.lng, PLACES.accra.lat]] });
      pins.push({ id: "buyers", kind: "buyer", icon: "users", lat: PLACES.accra.lat, lng: PLACES.accra.lng, label: `${t.buyers.length + 2} buyers`, sub: "Accra and Kumasi" }, { id: "kumasi", kind: "buyer", lat: PLACES.kumasi.lat, lng: PLACES.kumasi.lng, label: "Kumasi Grand Hotel" });
    }
    return { routes, pins, plots: [{ id: "plot", coords: plotAround(farm.lat, farm.lng, 0.01, 0.0025) }] };
  }, [farm, collect.lat, collect.lng, collect.name, sold, t.buyers.length]);

  return (
    <PortalShell cfg={ADM} active="Trace codes" title="Trace codes" sub="Every crate, batch and order has a code"
      actions={<>
        <Button size="M" variant="light" icon="printer" onClick={() => toast(`Labels for ${code} sent to the packhouse printer`)}>Print labels</Button>
        <Button size="M" href={R.adminRecalls} icon="siren">Start a recall</Button>
      </>}>
      <motion.form key={miss} animate={miss ? { x: [0, -4, 4, -4, 4, 0] } : undefined} transition={{ duration: 0.36 }}
        onSubmit={(e) => { e.preventDefault(); lookup(); }} className="flex flex-col gap-2 rounded-[20px] bg-white p-2 sm:flex-row sm:items-center">
        <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl px-3 ring-1 ring-transparent transition focus-within:ring-deep">
          <Icon name="qr-code" size={20} className="shrink-0 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Trace code" placeholder="Type or scan a code, like VF-TOM-00048" className="w-full bg-transparent text-[16px] font-semibold uppercase tracking-[0.02em] outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-muted" />
        </label>
        <div className="flex gap-2 px-1 pb-1 sm:p-0">
          {["VF-TOM-00048", "VF-PEP-00052"].filter((x) => x !== code).map((x) => <button key={x} type="button" onClick={() => { setQ(x); lookup(x); }} className="hidden rounded-full bg-paper px-3 py-2 text-[13px] font-semibold text-deep hover:bg-mist md:block">{x}</button>)}
          <Button type="submit" size="M" className="flex-1 sm:flex-none">Trace</Button>
        </div>
      </motion.form>
      <AnimatePresence>
        {missed && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="-mt-2 flex items-center gap-2 overflow-hidden text-[14px] font-medium text-danger md:-mt-4">
            <Icon name="circle-alert" size={16} />We could not find {missed}. Check the letters and numbers on the label.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <A1Swap k={code}><h2 className="text-[18px] font-semibold">{code} · {t.product} · {t.kg} kg</h2></A1Swap>
            <Link href={R.trace(code)} className="text-[14px] font-semibold text-leaf hover:text-deep">Open public page</Link>
          </div>
          <LiveMap key={code} height="h-[260px] md:h-[300px]" rounded="rounded-2xl" styleName="satellite" controls={false}
            focus={{ lat: 7.7, lng: -1.0, zoom: 6.3 }} plots={map.plots} routes={map.routes} pins={map.pins}
            active={step !== null ? STEP_PIN[Math.min(step, sold ? 3 : 2)] : undefined} onPin={(id) => setStep(STEP_PIN.indexOf(id === "kumasi" ? "buyers" : id))} />
          <LayoutGroup id="a1-steps">
            <div className="flex flex-col">
              {t.steps.map((s, i) => {
                const on = step === i;
                return (
                  <motion.button key={code + s.title} type="button" onClick={() => setStep(on ? null : i)}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: EASE }}
                    className="relative flex items-center gap-3 rounded-2xl p-2.5 text-left">
                    {on && <motion.span layoutId="a1-step-on" className="absolute inset-0 rounded-2xl bg-mist" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                    <span className={cx("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full", s.icon === "siren" ? "bg-danger text-white" : "bg-deep text-lime")}><Icon name={s.icon} size={18} /></span>
                    <span className="relative min-w-0 flex-1"><span className="block text-[15px] font-semibold">{s.title}</span><span className="block truncate text-[13px] text-muted">{s.sub}</span></span>
                    <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-deep"><Icon name="scale" size={14} />{s.kg}</span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
        </Panel>

        <div className="flex flex-col gap-4 md:gap-6">
          <section className="flex flex-col items-center gap-3 rounded-[20px] bg-deep p-6 text-center text-white">
            <motion.span key={code} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white text-night">
              <Icon name="qr-code" size={84} strokeWidth={1.4} />
              <span className="absolute inset-x-3 top-0 h-[2px] animate-scan bg-lime" />
            </motion.span>
            <A1Swap k={code} className="flex flex-col gap-1">
              <span className="text-[20px] font-semibold tracking-[0.02em]">{code}</span>
              <span className="text-[14px] text-white/75">{t.scans ? <>Scanned <CountUp value={String(t.scans)} /> times</> : "Not scanned yet"}</span>
            </A1Swap>
          </section>

          <Panel title="Who received it" link={[sold ? "6 orders" : "Not sold", R.adminOrders]}>
            <A1Swap k={code} className="flex flex-col gap-3">
              {sold ? (
                <>
                  {t.buyers.map(([n, kg]) => <KV key={n} k={n} v={kg} />)}
                  <button onClick={() => toast("Message sent to all 6 buyers")} className="mt-2 text-[15px] font-semibold text-deep hover:text-leaf">Message all 6 buyers</button>
                </>
              ) : (
                <p className="text-[14px] text-muted">This lot is held at the Tamale packhouse and has not gone to any buyer. Nothing to recall.</p>
              )}
            </A1Swap>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
