import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, PageHero, ProductGrid } from "@/components/site/sections";
import { ClipReveal, Reveal, Stagger } from "@/components/motion";
import { Eyebrow, GlassChip, GlassStat, Section } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { CodeNotFound } from "@/components/trace/code-not-found";
import { ThankYou } from "@/components/trace/actions";
import { productBySlug } from "@/lib/data";
import { FARM_PRODUCTS, getTrace, normaliseCode, TRACE_FARM, VISITS } from "@/lib/data-trace";
import { R } from "@/lib/routes";
import { FarmPlots, SeasonChart } from "./farm-client";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: getTrace(code) ? `${TRACE_FARM.name} · Farm story` : "Code not found" };
}

export default async function FarmStory({ params }: Props) {
  const { code } = await params;
  const t = getTrace(code);
  if (!t) return <CodeNotFound code={normaliseCode(code)} />;
  const f = TRACE_FARM;
  return (
    <PublicPage nav="overlay">
      <PageHero
        img="/img/vsla-meeting.jpg"
        height="mid"
        crumbs={[["Your food", R.trace(t.code)], ["Farm story"]]}
        eyebrow={<GlassChip icon="qr-code">Farm story · from code {t.code}</GlassChip>}
        title={f.name}
        sub={`${f.members} women, ${f.ha} hectares. ${f.district} District, ${f.region} Region.`}
      >
        <Stagger className="flex flex-wrap gap-2 md:gap-3" y={10}>
          {([[`${f.ha} ha`, "farmed"], [String(f.members), "members"], [String(f.since), "with Verdant"], ["5 of 5", "checks passed"]] as const).map(([n, l]) => (
            <GlassStat key={l} n={n} l={l} className="!rounded-2xl !px-4 !py-3 [&>div:first-child]:!text-[20px] md:[&>div:first-child]:!text-[24px] [&>div:last-child]:!mt-1 [&>div:last-child]:!text-[12px]" />
          ))}
        </Stagger>
      </PageHero>

      <Section><FarmPlots /></Section>

      <Section bg="bg-paper" className="flex flex-col gap-8">
        <Reveal><h2 className={cx(T.h2, "text-deep")}>What they grow, and when</h2></Reveal>
        <SeasonChart />
      </Section>

      <Section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Reveal><Eyebrow>Checked</Eyebrow></Reveal>
          <Reveal delay={0.05}><h2 className={cx(T.h2, "text-deep")}>Every visit, on record</h2></Reveal>
          <ClipReveal className="relative flex flex-col justify-end h-[300px] overflow-hidden rounded-3xl md:h-[340px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/officer-tablet.jpg" alt="Officer Yaw Appiah on a farm visit" className="absolute inset-0 h-full w-full object-cover" />
            <div className="glass-dark relative m-4 mt-auto w-[calc(100%-2rem)] rounded-2xl px-5 py-4 text-white">
              <div className="text-[17px] font-semibold">Officer Yaw Appiah</div><div className="text-[14px] text-white/80">Visits every two weeks</div>
            </div>
          </ClipReveal>
        </div>
        <Stagger className="flex flex-col self-center" gap={0.06} y={12}>
          {VISITS.map((v) => (
            <div key={v.date + v.title} className="grid grid-cols-[64px_1fr] gap-4 border-b border-line py-5 md:grid-cols-[88px_1fr]">
              <span className="pt-0.5 text-[14px] font-semibold tabular text-deep">{v.date}</span>
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-bg text-success"><Icon name="check" size={15} /></span>
                <div><div className="font-semibold">{v.title}</div><div className="mt-0.5 text-[14px] text-muted">{v.note}</div></div>
              </div>
            </div>
          ))}
        </Stagger>
      </Section>

      <Section bg="bg-paper" className="flex flex-col gap-8">
        <Reveal><h2 className={cx(T.h2, "text-deep")}>Buy from this farm</h2></Reveal>
        <ProductGrid items={FARM_PRODUCTS.map(productBySlug)} />
      </Section>

      <div id="thanks">
        <CtaBleed img="/img/hands-tomato.jpg" title={`Say thank you to ${t.farmer.split(" ")[0]}`} sub="Messages are read out at the next group meeting." actions={<ThankYou farmer={t.farmer} variant="lime" center />} />
      </div>
    </PublicPage>
  );
}
