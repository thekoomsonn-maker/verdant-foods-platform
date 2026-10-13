import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CategoryBar, Container, PromiseBand } from "@/components/site/sections";
import { Catalog, ShopPromos } from "@/components/market/catalog";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Shop fresh produce", description: "Vegetables, fruit, roots and grains from checked farms in Northern Ghana, with the freshness shown on every product." };

export default function ShopPage() {
  return (
    <PublicPage nav="light">
      <div className="pt-[68px] lg:pt-[72px]">
        <CategoryBar active="all" />
        <Container className="flex flex-col gap-10 pb-20 pt-6 md:gap-12 md:pb-28 md:pt-8">
          <ShopPromos />
          <Catalog title="All produce" crumbs={[["Home", R.home], ["Shop"]]} />
        </Container>
      </div>
      <PromiseBand />
    </PublicPage>
  );
}
