"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { CountUp, EASE, Stagger } from "@/components/motion";
import { Button } from "@/components/ui";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { plotAround, TINT, type Farm } from "@/lib/data";
import { findProduct, type FarmPlot } from "@/lib/data-market";
import { R } from "@/lib/routes";

export function FarmHeroStats({ stats }: { stats: [string, string][] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2" gap={0.07}>
      {stats.map(([n, l]) => (
        <div key={l} className="glass rounded-2xl px-4 py-3.5 text-white">
          <CountUp value={n} className="text-[24px] font-medium leading-none tracking-[-0.02em]" />
          <div className="mt-1.5 text-[13px] text-white/75">{l}</div>
        </div>
      ))}
    </Stagger>
  );
}

export function FarmFollow({ name }: { name: string }) {
  const [on, setOn] = useState(false);
  const toast = useToast();
  return <Button variant="glass" icon={on ? "check" : undefined} onClick={() => { setOn(!on); toast(on ? `You stopped following ${name}` : `You follow ${name}. We will tell you when they harvest.`); }}>{on ? "Following" : "Follow farm"}</Button>;
}

export function FarmPlots({ farm, plots }: { farm: Farm; plots: FarmPlot[] }) {
  const [active, setActive] = useState<string | undefined>(undefined);
  const geo = plots.map((p) => ({ ...p, lat: farm.lat + p.dLat, lng: farm.lng + p.dLng }));
  const sel = geo.find((p) => p.id === active);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <div className="relative">
        <LiveMap height="h-[380px] md:h-[480px] lg:h-[520px]" live="Plots mapped by GPS" focus={{ lat: farm.lat, lng: farm.lng, zoom: 13 }}
          plots={geo.map((p) => ({ id: p.id, name: p.name, color: p.color, coords: plotAround(p.lat, p.lng, 0.0045, 0.0012) }))}
          pins={geo.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, kind: "farm", icon: "sprout", label: p.name, sub: p.crop }))}
          legend={geo.map((p) => [p.color, p.crop] as [string, string])}
          active={active} onPin={setActive} />
      </div>
      <div className="flex flex-col gap-3">
        {geo.map((p, i) => {
          const prod = findProduct(p.product);
          const on = p.id === active;
          return (
            <motion.button key={p.id} onClick={() => setActive(on ? undefined : p.id)} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45, ease: EASE }}
              className={cx("relative flex items-center gap-3.5 rounded-2xl p-3.5 text-left transition-colors", on ? "bg-mist" : "bg-paper hover:bg-mist")}>
              {on && <motion.span layoutId="plot-on" className="absolute inset-0 rounded-2xl ring-2 ring-deep" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {prod && <img src={`/products/${prod.img}.jpg`} alt="" className="h-12 w-12 rounded-xl object-cover mix-blend-multiply" style={{ background: TINT[prod.img] }} />}
              <span className="flex-1"><span className="block text-[15px] font-semibold">{p.name} · {p.crop}</span><span className="block text-[13px] text-muted">{p.ha} ha · {p.when}</span></span>
              <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium", p.status === "Ready" ? "bg-success-bg text-success" : "bg-info-bg text-info")}><span className="h-1.5 w-1.5 rounded-full bg-current" />{p.status}</span>
            </motion.button>
          );
        })}
        <AnimatePresence mode="wait">
          <motion.div key={sel?.id ?? "check"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex flex-col gap-3 rounded-2xl bg-deep p-5 text-white">
            {sel ? (
              <>
                <span className="text-[13px] font-semibold text-lime">{sel.name}</span>
                <span className="text-[17px] font-semibold">{sel.crop} on {sel.ha} hectares</span>
                <span className="text-[14px] text-white/75">{sel.status === "Ready" ? "Ready to harvest. Orders placed today ship from this plot." : `Growing. First harvest in about ${sel.when}.`}</span>
                {findProduct(sel.product) && <Link href={R.product(sel.product)} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-[14px] font-semibold text-night">See {sel.crop.toLowerCase()} <Icon name="arrow-right" size={16} /></Link>}
              </>
            ) : (
              <>
                <span className="text-[13px] font-semibold text-lime">Last farm check</span>
                <span className="text-[17px] font-semibold">6 October · Officer Yaw Darko</span>
                <div className="flex flex-wrap gap-2">
                  {["Plants healthy", "Water enough", "Spray records complete"].map((c) => <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="circle-check" size={14} className="text-leaf" />{c}</span>)}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
