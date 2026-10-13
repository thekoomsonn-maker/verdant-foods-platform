import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/page";
import { Bleed, CategoryBar, Container, ProductGrid, Section } from "@/components/site/sections";
import { Reveal } from "@/components/motion";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { CATEGORIES, farmBySlug, PRODUCTS } from "@/lib/data";
import { CATALOG, findProduct } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { FarmerActions, ProductBuy, ProductRecord } from "./product-client";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = findProduct((await params).slug);
  return p ? { title: p.name, description: `${p.name} from ${farmBySlug(p.farm).name}. ${p.fresh}, traced from the farm to your door.` } : {};
}

export default async function ProductPage({ params }: P) {
  const p = findProduct((await params).slug);
  if (!p) notFound();
  const farm = farmBySlug(p.farm);
  const cat = CATEGORIES.find((c) => c.slug === p.cat);
  const same = CATALOG.filter((x) => x.farm === p.farm && x.slug !== p.slug);
  const more = [...same, ...PRODUCTS.filter((x) => x.farm !== p.farm && x.slug !== p.slug && x.cat === p.cat), ...PRODUCTS.filter((x) => x.slug !== p.slug)].filter((x, i, a) => a.findIndex((y) => y.slug === x.slug) === i).slice(0, 4);
  return (
    <PublicPage nav="light">
      <div className="pt-[68px] lg:pt-[72px]">
        <CategoryBar active={p.cat === "packs" ? "packs" : p.cat} />
        <Container className="pb-16 pt-6 md:pb-24 md:pt-8">
          <ProductBuy p={p} catLabel={cat?.label ?? "Shop"} />
        </Container>
      </div>

      <Section bg="bg-paper" tight>
        <ProductRecord p={p} />
      </Section>

      <Bleed img={farmBySlug(p.farm).photo} align="end" overlay="linear-gradient(90deg, rgb(1 31 26 / .7), rgb(1 31 26 / .15) 70%)">
        <Reveal className="glass-dark flex max-w-[520px] flex-col gap-4 rounded-3xl p-6 md:p-8">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-lime">Meet the farmer</span>
          <h2 className={cx(T.h3, "text-white")}>{farm.leader}, {farm.name}</h2>
          <p className="text-[15px] text-white/80">{farm.leader.split(" ")[0]} leads a group of {farm.members} farmers growing on {farm.ha} hectares in {farm.district} with drip irrigation.</p>
          <FarmerActions farm={farm.slug} name={farm.name} />
        </Reveal>
      </Bleed>

      <Section className="flex flex-col gap-10">
        <div className="flex items-end justify-between gap-4">
          <Reveal><h2 className={cx(T.h2, "text-deep")}>{same.length ? "From the same farm" : "You may also like"}</h2></Reveal>
          <Link href={R.farm(farm.slug)} className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-deep">See all <Icon name="arrow-up-right" size={18} /></Link>
        </div>
        <ProductGrid items={more} />
      </Section>
    </PublicPage>
  );
}
