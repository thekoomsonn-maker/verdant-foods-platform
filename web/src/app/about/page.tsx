import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, ImageCard, PageHero, StatsBleed, Tiles } from "@/components/site/sections";
import { Button, Eyebrow, Section } from "@/components/ui";
import { Reveal, Stagger } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { Title } from "@/components/corporate/blocks";
import { WhereWeWork, SplitIn } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "About", description: "Verdant Foods buys straight from smallholder farmers in Northern Ghana, at fair prices agreed before harvest." };

export default function About() {
  return (
    <PublicPage>
      <PageHero img="/img/hero-aerial.jpg" eyebrow="About Verdant Foods" title="Food that is fair to the people who grow it." sub="A Ghanaian food company buying straight from smallholder farmers." />

      <Section className="grid gap-8 lg:grid-cols-[420px_1fr] lg:gap-24">
        <div className="flex flex-col gap-4">
          <Reveal><Eyebrow>Our story</Eyebrow></Reveal>
          <SplitIn text="Fair prices for farmers. Honest food for families." className={cx(T.h3, "font-medium text-deep lg:text-[32px]")} />
        </div>
        <div className="flex flex-col gap-5">
          <Reveal><p className={cx(T.lead, "text-muted")}>Most smallholder farmers in Northern Ghana sell to the first buyer who comes, often below a fair price. Restaurants, hotels and families in the cities pay more for produce they know little about.</p></Reveal>
          <Reveal delay={0.1}><p className={cx(T.lead, "text-muted")}>Verdant sits between the two. We agree prices with farmers before harvest, check every farm, and show buyers exactly where their food was grown.</p></Reveal>
        </div>
      </Section>

      <Section bg="bg-paper" className="flex flex-col gap-10">
        <Title text="What we stand for" />
        <Tiles cols={3} items={[
          ["hand-coins", "Fair to farmers", "Prices agreed before harvest, paid to mobile money within 48 hours.", R.farmers],
          ["qr-code", "Honest about food", "Every crate carries a trace code. Nothing is hidden.", R.traceInfo],
          ["sprout", "Good for the soil", "We favour farms that protect their soil and water.", R.impact],
        ]} />
      </Section>

      <StatsBleed img="/img/vsla-meeting.jpg" title="Where we are today" stats={[["500+", "farmers selling"], ["20", "savings groups"], ["7", "districts"], ["3", "cities served"]]} />

      <Section className="flex flex-col gap-10">
        <Title text="How we work" sub="From the field to the delivery van, every step is done by people we know." />
        <Stagger className="grid gap-4 md:grid-cols-3">
          <ImageCard img="/img/officer-tablet.jpg" title="Field officers" sub="Visit every farm and help farmers grow more." href={R.farmers} h="h-[380px] lg:h-[460px]" />
          <ImageCard img="/img/packhouse.jpg" title="Packhouse in Tamale" sub="Sorted, weighed and packed within hours." href={R.traceInfo} h="h-[380px] lg:h-[460px]" />
          <ImageCard img="/img/truck-loading.jpg" title="Cold-chain delivery" sub="Chilled trucks to Accra, Kumasi and Tamale." href={R.delivery} h="h-[380px] lg:h-[460px]" />
        </Stagger>
      </Section>

      <WhereWeWork />

      <CtaBleed img="/img/hands-tomato.jpg" title="Work with Verdant" sub="Whether you grow food or cook it, there is a place for you here."
        actions={<><Button href={R.business} variant="lime" arrow>Buy for your business</Button><Button href={R.farmers} variant="glass">Sell your harvest</Button></>} />
    </PublicPage>
  );
}
