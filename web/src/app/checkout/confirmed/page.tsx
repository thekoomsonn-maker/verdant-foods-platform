import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { PageHero, Section } from "@/components/site/sections";
import { Reveal, Stagger } from "@/components/motion";
import { Button, Head } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx } from "@/components/tokens";
import { farmBySlug } from "@/lib/data";
import { ORDER } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { DrawCheck } from "@/components/market/bits";
import { NextSteps, OrderRoute } from "./confirmed-client";

export const metadata: Metadata = { title: "Order confirmed", description: "Your order is confirmed. See what happens next and meet the farms behind it." };

export default function ConfirmedPage() {
  return (
    <PublicPage>
      <PageHero
        img="/img/family-cooking.jpg" height="mid"
        eyebrow={<DrawCheck size={56} />}
        title={`Thank you, ${ORDER.buyer.split(" ")[0]}. Your order is confirmed.`}
        sub={`Order #${ORDER.id} · paid with MTN MoMo · arriving Thursday, 9 am to 1 pm`}
        actions={<><Button href={R.tracking()} variant="lime" arrow>Track my order</Button><Button href={R.shop} variant="glass">Keep shopping</Button></>}
        side={<NextSteps />}
      />

      <Section className="flex flex-col gap-10">
        <Head title="Meet the farms behind your order" sub="Each item has its own trace code. Scan it when your bag arrives." />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {ORDER.farms.map((o) => {
            const f = farmBySlug(o.farm);
            return (
              <div key={o.code} className={cx("group/of flex h-full flex-col overflow-hidden rounded-3xl", o.tint)}>
                <Link href={R.farm(f.slug)} className="block h-[200px] overflow-hidden md:h-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.photo} alt="" className="h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/of:scale-105" />
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <Link href={R.farm(f.slug)} className="text-[18px] font-semibold hover:text-deep">{f.name}</Link>
                  <span className="text-[14px] text-muted">{o.items}</span>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="qr-code" size={14} />{o.code}</span>
                    <Link href={R.trace(o.code)} className="inline-flex items-center gap-1 text-[14px] font-semibold text-deep">Trace <Icon name="arrow-up-right" size={16} /></Link>
                  </div>
                </div>
              </div>
            );
          })}
        </Stagger>
        <Reveal><OrderRoute /></Reveal>
      </Section>
    </PublicPage>
  );
}
