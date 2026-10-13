"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { Button, KV } from "@/components/ui";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { StatusFor, Thumb, UTabs } from "@/components/b2b/kit";
import { farmBySlug, PLACES } from "@/lib/data";
import { farmRoad, KITCHEN, ORDERS } from "@/lib/data-b2b";
import { R } from "@/lib/routes";

const TABS: [string, string][] = [["all", "All"], ["way", "On the way"], ["done", "Delivered"], ["problems", "Problems"]];
const moving = ORDERS.filter((x) => x.status === "On the way");
const VANS = moving.map((x, i) => ({ id: x.id, label: x.van, route: farmRoad(x.farm), speed: 0.012, offset: 0.55 + i * 0.18 }));
const ROUTES = moving.map((x) => ({ id: x.id, coords: farmRoad(x.farm), color: "#024639" }));
const farms = Array.from(new Set(ORDERS.map((x) => x.farm)));
const PINS = [...farms.map((f) => ({ id: f, lat: farmBySlug(f).lat, lng: farmBySlug(f).lng, kind: "farm" as const })), { id: "tamale", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, kind: "handover" as const, icon: "warehouse" }, { id: "kitchen", lat: KITCHEN.lat, lng: KITCHEN.lng, kind: "buyer" as const, label: KITCHEN.name }];
const fits = (k: string, s: string) => k === "all" || (k === "way" && (s === "On the way" || s === "Packed")) || (k === "done" && s === "Delivered") || (k === "problems" && s === "Claim open");

export function OrdersClient() {
  const [tab, setTab] = useState("way");
  const [sel, setSel] = useState("B-884");
  const rows = ORDERS.filter((o) => fits(tab, o.status));
  const o = ORDERS.find((x) => x.id === sel) ?? rows[0] ?? ORDERS[0];

  return (
    <>
      <UTabs items={TABS} value={tab} onChange={(k) => { setTab(k); const first = ORDERS.find((x) => fits(k, x.status)); if (first && !fits(k, o.status)) setSel(first.id); }} />
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_420px]">
        <section className="flex flex-col gap-1 self-start rounded-[20px] bg-white p-3 md:p-4">
          <div className="hidden grid-cols-[96px_1fr_88px_132px] rounded-xl bg-paper px-4 py-2.5 text-[13px] font-medium text-muted md:grid"><span>Order</span><span>Produce</span><span>Due</span><span>Status</span></div>
          <LayoutGroup id="ord">
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((r, i) => {
                const on = r.id === o.id;
                return (
                  <motion.button layout key={r.id} onClick={() => setSel(r.id)} aria-pressed={on}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                    className="relative grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3.5 text-left text-[15px] md:grid-cols-[96px_1fr_88px_132px] md:py-4">
                    {on && <motion.span layoutId="ord-hi" className="absolute inset-0 rounded-xl bg-mist" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                    <span className="relative font-semibold">#{r.id}</span>
                    <span className="relative order-3 col-span-2 flex items-center gap-2.5 text-muted md:order-none md:col-span-1 md:text-ink"><Thumb img={r.img} size={28} className="rounded-lg md:hidden" />{r.produce}</span>
                    <span className="relative hidden md:block">{r.due}</span>
                    <span className="relative justify-self-end md:justify-self-start"><StatusFor s={r.status} /></span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </LayoutGroup>
          {rows.length === 0 && <p className="p-8 text-center text-muted">Nothing here.</p>}
        </section>

        <aside className="flex flex-col gap-4 self-start rounded-[20px] bg-white p-4 md:p-5 xl:sticky xl:top-[96px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={o.id + "h"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold md:text-[20px]">#{o.id} · {o.arriving}</h2>
              <Link href={R.b2bReports} className="shrink-0 text-[14px] font-semibold text-leaf hover:text-deep">Trace report</Link>
            </motion.div>
          </AnimatePresence>
          <LiveMap height="h-[260px]" rounded="rounded-2xl" styleName="light" controls={false} focus={{ lat: 7.55, lng: -0.95, zoom: 5.7 }}
            active={o.farm} live={`${moving.length} vans on the road`}
            routes={ROUTES} vans={VANS} pins={PINS}
            legend={[["#BBEA70", "Farm"], ["#FF7006", "Van and kitchen"]]} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-col gap-3">
              <KV k="Driver" v={`${o.driver} · ${o.van}`} />
              <KV k="Cold van" v={o.temp} />
              <KV k="Weights matched" v={o.weights} />
              <KV k="Freshness on arrival" v={o.fresh} />
              <KV k="From" v={<Link href={R.farm(o.farm)} className="hover:text-leaf">{farmBySlug(o.farm).name}</Link>} />
              {o.status === "On the way" && (
                <div className="flex items-center gap-2 rounded-xl bg-info-bg px-3.5 py-2.5 text-[14px] text-info">
                  <Icon name="navigation" size={16} />Left the Tamale packhouse at 10 pm, now heading south to your kitchen
                </div>
              )}
              <div className={cx("mt-1 flex flex-wrap items-center gap-2")}>
                <Button href={R.b2bReports} size="M" arrow>Download trace report</Button>
                <Button href={R.b2bClaims} size="M" variant="ghost">{o.status === "Claim open" ? "See the claim" : "Report a problem"}</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </>
  );
}
