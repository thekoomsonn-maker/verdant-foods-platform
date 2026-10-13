import Link from "next/link";
import { B2B, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { Button } from "@/components/ui";
import { Progress } from "@/components/charts";
import { cx } from "@/components/tokens";
import { AGREEMENTS } from "@/lib/data-b2b";
import { R } from "@/lib/routes";
import { NextDeliveries, SpendChart, TracePanel } from "./overview-client";

export default function B2bOverview() {
  return (
    <PortalShell cfg={B2B} active="Overview" title="Good morning, Osu Kitchen" sub="Tuesday 13 October · 5 deliveries this week"
      actions={<><Button href={R.b2bBids} variant="light" size="M">Make a bid</Button><Button href={R.b2bSource} size="M" arrow>Buy produce</Button></>}>
      <KpiRow>
        <Kpi l="Spend this month" v="GH₵ 48,620" d="8% below market price" icon="wallet" spark={[30, 34, 31, 38, 36, 42, 44, 48]} />
        <Kpi l="Open bids" v="2" d="1 reply due in 6 hours" icon="gavel" tone="warning" />
        <Kpi l="Deliveries this week" v="5" d="Next: today 6:00 am" icon="truck" tone="muted" />
        <Kpi l="Freshness on arrival" v="30 h" d="Avg. harvest to kitchen" icon="timer" tone="deep" bg="bg-lime-soft" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_400px]">
        <SpendChart />
        <NextDeliveries />
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_400px]">
        <Panel title="Supply agreements this month" link={["All agreements", R.b2bAgreements]}>
          <div className="flex flex-col gap-5">
            {AGREEMENTS.map((a) => (
              <div key={a.crop} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold">{a.crop === "Red onions" ? "Onions" : a.crop} · {a.kgWeek} kg / week</span>
                  <span className="tabular text-[13px] text-muted">{a.done.toLocaleString("en-GH")} of {a.total.toLocaleString("en-GH")} kg</span>
                </div>
                <Progress pct={(a.done / a.total) * 100} color={a.bar} />
                <Link href={R.farm(a.slug)} className="w-fit text-[13px] text-muted transition-colors hover:text-leaf">{a.farm}</Link>
              </div>
            ))}
          </div>
        </Panel>
        <section className={cx("flex flex-col gap-4 rounded-[20px] bg-deep p-6 text-white")}>
          <TracePanel />
        </section>
      </div>
    </PortalShell>
  );
}
