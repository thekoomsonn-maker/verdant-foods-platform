import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { PageHero } from "@/components/site/sections";
import { ClipReveal, Reveal, ScrollProgress, Stagger } from "@/components/motion";
import { Container, Eyebrow, GlassChip, Section } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { FreshnessClock } from "@/components/trace/freshness-clock";
import { Journey } from "@/components/trace/journey";
import { AlertForm, BuyAgain, ThankYou } from "@/components/trace/actions";
import { CodeNotFound } from "@/components/trace/code-not-found";
import { getTrace, normaliseCode, SUMMARY, TRACE_FARM } from "@/lib/data-trace";
import { R } from "@/lib/routes";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const t = getTrace(code);
  return t ? { title: `${t.product} from Nyankpala · ${t.code}` } : { title: "Code not found" };
}

export default async function TracePage({ params }: Props) {
  const { code } = await params;
  const t = getTrace(code);
  if (!t) return <CodeNotFound code={normaliseCode(code)} />;
  const farm = TRACE_FARM;

  return (
    <PublicPage nav="overlay">
      <ScrollProgress />
      <PageHero
        img="/img/hands-tomato.jpg"
        height="mid"
        eyebrow={<div className="flex flex-wrap gap-2"><GlassChip icon="qr-code">{t.code}</GlassChip><GlassChip icon="circle-check">Verified journey</GlassChip></div>}
        title="Your vine tomatoes came from Nyankpala"
        sub={`Grown by ${t.farmer} and the ${farm.name}, ${farm.district} District.`}
        side={<FreshnessClock hours={t.hoursSincePick} />}
      />

      {/* Summary strip */}
      <section className="bg-deep text-white">
        <Container>
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 md:py-7 lg:grid-cols-4" y={10}>
            {SUMMARY.map(([i, k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest text-lime"><Icon name={i} size={20} /></span>
                <span className="min-w-0"><span className="block text-[13px] text-white/70">{k}</span><span className="block text-[14px] font-semibold md:text-[15px]">{v}</span></span>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Scroll-linked journey */}
      <Section id="journey" className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-24">
          <Reveal><h2 className={cx(T.h2, "text-deep")}>Every step, every hand</h2></Reveal>
          <Reveal delay={0.1}><p className={cx(T.lead, "max-w-[460px] text-muted")}>The route your tomatoes took, with the weight checked at each handover.</p></Reveal>
        </div>
        <Journey />
      </Section>

      {/* The farm */}
      <Section bg="bg-paper" className="grid items-center gap-8 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-16">
        <ClipReveal className="relative flex flex-col justify-end h-[420px] overflow-hidden rounded-3xl md:h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={farm.photo} alt={`${t.farmer} on the farm`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(1_31_26/.7))]" />
          <div className="glass-dark relative m-4 mt-auto w-[calc(100%-2rem)] rounded-2xl px-5 py-4 text-white md:m-5 md:w-[calc(100%-2.5rem)]">
            <div className="text-[18px] font-semibold">{t.farmer}</div>
            <div className="text-[14px] text-white/80">Group leader · farming since 2009</div>
          </div>
        </ClipReveal>
        <div className="flex flex-col gap-5">
          <Reveal><Eyebrow>The farm</Eyebrow></Reveal>
          <Reveal delay={0.05}><h2 className={cx(T.h2, "text-deep")}>{farm.name}</h2></Reveal>
          <Reveal delay={0.1}><p className={cx(T.lead, "max-w-[600px] text-muted")}>{farm.members} women farming {farm.ha} hectares with drip irrigation and compost. They save together every week and share a cold room.</p></Reveal>
          <Stagger className="flex flex-wrap gap-2" y={8}>
            {([["map-pin", "Plot mapped by GPS · 5 ha", "bg-lime-soft text-deep"], ["badge-check", "Checked 6 Oct by Officer Yaw", "bg-success-bg text-success"], ["users", "Savings group member", "bg-mist text-deep"]] as const).map(([i, l, c]) => (
              <span key={l} className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium", c)}><Icon name={i} size={15} />{l}</span>
            ))}
          </Stagger>
          <Reveal delay={0.2} className="flex flex-wrap gap-3">
            <Link href={R.traceFarm(t.code)} className="group/fb inline-flex h-12 items-center gap-2 rounded-full bg-deep px-[26px] font-semibold text-white transition-colors hover:bg-forest active:scale-[0.97]">Visit the farm page<Icon name="arrow-right" size={20} className="transition-transform group-hover/fb:translate-x-[3px]" /></Link>
          </Reveal>
        </div>
      </Section>

      {/* Spray record */}
      <Section className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <Reveal><Eyebrow>Spray and fertiliser record</Eyebrow></Reveal>
          <Reveal delay={0.05}><h2 className={cx(T.h2, "text-deep")}>Safe to eat</h2></Reveal>
          <Reveal delay={0.1}><p className="text-muted">Every input is logged by the farmer and checked by an officer. Harvests that come too soon after a spray cannot be sold.</p></Reveal>
          <Reveal delay={0.15}><Link href={R.traceSpray(t.code)} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-deep">See the safe gap <Icon name="arrow-up-right" size={18} /></Link></Reveal>
        </div>
        <Reveal delay={0.1} className="overflow-hidden rounded-[20px] bg-white ring-1 ring-line">
          <div className="grid grid-cols-[72px_1fr_88px] gap-3 bg-paper px-4 py-3 text-[13px] text-muted md:grid-cols-[110px_1fr_120px] md:px-6"><span>Date</span><span>Input</span><span>Safe gap</span></div>
          <Stagger gap={0.05} y={8}>
            {[...t.sprays.filter((s) => s.type !== "Water").map((s) => [s.date, s.type === "Organic" ? `${s.input} (organic)` : s.input, s.gap === "None" ? "None" : s.gap, false] as const), ["12 Oct", "Harvest · 16 days after last spray", "Safe", true] as const].map(([d, i, g, ok]) => (
              <div key={d + i} className="grid grid-cols-[72px_1fr_88px] gap-3 border-t border-line px-4 py-3.5 text-[14px] md:grid-cols-[110px_1fr_120px] md:px-6">
                <span className="font-semibold tabular">{d}</span><span>{i}</span>
                <span className={ok ? "inline-flex items-center gap-1.5 font-semibold text-success" : "tabular"}>{ok && <Icon name="circle-check" size={15} />}{g}</span>
              </div>
            ))}
          </Stagger>
        </Reveal>
      </Section>

      {/* Alerts and actions */}
      <Section bg="bg-deep" className="grid gap-4 text-white lg:grid-cols-2">
        <Reveal className="flex flex-col gap-4 rounded-3xl bg-forest p-6 md:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lime"><Icon name="shield-check" size={22} /></span>
          <div><h3 className={T.h4}>No safety alerts for this batch</h3><p className="mt-1.5 text-white/75">If anything changes, we can message you straight away.</p></div>
          <div className="mt-auto"><AlertForm batch={t.batch} /></div>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-col gap-4 rounded-3xl bg-forest p-6 md:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lime"><Icon name="heart" size={22} /></span>
          <div><h3 className={T.h4}>Enjoyed them?</h3><p className="mt-1.5 text-white/75">Thank {t.farmer.split(" ")[0]}, rate this harvest or buy from her again.</p></div>
          <div className="mt-auto flex flex-wrap items-start gap-3"><BuyAgain light /><div className="min-w-0 flex-1"><ThankYou farmer={t.farmer} /></div></div>
        </Reveal>
      </Section>
    </PublicPage>
  );
}
