import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { PageHero, StatsBleed, Tiles } from "@/components/site/sections";
import { Button, Container, Section } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { PhotoSplit, Title } from "@/components/corporate/blocks";
import { TraceCard, TraceForm } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Trace your food", description: "Type the code on your bag or scan the QR code to see the farm, harvest date, spray record and every handover." };

export default function TraceYourFood() {
  return (
    <PublicPage>
      <PageHero img="/img/hero-aerial.jpg" eyebrow="Every order carries a code" title="Where did your food come from?"
        sub="Type the code on your bag or scan the QR code with your phone camera." side={<div className="hidden lg:block"><TraceCard /></div>}>
        <TraceForm />
      </PageHero>
      <section className="bg-night lg:hidden">
        <Container className="py-8 text-white"><TraceCard /></Container>
      </section>

      <Section className="flex flex-col gap-10">
        <Title text="What your code shows you" sub="Every Verdant order has its own page with the full story of your food." />
        <Tiles items={[
          ["map-pin", "The farm and farmer", "Who grew it and the plot on a map.", R.traceFarm()],
          ["calendar", "Harvest date", "The day it was picked and how fresh it is.", R.trace()],
          ["spray-can", "Spray record", "Every spray and fertiliser, with safe gaps.", R.traceSpray()],
          ["route", "Every handover", "Who handled it, when, and the weight at each step.", R.trace()],
        ]} />
      </Section>

      <StatsBleed img="/img/packhouse.jpg" title="Tracing at Verdant so far" stats={[["48,210", "orders traced"], ["100%", "farms mapped"], ["31 h", "harvest to door"], ["99.4%", "weights matched at handover"]]} />

      <PhotoSplit img="/img/officer-tablet.jpg" eyebrow="Real farmers. Real records." title="Logged on the day, checked by people" bg="bg-paper">
        <Reveal delay={0.1}><p className={cx(T.lead, "text-muted")}>Farmers log each harvest on the Verdant app the day they pick it. Field officers confirm it before it is sold, so the story you read is true.</p></Reveal>
        <Reveal delay={0.2} className="flex flex-col gap-3 sm:flex-row"><Button href={R.trace()} arrow>See an example</Button><Button href={R.traceSearch} variant="secondary" icon="scan-line">Scan a code</Button></Reveal>
      </PhotoSplit>
    </PublicPage>
  );
}
