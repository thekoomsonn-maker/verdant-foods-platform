import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/page";
import { PageHero, ProductGrid, Section } from "@/components/site/sections";
import { ClipReveal, Reveal } from "@/components/motion";
import { Button, Checks, Eyebrow, Head } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { FARMS, PRODUCTS } from "@/lib/data";
import { CATALOG, farmStats, plotsOf } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { FarmFollow, FarmHeroStats, FarmPlots } from "./farm-client";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return FARMS.map((f) => ({ slug: f.slug }));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const f = FARMS.find((x) => x.slug === slug);
  return f ? { title: f.name, description: `${f.name}, ${f.district} District, ${f.region} Region. ${f.members} members on ${f.ha} hectares, checked by Verdant field officers.` } : {};
}

export default async function FarmPage({ params }: P) {
  const { slug } = await params;
  const f = FARMS.find((x) => x.slug === slug);
  if (!f) notFound();
  const plots = plotsOf(f);
  const own = CATALOG.filter((p) => p.farm === f.slug);
  const items = (own.length ? own : PRODUCTS.filter((p) => p.cat !== "packs")).slice(0, 4);
  return (
    <PublicPage>
      <PageHero
        img={f.photo} height="mid" title={f.name}
        crumbs={[["Shop", R.shop], ["Farms", R.farmers], [f.name]]}
        eyebrow={
          <span className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.photo} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white/60" />
            <span className="flex flex-col gap-1.5">
              <span className="glass inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium text-white"><Icon name="badge-check" size={15} className="text-lime" />Verified farm · checked 6 Oct</span>
              <span className="text-[14px] text-white/80">{f.district} District, {f.region} Region</span>
            </span>
          </span>
        }
        actions={<><Button href={R.category(own[0]?.cat === "packs" || !own[0] ? "vegetables" : own[0].cat)} variant="lime" arrow>Shop this farm</Button><FarmFollow name={f.name} /></>}
        side={<FarmHeroStats stats={farmStats(f)} />}
      />

      <Section className="flex flex-col gap-10">
        <Head title="Where it grows" sub={`${plots.length === 3 ? "Three" : plots.length} mapped plots, walked and checked by our field officer.`} />
        <FarmPlots farm={f} plots={plots} />
      </Section>

      <Section bg="bg-paper" className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <ClipReveal className="relative h-[320px] overflow-hidden rounded-3xl md:h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/vsla-savings-box.jpg" alt="" className="h-full w-full object-cover" />
        </ClipReveal>
        <Reveal className="flex flex-col gap-5">
          <Eyebrow>About the farm</Eyebrow>
          <h2 className={cx(T.h2, "text-deep")}>A savings group that farms together</h2>
          <p className={cx(T.body, "text-muted")}>The group formed in {f.since} and now shares drip irrigation, a seedling nursery and a cool room. Members save every week and lend to each other for inputs.</p>
          <Checks items={["Drip irrigation on all plots", "Compost and crop rotation", "Every spray logged on the app"]} />
          <Link href={R.farmers} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-deep">How farmers sell with Verdant <Icon name="arrow-up-right" size={18} /></Link>
        </Reveal>
      </Section>

      <Section className="flex flex-col gap-10">
        <div className="flex items-end justify-between gap-4">
          <Reveal><h2 className={cx(T.h2, "text-deep")}>Available this week</h2></Reveal>
          <Link href={R.shop} className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-deep">All {own.length || 8} products <Icon name="arrow-up-right" size={18} /></Link>
        </div>
        <ProductGrid items={items} />
      </Section>
    </PublicPage>
  );
}
