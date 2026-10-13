"use client";
import { motion } from "motion/react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { EASE } from "@/components/motion";
import { cx } from "@/components/tokens";
import { farmBySlug, PLACES, plotAround } from "@/lib/data";
import { ORDER } from "@/lib/data-market";

export function NextSteps() {
  return (
    <div className="glass-dark flex flex-col gap-4 rounded-3xl p-5 text-white">
      <span className="text-[15px] font-semibold">What happens next</span>
      <ol className="relative flex flex-col gap-4">
        <span className="absolute bottom-4 left-[15px] top-4 w-px bg-white/15" />
        {ORDER.next.map(([i, t, d], n) => (
          <motion.li key={t} className="relative flex items-center gap-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + n * 0.12, duration: 0.45, ease: EASE }}>
            <span className={cx("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full", n === 0 ? "bg-lime text-night" : "bg-forest text-lime")}><Icon name={i} size={16} /></span>
            <span><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[12px] text-white/65">{d}</span></span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function OrderRoute() {
  const farms = ORDER.farms.map((o) => farmBySlug(o.farm));
  const home = { lat: 5.5571, lng: -0.1818 };
  return (
    <LiveMap height="h-[340px] md:h-[440px]" live="Your order’s route" focus={{ lat: 7.9, lng: -1.3, zoom: 6.1 }}
      plots={farms.map((f) => ({ id: f.slug, coords: plotAround(f.lat, f.lng, 0.03, 0.006) }))}
      routes={[
        ...farms.map((f) => ({ id: f.slug, coords: [[f.lng, f.lat], [PLACES.tamale.lng, PLACES.tamale.lat]] as [number, number][] })),
        { id: "out", coords: [[PLACES.tamale.lng, PLACES.tamale.lat], [PLACES.kumasi.lng, PLACES.kumasi.lat], [home.lng, home.lat]], color: "#FF7006" },
      ]}
      pins={[
        ...farms.map((f) => ({ id: f.slug, lat: f.lat, lng: f.lng, kind: "farm" as const, label: f.name.split(" ")[0] })),
        { id: "pack", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, kind: "handover" as const, icon: "warehouse", label: "Tamale packhouse" },
        { id: "home", lat: home.lat, lng: home.lng, kind: "home" as const, label: "You, Accra" },
      ]}
      legend={[["#BBEA70", "Farm"], ["#FFFFFF", "Packhouse"], ["#FF7006", "Delivery"]]} />
  );
}
