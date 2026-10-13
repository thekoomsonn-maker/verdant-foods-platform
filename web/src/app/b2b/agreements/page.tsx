import Link from "next/link";
import { B2B, Kpi, KpiRow, PortalShell } from "@/components/portal/shell";
import { Button } from "@/components/ui";
import { Progress } from "@/components/charts";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion";
import { StatusFor, Thumb } from "@/components/b2b/kit";
import { AGREEMENTS, CROP_IMG } from "@/lib/data-b2b";
import { R } from "@/lib/routes";
import { WeekStrip } from "./agreements-client";

export default function AgreementsPage() {
  return (
    <PortalShell cfg={B2B} active="Supply agreements" title="Supply agreements" sub="Fixed weekly volumes at agreed prices" actions={<Button href={R.b2bQuote} size="M" arrow>New agreement</Button>}>
      <KpiRow>
        <Kpi l="Active agreements" v="3" icon="handshake" />
        <Kpi l="Delivered on time" v="97%" d="Last 12 weeks" icon="calendar-check" />
        <Kpi l="Price locked until" v="Dec 31" icon="lock" />
        <Kpi l="Saved vs market" v="GH₵ 12,800" d="This quarter" icon="trending-up" tone="deep" bg="bg-lime-soft" />
      </KpiRow>

      {AGREEMENTS.map((a, i) => (
        <Reveal key={a.crop} delay={i * 0.06}>
          <article className="flex flex-col gap-4 rounded-[20px] bg-white p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <Thumb img={CROP_IMG[a.crop]} size={56} />
                <div className="min-w-0">
                  <div className="text-[17px] font-semibold">{a.crop} · {a.kgWeek} kg every week</div>
                  <div className="truncate text-[14px] text-muted"><Link href={R.farm(a.slug)} className="hover:text-leaf">{a.farm}</Link> · GH₵ {a.price}/kg</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[13px] font-medium"><Icon name="timer" size={15} />Next: {a.next}</span>
                <StatusFor s="Active" />
              </div>
            </div>
            <Progress pct={(a.done / a.total) * 100} color={a.bar} h="h-2.5" />
            <div className="flex items-center justify-between text-[14px] text-muted">
              <span className="tabular">{a.done.toLocaleString("en-GH")} of {a.total.toLocaleString("en-GH")} kg this month</span>
              <Link href={R.b2bOrders} className="inline-flex items-center gap-1 font-semibold text-deep">Deliveries <Icon name="arrow-up-right" size={16} /></Link>
            </div>
          </article>
        </Reveal>
      ))}

      <WeekStrip />
    </PortalShell>
  );
}
