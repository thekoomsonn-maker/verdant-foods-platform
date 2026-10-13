import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { PromiseBand, Section, TopBand } from "@/components/site/sections";
import { Head } from "@/components/ui";
import { cx } from "@/components/tokens";
import { SLOTS, ZONES } from "@/lib/data-market";
import { AreaCheck, DeliveryZones } from "./delivery-client";

export const metadata: Metadata = { title: "Delivery areas", description: "We deliver to Accra, Kumasi and Tamale. Next-day, in a two-hour slot." };

const TONE = { Open: "bg-success-bg text-success", "Few left": "bg-warning-bg text-warning", Full: "bg-danger-bg text-danger" } as const;

export default function DeliveryPage() {
  return (
    <PublicPage nav="light">
      <TopBand eyebrow="Delivery" title="Where we deliver" sub="Accra, Kumasi and Tamale. Next-day, in a two-hour slot." />
      <DeliveryZones top={<AreaCheck />} />
      <Section bg="bg-paper" className="flex flex-col gap-10">
        <Head title="Delivery slots" sub="Order by 8 pm for next-day delivery." />
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-3 text-[13px] text-muted md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
            <span>Slot</span>{ZONES.map((z) => <span key={z.id}>{z.name}</span>)}
          </div>
          {SLOTS.map(([slot, states]) => (
            <div key={slot} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-2 border-b border-line px-4 py-3.5 text-[14px] last:border-0 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
              <span className="font-medium">{slot}</span>
              {states.map((s, i) => <span key={i}><span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium md:px-2.5 md:text-[13px]", TONE[s])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span></span>)}
            </div>
          ))}
        </div>
      </Section>
      <PromiseBand />
    </PublicPage>
  );
}
