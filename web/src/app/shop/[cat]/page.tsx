import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/page";
import { CategoryBar, Container, ImageCard, PromiseBand } from "@/components/site/sections";
import { Reveal, Stagger } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { CATEGORIES, farmBySlug } from "@/lib/data";
import { CAT_META, CATALOG, SHOP_CATS } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { CategoryClient } from "./category-client";

type P = { params: Promise<{ cat: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return SHOP_CATS.map((cat) => ({ cat }));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { cat } = await params;
  const m = CAT_META[cat as keyof typeof CAT_META];
  return { title: m ? `${m.title} · Shop` : "Shop", description: m?.sub };
}

export default async function CategoryPage({ params }: P) {
  const { cat } = await params;
  const meta = CAT_META[cat as keyof typeof CAT_META];
  if (!meta) notFound();
  const label = CATEGORIES.find((c) => c.slug === cat)?.label ?? meta.title;
  const items = CATALOG.filter((p) => p.cat === cat);
  const farms = [...new Set(items.map((p) => p.farm))].map(farmBySlug);
  return (
    <PublicPage nav="light">
      <div className="pt-[68px] lg:pt-[72px]">
        <CategoryBar active={cat} />
        <Container className="flex flex-col gap-14 pb-20 pt-6 md:gap-16 md:pb-28 md:pt-8">
          <CategoryClient cat={cat} label={label} meta={meta} items={items} farmCount={farms.length} />
          {farms.length > 0 && (
            <section className="flex flex-col gap-8">
              <Reveal><h2 className={cx(T.h2, "text-deep")}>{meta.farmsLine}</h2></Reveal>
              <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {farms.slice(0, 3).map((f) => <ImageCard key={f.slug} img={f.photo} title={f.name} sub={`${f.members} farmers · ${f.district}`} href={R.farm(f.slug)} h="h-[300px] lg:h-[360px]" />)}
              </Stagger>
            </section>
          )}
        </Container>
      </div>
      <PromiseBand />
    </PublicPage>
  );
}
