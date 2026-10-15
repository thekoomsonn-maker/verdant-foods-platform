"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { AreaChart, Donut, Legend } from "@/components/charts";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { CountUp, EASE } from "@/components/motion";
import { ADM, DataTable, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Button, Status } from "@/components/ui";
import { FARMS, PLACES, plotAround } from "@/lib/data";
import { ADMIN_ORDERS, ORDER_TONE, PROBLEMS_TO_FIX, SALES_14, SALES_14_LAST } from "@/lib/data-admin";
import { R } from "@/lib/routes";

const f = (s: string) => FARMS.find((x) => x.slug === s)!;
const nyank = f("nyankpala-women-farmers"), kumb = f("kumbungu-pepper-farm"), savel = f("savelugu-onion-growers"), tolonG = f("tolon-growers-group");

export const DASH_MAP = {
  plots: [nyank, kumb, savel, tolonG].map((x) => ({ id: x.slug, coords: plotAround(x.lat, x.lng, 0.012, 0.003), color: x.slug === kumb.slug ? "#E5412B" : "#BBEA70" })),
  routes: [
    { id: "r1", coords: [[nyank.lng, nyank.lat], [PLACES.tolon.lng, PLACES.tolon.lat], [PLACES.tamale.lng, PLACES.tamale.lat]] as [number, number][] },
    { id: "r2", coords: [[savel.lng, savel.lat], [-0.85, 9.52], [PLACES.tamale.lng, PLACES.tamale.lat]] as [number, number][] },
    { id: "r3", coords: [[kumb.lng, kumb.lat], [-0.92, 9.47], [PLACES.tamale.lng, PLACES.tamale.lat]] as [number, number][] },
  ],
};

const DASH_VANS = [{ id: "v1", route: DASH_MAP.routes[0].coords, speed: 0.03 }, { id: "v2", route: DASH_MAP.routes[1].coords, speed: 0.025, offset: 0.4 }, { id: "v3", route: DASH_MAP.routes[2].coords, speed: 0.035, offset: 0.7 }];
const DASH_PINS = [
  { id: "tamale", kind: "handover" as const, icon: "warehouse", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, label: "Tamale packhouse" },
  { id: "tolon", kind: "handover" as const, lat: PLACES.tolon.lat, lng: PLACES.tolon.lng, label: "Tolon point" },
  { id: "kumb", kind: "problem" as const, lat: kumb.lat, lng: kumb.lng, label: "Spray gap" },
];
const HREF = { weights: R.adminWeights, products: R.adminProducts, farmers: R.adminFarmers, checks: R.adminChecks, problems: R.adminProblems };
const ROW = { danger: "bg-tomato-soft", warning: "bg-sun-soft", info: "bg-mist" };
const ICO = { danger: "text-danger", warning: "text-warning", info: "text-deep" };

export function AdminDashboard() {
  const toast = useToast();
  const [done, setDone] = useState<Record<number, boolean>>({});
  return (
    <PortalShell cfg={ADM} active="Dashboard" title="Good morning, Akosua" sub="Tuesday 13 October · here is what needs you today"
      actions={<Button variant="light" size="M" icon="download" onClick={() => toast("Today's summary exported as CSV")}>Export</Button>}>
      <KpiRow>
        <Kpi l="Sales today" v="GH₵ 18,420" d="12% up on last Tuesday" icon="chart-line" spark={[4, 5, 4.4, 6, 5.6, 7, 7.6, 8.4]} />
        <Kpi l="Orders today" v="146" d="12 waiting to pack" icon="package" tone="warning" />
        <Kpi l="Harvest logged" v="2,480 kg" d="From 38 farms" icon="sprout" tone="muted" />
        <Kpi l="Avg. freshness" v="31 h" d="Harvest to door" icon="timer" tone="deep" bg="bg-lime-soft" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold">Sales, last 14 days</h2>
            <p className="text-[14px] text-muted">GH₵ 214,600 · shoppers 58% · businesses 42%</p>
          </div>
          <AreaChart values={SALES_14} compare={SALES_14_LAST} labels={["30 Sep", "3 Oct", "6 Oct", "9 Oct", "13 Oct"]} tip={["GH₵ 18,420", "Today"]} fmt={(v) => `GH₵ ${Math.round(v * 1000).toLocaleString("en-GH")}`} height={200} />
          <Legend items={[["#024639", "This period"], ["#C9D3CE", "Last period"]]} />
        </Panel>

        <Panel dark title="Live supply map" link={["Open", R.adminMap]} className="!gap-3 !p-4">
          <LiveMap
            height="h-[240px] md:h-[260px]" rounded="rounded-2xl" controls={false}
            focus={{ lat: 9.5, lng: -0.93, zoom: 9.1 }} live="7 trucks out"
            plots={DASH_MAP.plots} routes={DASH_MAP.routes}
            pins={DASH_PINS}
            vans={DASH_VANS}
          />
          <div className="grid grid-cols-3 gap-2">
            {[["38", "farms harvesting", R.adminFarmers], ["7", "trucks out", R.adminDeliveries], ["2", "alerts", R.adminProblems]].map(([n, l, h]) => (
              <Link key={l} href={h} className="rounded-xl bg-forest px-3 py-2.5 transition-colors hover:bg-white/15">
                <CountUp value={n} className="block text-[18px] font-semibold" /><span className="text-[12px] text-white/75">{l}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <Panel title="Problems to fix" link={["9 open · see all", R.adminProblems]}>
          <div className="flex flex-col gap-3">
            {PROBLEMS_TO_FIX.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                className={cx("flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center", ROW[p.tone], done[i] && "opacity-70")}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className={cx("relative flex h-8 w-8 shrink-0 items-center justify-center", ICO[p.tone])}>
                    {p.tone === "danger" && !done[i] && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-tomato/40" />}
                    <Icon name={done[i] ? "circle-check" : p.icon} size={18} className="relative" />
                  </span>
                  <div className="min-w-0"><div className="text-[15px] font-semibold">{p.title}</div><div className="text-[13px] text-muted">{p.sub}</div></div>
                </div>
                {p.toast ? (
                  <button disabled={done[i]} onClick={() => { setDone((d) => ({ ...d, [i]: true })); toast(p.toast!); }}
                    className="h-10 shrink-0 self-start rounded-full bg-white px-4 text-[14px] font-semibold text-deep transition-[transform,background-color] hover:bg-mist active:scale-[0.97] disabled:text-success sm:self-auto">
                    {done[i] ? "Done" : p.action}
                  </button>
                ) : (
                  <Link href={HREF[p.href]} className="inline-flex h-10 shrink-0 items-center self-start rounded-full bg-white px-4 text-[14px] font-semibold text-deep transition-colors hover:bg-mist sm:self-auto">{p.action}</Link>
                )}
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Who is buying" link={["This month", R.adminReports]}>
          <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            <Donut parts={[[58, "#024639"], [30, "#BBEA70"], [12, "#FF7006"]]} size={150} label="GH₵ 1.2m" sub="sales" />
            <div className="w-full flex-1"><Legend vertical items={[["#024639", "Shoppers", "58%"], ["#BBEA70", "Restaurants and hotels", "30%"], ["#FF7006", "Shops", "12%"]]} /></div>
          </div>
        </Panel>
      </div>

      <Panel title="Latest orders" link={["All orders", R.adminOrders]}>
        <DataTable cols={[["Order", "14%"], ["Customer"], ["Type", "14%"], ["Total", "14%"], ["Status", "16%"]]}
          rows={ADMIN_ORDERS.slice(0, 4).map((o) => [<Link key="id" href={R.adminOrders} className="hover:text-leaf">#{o.id}</Link>, o.customer, o.type, `GH₵ ${o.total.toLocaleString("en-GH")}`, <Status key="s" tone={ORDER_TONE[o.status]}>{o.status}</Status>])} />
      </Panel>
    </PortalShell>
  );
}
