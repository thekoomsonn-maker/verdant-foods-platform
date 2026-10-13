import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, Faq, PageHero, Tiles } from "@/components/site/sections";
import { Button, Checks, Container, Section } from "@/components/ui";
import { CountUp, Reveal } from "@/components/motion";
import { Spark } from "@/components/charts";
import { T } from "@/components/tokens";
import { HeroCard, PhotoSplit, Steps, Title } from "@/components/corporate/blocks";
import { FarmerApp } from "@/components/corporate/client";
import { FARMER_FAQ } from "@/lib/data-corporate";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "For farmers", description: "Sell your harvest through Verdant at prices agreed before harvest, and get paid to mobile money within 48 hours." };

const APP = `${R.farmers}#app`;

export default function Farmers() {
  return (
    <PublicPage>
      <PageHero img="/video/farmers-poster.jpg" video="/video/farmers" eyebrow="For farmers and savings groups" title="Sell your harvest. Get paid on time."
        sub="Over 500 farmers sell through Verdant at prices agreed before harvest."
        actions={<><Button href={APP} variant="lime" arrow>Get the farmer app</Button><Button href={R.contact} variant="glass">Talk to a field officer</Button></>}
        side={
          <HeroCard>
            <div className="flex items-center justify-between"><span className="text-[13px] text-lime">Paid to Amina today</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[12px]"><span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />MoMo</span></div>
            <CountUp value="GH₵ 2,480" className="mt-2 block text-[32px] font-semibold tracking-[-0.02em]" />
            <div className="mt-1 text-[13px] text-white/70">MTN MoMo · 48 h after collection</div>
            <div className="mt-3 h-10"><Spark values={[2, 2.4, 2.2, 3, 3.1, 3.6, 3.4, 4.2]} color="#BBEA70" w={340} h={40} /></div>
          </HeroCard>
        } />

      <Section className="flex flex-col gap-10">
        <Title text="Why farmers choose Verdant" />
        <Tiles items={[
          ["hand-coins", "Fair, agreed prices", "Know your price before you harvest.", undefined, "/illustrations/fair-prices.jpg"],
          ["wallet", "Paid to mobile money", "MTN MoMo, Telecel Cash or AT Money within 48 hours.", undefined, "/illustrations/momo-paid.jpg"],
          ["truck", "Collection near you", "Drop your harvest at a collection point near your farm.", undefined, "/illustrations/collection-point.jpg"],
          ["sprout", "Free farm advice", "Field officers visit and help you grow more.", undefined, "/illustrations/farm-advice.jpg"],
        ]} />
      </Section>

      <section className="bg-deep py-[72px] text-white md:py-24 lg:py-[120px]">
        <Container className="flex flex-col gap-10">
          <Title text="How to join" sub="About a week from sign-up to your first sale." light />
          <Steps dark items={[
            ["01", "Get the app", "Download it or ask a field officer to sign you up."],
            ["02", "Register your farm", "We walk your farm boundary with GPS."],
            ["03", "Farm check", "An officer checks how you grow and spray."],
            ["04", "Start selling", "Log a harvest and we collect and sell it."],
          ]} />
        </Container>
      </section>

      <FarmerApp />

      <PhotoSplit img="/img/vsla-savings-box.jpg" eyebrow="Savings groups" title="Run your savings group on your phone" flip bg="bg-paper">
        <Reveal delay={0.1}><p className={T.lead + " text-muted"}>Village savings and loan groups keep their weekly records in the Verdant app. No more lost books.</p></Reveal>
        <Reveal delay={0.2}><Checks items={["Record savings at the meeting", "Track loans and repayments", "See the group box total any time", "Records stay safe, even if the phone is lost"]} /></Reveal>
        <Reveal delay={0.3}><Button href={R.contact} arrow>Register your group</Button></Reveal>
      </PhotoSplit>

      <Faq qs={FARMER_FAQ} />

      <CtaBleed img="/img/young-farmer-app.jpg" title="Ready to sell with Verdant?"
        actions={<><Button href={APP} variant="lime" arrow>Get the farmer app</Button><Button href="tel:+233245550100" variant="glass" icon="phone">Call the farmer line</Button></>} />
    </PublicPage>
  );
}
