import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, ImageCard, NumCard, PageHero } from "@/components/site/sections";
import { Button, Container, Section } from "@/components/ui";
import { CountUp, Reveal, Stagger } from "@/components/motion";
import { Progress } from "@/components/charts";
import { T } from "@/components/tokens";
import { Title } from "@/components/corporate/blocks";
import { ImpactCharts, SplitIn } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Impact", description: "What changed for Verdant farmers this season: income, payment times, mapped plots and where each cedi goes." };

const PROMISES: [string, number][] = [["Every plot mapped", 92], ["Farmers paid within 48 hours", 97], ["Spray record on every harvest", 84], ["Women in our farmer groups", 58]];

export default function Impact() {
  return (
    <PublicPage>
      <PageHero img="/img/solar-pump.jpg" eyebrow="Impact · 2026 season" title="More money stays with the farmer." sub="What changed for our farmers this season." />

      <Section className="flex flex-col gap-10">
        <Title text="This season in numbers" />
        <Stagger className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <NumCard n="+38%" l="Average farmer income" bg="bg-lime-soft" />
          <NumCard n="48 h" l="Harvest to payment" bg="bg-sun-soft" />
          <NumCard n="1,240 t" l="Sold for farmers" bg="bg-mint" />
          <NumCard n="92%" l="Farms with a mapped plot" bg="bg-orange-soft" />
        </Stagger>
      </Section>

      <Section bg="bg-paper"><ImpactCharts /></Section>

      <Section className="flex flex-col gap-10">
        <Title text="Behind the numbers" sub="Three people, one season." />
        <Stagger className="grid gap-4 md:grid-cols-3">
          <ImageCard img="/img/farmer-amina.jpg" title="Amina doubled her tomato plot" sub="Nyankpala" href={R.story("amina-doubled-her-tomato-plot")} h="h-[420px] lg:h-[520px]" />
          <ImageCard img="/img/soil-testing.jpg" title="Every plot now on the map" sub="Tolon District" href={R.story("every-plot-is-now-on-the-map")} h="h-[420px] lg:h-[520px]" />
          <ImageCard img="/img/vsla-savings-box.jpg" title="Savings that pay for irrigation" sub="Kumbungu" href={R.story("savings-that-pay-for-irrigation")} h="h-[420px] lg:h-[520px]" />
        </Stagger>
      </Section>

      <section className="bg-deep py-[72px] text-white md:py-24 lg:py-[120px]">
        <Container className="grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-24">
          <div className="flex flex-col gap-4">
            <Reveal><span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime"><span className="h-1.5 w-1.5 rounded-full bg-lime" />Our promises</span></Reveal>
            <SplitIn text="How we are doing" className={T.h2} />
            <Reveal delay={0.1}><p className="text-[18px] text-white/75">Checked every quarter by an outside auditor.</p></Reveal>
          </div>
          <Stagger className="flex flex-col gap-7">
            {PROMISES.map(([l, p]) => (
              <div key={l} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4"><span className="text-[17px] font-semibold">{l}</span><CountUp value={`${p}%`} className="text-[17px] font-semibold text-lime" /></div>
                <Progress pct={p} color="bg-lime" track="bg-white/15" h="h-2.5" />
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <CtaBleed img="/img/vea-irrigation.jpg" title="Grow with us"
        actions={<><Button href={R.farmers} variant="lime" arrow>Sell your harvest</Button><Button href={R.business} variant="glass">Buy for your business</Button></>} />
    </PublicPage>
  );
}
