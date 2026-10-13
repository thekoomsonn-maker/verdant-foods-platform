import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { PageHero } from "@/components/site/sections";
import { Button } from "@/components/ui";
import { Newsletter, StoriesGrid } from "@/components/corporate/client";
import { STORIES } from "@/lib/data";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Stories", description: "Short reads from the farms, kitchens and vans behind Verdant Foods." };

export default function Stories() {
  return (
    <PublicPage>
      <PageHero img="/img/hands-tomato.jpg" height="mid" eyebrow="Stories" title="From the farm, in their own words."
        actions={<Button href={R.story(STORIES[0].slug)} variant="lime" arrow>Read the latest</Button>} />
      <StoriesGrid />
      <Newsletter title="One story a week" sub="Short reads from the farms. No spam." />
    </PublicPage>
  );
}
