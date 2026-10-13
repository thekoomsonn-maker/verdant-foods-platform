import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, ImageCard, PageHero, Tiles } from "@/components/site/sections";
import { Button, Section } from "@/components/ui";
import { Stagger } from "@/components/motion";
import { Title } from "@/components/corporate/blocks";
import { RolesList } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Careers", description: "Jobs at Verdant Foods in Accra, at our packhouses and on farms across Ghana." };

export default function Careers() {
  return (
    <PublicPage>
      <PageHero img="/img/hq-accra.jpg" eyebrow="Careers" title="Help us feed Ghana better." sub="Jobs at our Accra head office, our packhouses and on farms across Ghana."
        actions={<Button href={`${R.careers}#roles`} variant="lime" arrow>See open roles</Button>} />

      <Section className="flex flex-col gap-10">
        <Title text="Why people stay" />
        <Tiles items={[
          ["hand-coins", "Fair pay", "Reviewed every year, paid on time.", undefined, "/illustrations/fair-pay.jpg"],
          ["shield", "Health cover", "For you and your family.", undefined, "/illustrations/health-cover.jpg"],
          ["book-open", "Learn on the job", "A training budget for everyone.", undefined, "/illustrations/learn.jpg"],
          ["sprout", "Real impact", "See the farms you help.", R.impact, "/illustrations/real-impact.jpg"],
        ]} />
      </Section>

      <RolesList />

      <Section className="flex flex-col gap-10">
        <Title text="Life at Verdant" />
        <Stagger className="grid gap-4 md:grid-cols-2">
          <ImageCard img="/img/officer-tablet.jpg" title="In the field" sub="Officers spend most days on farms." href={R.farmers} h="h-[360px] lg:h-[480px]" />
          <ImageCard img="/img/sorting-hands.jpg" title="At the packhouse" sub="Sorting starts at 6 am." href={R.traceInfo} h="h-[360px] lg:h-[480px]" />
        </Stagger>
      </Section>

      <CtaBleed img="/img/greenhouse-tomatoes.jpg" title="No role for you yet?" sub="We read every one."
        actions={<Button href={R.contact} variant="lime" arrow>Send us your CV</Button>} />
    </PublicPage>
  );
}
