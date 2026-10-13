import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/page";
import { NumCard, StoryCard } from "@/components/site/sections";
import { Container, Crumbs, Section } from "@/components/ui";
import { ClipReveal, Reveal, ScrollProgress, SplitWords, Stagger } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { Title } from "@/components/corporate/blocks";
import { ShareBar } from "@/components/corporate/client";
import { STORIES } from "@/lib/data";
import { articleBySlug } from "@/lib/data-corporate";
import { R } from "@/lib/routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = STORIES.find((x) => x.slug === slug);
  const a = articleBySlug(slug);
  return s && a ? { title: s.title, description: a.lede } : { title: "Story not found" };
}

export default async function StoryArticle({ params }: Props) {
  const { slug } = await params;
  const s = STORIES.find((x) => x.slug === slug);
  const a = articleBySlug(slug);
  if (!s || !a) notFound();
  const more = STORIES.filter((x) => x.slug !== slug).sort((x, y) => Number(y.tag === s.tag) - Number(x.tag === s.tag)).slice(0, 3);
  const BG = ["bg-lime-soft", "bg-sun-soft"];

  return (
    <PublicPage nav="light">
      <ScrollProgress />
      <section className="pt-[68px] lg:pt-[72px]">
        <Container className="flex justify-center py-12 md:py-16">
          <div className="flex w-full max-w-[860px] flex-col gap-5">
            <Crumbs items={[["Stories", R.stories], [s.tag]]} />
            <SplitWords text={s.title} className={cx(T.display, "text-deep")} delay={0.05} />
            <Reveal delay={0.3}><p className={cx(T.lead, "text-muted")}>{a.lede}</p></Reveal>
            <Reveal delay={0.4} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-[13px] font-semibold text-deep">{a.initials}</span>
              <div><div className="text-[15px] font-semibold">{a.author}</div><div className="text-[13px] text-muted">{a.date} · {a.read}</div></div>
            </Reveal>
          </div>
        </Container>
        <Container>
          <ClipReveal className="h-[300px] overflow-hidden rounded-3xl md:h-[460px] lg:h-[620px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.hero} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          </ClipReveal>
        </Container>
      </section>

      <Container className="flex justify-center py-14 md:py-16">
        <article className="flex w-full max-w-[720px] flex-col gap-6">
          {a.intro.map((p, i) => <Reveal key={i} delay={i * 0.05}><p className="text-[18px] leading-[1.6] text-ink">{p}</p></Reveal>)}
          <Reveal><blockquote className="border-l-4 border-leaf pl-6 text-[26px] font-medium leading-snug tracking-[-0.02em] text-deep md:text-[32px]">{a.quote}</blockquote></Reveal>
          <Stagger className="grid grid-cols-2 gap-3">
            {a.stats.map(([n, l], i) => <NumCard key={l} n={n} l={l} bg={BG[i % 2]} />)}
          </Stagger>
          <Reveal><h2 className={cx(T.h4, "pt-2 text-ink")}>{a.sub}</h2></Reveal>
          <Reveal><p className="text-[18px] leading-[1.6] text-ink">{a.body}</p></Reveal>
          <ClipReveal className="h-[300px] overflow-hidden rounded-3xl md:h-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </ClipReveal>
          <Reveal><p className="text-[18px] leading-[1.6] text-ink">{a.close}</p></Reveal>
          <div className="border-t border-line pt-6"><ShareBar title={s.title} /></div>
        </article>
      </Container>

      <Section bg="bg-paper" className="flex flex-col gap-8">
        <Title text="More stories" />
        <Stagger className="grid gap-x-6 gap-y-10 md:grid-cols-3">
          {more.map((m) => <StoryCard key={m.slug} s={m} h="h-[220px] md:h-[260px]" />)}
        </Stagger>
      </Section>
    </PublicPage>
  );
}
