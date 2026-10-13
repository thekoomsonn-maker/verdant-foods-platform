import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, ImageCard, PageHero, Tiles } from "@/components/site/sections";
import { Button, Section } from "@/components/ui";
import { Stagger } from "@/components/motion";
import { Title } from "@/components/corporate/blocks";
import { RolesList } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Careers", description: "Jobs at Verdant Foods in Tamale, Accra and on the farms." };

export default function Careers() {
  return (
    <PublicPage>
      <PageHero img="/img/packhouse.jpg" eyebrow="Careers" title="Help us feed Ghana better." sub="Jobs in Tamale, Accra and on the farms."
        actions={<Button href={`${R.careers}#roles`} variant="lime" arrow>See open roles</Button>} />

      <Section className="flex flex-col gap-10">
        <Title text="Why people stay" />
        <Tiles items={[
          ["hand-coins", "Fair pay", "Reviewed every year, paid on time."],
          ["shield", "Health cover", "For you and your family."],
          ["book-open", "Learn on the job", "A training budget for everyone."],
          ["sprout", "Real impact", "See the farms you help.", R.impact],
        ]} />
      </Section>

      <RolesList />

      <Section className="flex flex-col gap-10">
        <Title text="Life at Verdant" />
        <Stagger className="grid gap-4 md:grid-cols-2">
          <ImageCard img="/img/officer-tablet.jpg" title="In the field" sub="Officers spend most days on farms." href={R.farmers} h="h-[360px] lg:h-[480px]" />
          <ImageCard img="/img/packhouse.jpg" title="At the packhouse" sub="Sorting starts at 6 am." href={R.traceInfo} h="h-[360px] lg:h-[480px]" />
        </Stagger>
      </Section>

      <CtaBleed img="/img/vsla-meeting.jpg" title="No role for you yet?" sub="We read every one."
        actions={<Button href={R.contact} variant="lime" arrow>Send us your CV</Button>} />
    </PublicPage>
  );
}
