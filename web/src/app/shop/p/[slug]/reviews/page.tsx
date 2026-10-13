import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/page";
import { Container } from "@/components/site/sections";
import { Reveal, SplitWords } from "@/components/motion";
import { Crumbs } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { CATEGORIES, cedi, farmBySlug, TINT } from "@/lib/data";
import { CATALOG, findProduct, RATING } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { RatingCard, ReviewList } from "./reviews-client";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = findProduct((await params).slug);
  return p ? { title: `Reviews · ${p.name}`, description: `${RATING.count} reviews of ${p.name} from verified Verdant buyers.` } : {};
}

export default async function ReviewsPage({ params }: P) {
  const p = findProduct((await params).slug);
  if (!p) notFound();
  const cat = CATEGORIES.find((c) => c.slug === p.cat);
  return (
    <PublicPage nav="light">
      <section className="pt-[68px] lg:pt-[72px]">
        <Container className="grid gap-8 py-8 md:py-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="flex flex-col gap-6">
            <Crumbs items={[["Shop", R.shop], [cat?.label ?? "Shop", p.cat === "packs" ? R.packs : R.category(p.cat)], [p.name, R.product(p.slug)], ["Reviews"]]} />
            <div className="flex items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/products/${p.img}.jpg`} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover mix-blend-multiply md:h-24 md:w-24" style={{ background: TINT[p.img] }} />
              <div className="flex flex-col gap-1">
                <SplitWords text={p.name} className={cx(T.h1, "text-deep")} delay={0.05} />
                <Reveal delay={0.2}><p className="text-[15px] text-muted">{farmBySlug(p.farm).name} · {cedi(p.price)} / {p.unit}</p></Reveal>
              </div>
            </div>
          </div>
          <RatingCard />
        </Container>
      </section>
      <section className="bg-paper py-14 md:py-20">
        <Container><ReviewList product={p.slug} /></Container>
      </section>
    </PublicPage>
  );
}
