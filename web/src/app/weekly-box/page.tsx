import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { Faq, PageHero, StepsRow } from "@/components/site/sections";
import { Reveal } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { BoxBuilder, BoxHeroActions, BoxPrice } from "./box-client";

export const metadata: Metadata = { title: "Weekly box", description: "A box of fresh produce every week, picked on Monday and at your door by Wednesday. Skip or pause any week." };

export default function WeeklyBoxPage() {
  return (
    <PublicPage>
      <PageHero img="/img/family-unbox.jpg" height="mid" eyebrow="Weekly box" title="A week of fresh food, every week."
        sub="Picked on Monday, at your door by Wednesday." actions={<BoxHeroActions />} side={<BoxPrice />} />
      <BoxBuilder />
      <section className="bg-deep py-[72px] text-white md:py-24">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-5 md:px-8 lg:px-16">
          <Reveal><h2 className={cx(T.h2)}>How it works</h2></Reveal>
          <StepsRow dark items={[["01", "Choose", "Pick a size and a day."], ["02", "We pick", "Farmers harvest on Monday."], ["03", "We pack", "Weighed and coded in Tamale."], ["04", "You eat", "At your door in a cool bag."]]} />
        </div>
      </section>
      <Faq qs={[
        ["Can I skip a week?", "Yes. Skip or pause in your account up to Sunday 8 pm."],
        ["Can I choose what is inside?", "You can swap up to three items each week in your account. We fill the rest with what is freshest."],
        ["How do I pay?", "MTN MoMo, Telecel Cash, AT Money or card. We charge on Monday, after you can still make changes."],
      ]} />
    </PublicPage>
  );
}
