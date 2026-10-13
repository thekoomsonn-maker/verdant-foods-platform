"use client";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/site/account";
import { Thumb } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { EASE } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Avatar, Crumbs } from "@/components/ui";
import { JOURNEY, plotAround } from "@/lib/data";
import { DELIVERY, orderById, orderProducts } from "@/lib/data-account";
import { getTrace } from "@/lib/data-trace";
import { R } from "@/lib/routes";

const J = JOURNEY.steps;

export function Tracking({ id }: { id: string }) {
  const o = orderById(id)!;
  const live = o.status === "On the way";
  const toast = useToast();
  const reduce = useReducedMotion();
  const d = DELIVERY.driver;
  const ps = orderProducts(o);

  // Freshness clock ticks once a minute.
  const [mins, setMins] = useState(28 * 60 + 40);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setMins((m) => m + 1), 60000);
    return () => clearInterval(t);
  }, [live]);
  const fresh = live ? mins : (o.hoursFromHarvest ?? 29) * 60;

  const steps = [
    { icon: "sprout", title: "Harvested · Nyankpala", sub: `${JOURNEY.farmer} · ${o.picked ?? J[0].time}`, kg: J[0].kg, done: true },
    { icon: "scale", title: "Collected at Tolon point", sub: `Officer Yaw · ${J[1].time.replace(" · ", " ")}`, kg: J[1].kg, done: true },
    { icon: "warehouse", title: "Packed at Tamale packhouse", sub: `Batch ${o.batch ?? JOURNEY.batch} · ${J[2].time.replace(" · ", " ")}`, kg: J[2].kg, done: true },
    { icon: "truck", title: live ? "On the way to you" : "On the road", sub: live ? `Driver ${d.name.split(" ")[0]} · now` : `${d.van} · 4 °C`, kg: "Your 2 kg", done: true },
    { icon: o.status === "Refunded" ? "wallet" : "house", title: o.status === "Refunded" ? "Refunded to MoMo" : "Delivered", sub: live ? `Expected ${o.eta}` : o.status === "Refunded" ? `${o.when} · out of stock at packing` : o.when, kg: "", done: !live },
  ];
  const current = live ? 3 : 4;

  const road: [number, number][] = [[J[2].lng, J[2].lat], [J[3].lng, J[3].lat], [DELIVERY.door.lng, DELIVERY.door.lat]];

  return (
    <>
      <Crumbs items={[["Orders", R.orders], [o.id]]} />
      <section className="overflow-hidden rounded-[20px]">
        <LiveMap
          height="h-[300px] md:h-[400px] lg:h-[420px]"
          rounded="rounded-[20px]"
          focus={{ lat: 7.45, lng: -0.62, zoom: 5.95 }}
          plots={[{ id: "a", coords: plotAround(J[0].lat, J[0].lng, 0.03, 0.006) }]}
          routes={[{ id: "r", coords: [...J.slice(0, 3).map((x) => [x.lng, x.lat] as [number, number]), ...road.slice(1)] }]}
          pins={[
            { id: "farm", lat: J[0].lat, lng: J[0].lng, kind: "farm", label: "Nyankpala" },
            { id: "pack", lat: J[2].lat, lng: J[2].lng, kind: "handover", icon: "warehouse", label: "Tamale packhouse" },
            { id: "home", lat: DELIVERY.door.lat, lng: DELIVERY.door.lng, kind: "home", label: live ? "Your door" : "Delivered" },
          ]}
          vans={live ? [{ id: "v", label: `${d.name.split(" ")[0]} · ${d.away}`, route: road, offset: 0.55, speed: 0.0035 }] : []}
          live={live ? "Live · updated 2 min ago" : `${o.status} ${o.when}`}
          legend={[["#BBEA70", "Farms"], ["#FF7006", live ? "Your driver" : "Your door"]]}
        />
      </section>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[18px] font-semibold md:text-[20px]">Every handover</h2>
            <span className="text-[14px] font-semibold text-leaf">Weights checked at each step</span>
          </div>
          <ol className="relative">
            <span aria-hidden className="absolute bottom-8 left-[19px] top-5 w-[2px] rounded-full bg-mint" />
            <motion.span aria-hidden className="absolute bottom-8 left-[19px] top-5 w-[2px] origin-top rounded-full bg-leaf"
              initial={{ scaleY: reduce ? current / 4 : 0 }} animate={{ scaleY: current / 4 }} transition={{ duration: 1.2, ease: EASE, delay: 0.3 }} />
            {steps.map((s, i) => {
              const now = i === current && live;
              return (
                <motion.li key={s.title} initial={{ opacity: 0, x: reduce ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.1 }} className="relative flex gap-3.5 pb-5 last:pb-0">
                  <span className={cx("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", now ? "bg-lime text-night" : s.done ? "bg-deep text-lime" : "bg-mist text-muted")}>
                    {now && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-lime" />}
                    <Icon name={s.icon} size={18} className="relative" />
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    <span className={cx("block text-[15px] font-semibold md:text-[16px]", !s.done && "text-muted")}>{s.title}</span>
                    <span className="block text-[13px] text-muted">{s.sub}</span>
                  </span>
                  {s.kg && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="mt-1 inline-flex h-fit shrink-0 items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[13px] font-semibold tabular text-deep">
                      <Icon name="scale" size={13} />{s.kg}
                    </motion.span>
                  )}
                </motion.li>
              );
            })}
          </ol>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.4, ease: EASE }} className="flex items-center gap-2.5 rounded-xl bg-success-bg px-4 py-3 text-[14px] font-medium text-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" /><motion.path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.45 }} /></svg>
            Weights match at every step. Nothing was added or swapped.
          </motion.div>
        </Card>

        <div className="flex flex-col gap-4">
          <FreshCard minutes={fresh} live={live} />
          {live && (
            <Card className="flex-row items-center gap-3">
              <Avatar initials={d.initials} size={44} className="bg-orange text-white" />
              <div className="min-w-0 flex-1"><div className="font-semibold">{d.name}</div><div className="text-[13px] text-muted">{d.van}</div></div>
              <a href={`tel:${d.phone.replace(/\s/g, "")}`} aria-label={`Call ${d.name}`} onClick={() => toast(`Calling ${d.name.split(" ")[0]}`, "info")} className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-deep transition-colors hover:bg-mint"><Icon name="phone" size={18} /></a>
            </Card>
          )}
          <Card>
            <h2 className="text-[17px] font-semibold">Items and codes</h2>
            <div className="flex flex-col gap-3">
              {ps.map((p) => (
                <div key={p.slug} className="flex items-center gap-3">
                  <Thumb p={p} size={36} />
                  <Link href={R.product(p.slug)} className="min-w-0 flex-1 truncate text-[14px] font-semibold hover:text-deep">{p.name}{p.qty > 1 && <span className="font-normal text-muted"> × {p.qty}</span>}</Link>
                  {p.trace && (getTrace(p.trace)
                    ? <Link href={R.trace(p.trace)} className="shrink-0 text-[13px] font-semibold tracking-[0.01em] text-leaf hover:text-deep">{p.trace}</Link>
                    : <span className="shrink-0 text-[13px] tracking-[0.01em] text-muted" title="Journey page coming soon for this batch">{p.trace}</span>)}
                </div>
              ))}
            </div>
          </Card>
          <Link href={`${R.report}${live ? "" : `?order=${o.id}`}`} className="flex h-11 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-deep transition-colors hover:bg-mist">Report a problem</Link>
        </div>
      </div>
    </>
  );
}

function FreshCard({ minutes, live }: { minutes: number; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const pct = Math.min(1, minutes / (48 * 60));
  return (
    <section ref={ref} className="flex flex-col gap-2 rounded-[20px] bg-lime p-5 text-night md:p-6">
      <span className="text-[14px] font-semibold">Freshness clock</span>
      <motion.span key={minutes} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-[34px] font-medium leading-none tracking-[-0.02em] tabular md:text-[40px]">{h} h {m} m</motion.span>
      <span className="text-[14px] text-night/80">{live ? "since your tomatoes were picked" : "from harvest to your door"}</span>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
        <motion.div className="h-full origin-left rounded-full bg-deep" initial={{ scaleX: 0 }} animate={{ scaleX: inView ? pct : 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }} />
      </div>
      <span className="text-[12px] text-night/70">Our promise: at your door within 48 hours</span>
    </section>
  );
}
