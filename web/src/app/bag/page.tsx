import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { BagView } from "./bag-client";

export const metadata: Metadata = { title: "Your bag", description: "Check your bag, grouped by the farm each item comes from." };

export default function BagPage() {
  return (
    <PublicPage nav="light">
      <BagView />
    </PublicPage>
  );
}
