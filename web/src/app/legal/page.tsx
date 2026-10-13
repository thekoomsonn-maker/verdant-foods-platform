import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { TopBand } from "@/components/site/sections";
import { LegalBody } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Privacy and terms", description: "How Verdant Foods handles your data, our terms of sale and the cookies we use." };

export default function Legal() {
  return (
    <PublicPage nav="light">
      <TopBand crumbs={[["Home", R.home], ["Legal"]]} title="Privacy and terms" sub="Last updated 1 October 2026" />
      <LegalBody />
    </PublicPage>
  );
}
