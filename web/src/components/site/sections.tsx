"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CATEGORIES, farmBySlug, productImg, TINT, cedi, type Product } from "@/lib/data";
import { R } from "@/lib/routes";
import { Icon, type IconName } from "../icon";
import { ClipReveal, MediaFrame, ParallaxImage, Reveal, RollNumber, SplitWords, StackCards, Stagger, Tilt, EASE, spotlight } from "../motion";
import { AutoVideo } from "../media/auto-video";
import { Button, Chip, Container, Crumbs, cx, Eyebrow, GlassChip, GlassStat, Head, Section, T } from "../ui";
import { useBag } from "./bag";
import { useToast } from "../toast";

const SHADE = "linear-gradient(180deg, rgb(1 31 26 / .5) 0%, rgb(1 31 26 / .1) 35%, rgb(1 26 20 / .88) 100%)";

/* ---------- Hero video: small file on phones, full HD on desktop, poster until the first frame plays. Always autoplays. ---------- */
function HeroVideo({ base, poster }: { base: string; poster: string }) {
  return <AutoVideo base={base} poster={poster} />;
}

/* ---------- Full-bleed hero (image or video): layered parallax + scale-in + scroll cue ----------
 * Background drifts down at ~0.25x, the headline block rises faster and fades, the glass side card moves at a third of that. */
export function PageHero({ img, video, title, sub, eyebrow, actions, side, height = "tall", children, crumbs }: {
  img: string; video?: string; title: string; sub?: string; eyebrow?: ReactNode; actions?: ReactNode; side?: ReactNode; height?: "tall" | "mid" | "short"; children?: ReactNode; crumbs?: [string, string?][];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const textO = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -48]);
  const cueO = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.5]);
  const h = height === "tall" ? "min-h-[720px] h-[100svh] max-h-[960px]" : height === "mid" ? "min-h-[600px] h-[78svh] max-h-[760px]" : "min-h-[480px] h-[60svh] max-h-[580px]";
  return (
    <section ref={ref} className={cx("relative flex overflow-hidden bg-night text-white", h)}>
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.div className="absolute inset-0" initial={{ scale: reduce ? 1 : 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
          {video ? (
            <HeroVideo base={video} poster={img} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" style={{ background: SHADE }} />
      <motion.div className="absolute inset-0 bg-night" style={{ opacity: dim }} />
      <Container className="relative mt-auto flex flex-col gap-8 pb-10 pt-32 md:pb-14 lg:flex-row lg:items-end lg:justify-between lg:pb-[72px]">
        <motion.div style={{ y: textY, opacity: textO }} className="flex max-w-[860px] flex-col gap-5 md:gap-6">
          {crumbs && <Crumbs items={crumbs} light />}
          {eyebrow && <Reveal delay={0.05}>{typeof eyebrow === "string" ? <GlassChip dot>{eyebrow}</GlassChip> : eyebrow}</Reveal>}
          <SplitWords text={title} className={T.hero} />
          {sub && <Reveal delay={0.45}><p className={cx(T.lead, "max-w-[640px] text-white/85")}>{sub}</p></Reveal>}
          {actions && <Reveal delay={0.6} className="flex flex-col gap-3 sm:flex-row">{actions}</Reveal>}
          {children}
        </motion.div>
        {side && <motion.div style={{ y: sideY }} className="lg:w-[380px] lg:shrink-0"><Reveal delay={0.7}>{side}</Reveal></motion.div>}
      </Container>
      {height === "tall" && (
        <motion.div style={{ opacity: cueO }} aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="relative block h-12 w-[2px] overflow-hidden rounded-full bg-white/25"><span className="absolute inset-x-0 top-0 h-1/3 animate-cue rounded-full bg-lime" /></span>
        </motion.div>
      )}
    </section>
  );
}

/* ---------- Full-bleed band with parallax background ---------- */
export function Bleed({ img, children, className, align = "end", overlay }: { img: string; children: ReactNode; className?: string; align?: "end" | "center"; overlay?: string }) {
  return (
    <section className={cx("relative overflow-hidden bg-night text-white", className)}>
      <ParallaxImage src={img} speed={0.25} overlay={overlay ?? "linear-gradient(180deg, rgb(1 31 26 / .55), rgb(1 31 26 / .55) 50%, rgb(1 26 20 / .85))"} />
      <Container className={cx("relative flex min-h-[520px] flex-col gap-8 py-20 lg:min-h-[560px] lg:py-24", align === "center" ? "items-center justify-center text-center" : "justify-end")}>{children}</Container>
    </section>
  );
}
export function StatsBleed({ img, title, stats }: { img: string; title: string; stats: [string, string][] }) {
  return (
    <Bleed img={img}>
      <Reveal><h2 className={cx(T.h1, "max-w-[760px]")}>{title}</h2></Reveal>
      <Stagger className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{stats.map(([n, l]) => <GlassStat key={l} n={n} l={l} />)}</Stagger>
    </Bleed>
  );
}
export function CtaBleed({ img, title, sub, actions }: { img: string; title: string; sub?: string; actions: ReactNode }) {
  return (
    <Bleed img={img} align="center" overlay="radial-gradient(ellipse at center, rgb(1 31 26 / .55), rgb(1 26 20 / .85))">
      <SplitWords as="h2" text={title} className={cx(T.display, "max-w-[900px]")} delay={0} />
      {sub && <Reveal delay={0.2}><p className={cx(T.lead, "max-w-[620px] text-white/85")}>{sub}</p></Reveal>}
      <Reveal delay={0.3} className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">{actions}</Reveal>
    </Bleed>
  );
}

/* ---------- Image card with glass caption ---------- */
export function ImageCard({ img, title, sub, href, h = "h-[360px] lg:h-[480px]" }: { img: string; title: string; sub?: string; href?: string; h?: string }) {
  const inner = (
    <ClipReveal className={cx("group/ic relative flex flex-col justify-end overflow-hidden rounded-3xl", h)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover duration-[900ms] ease-[var(--ease-out)] group-hover/ic:scale-[1.07]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(1_31_26/.75))] transition-opacity duration-500 group-hover/ic:opacity-80" />
      <div className="glass-dark relative mt-auto m-4 flex w-[calc(100%-2rem)] items-end justify-between gap-3 rounded-2xl px-[18px] py-3.5 text-white transition-[translate,background-color,border-color] duration-500 ease-[var(--ease-out)] group-hover/ic:-translate-y-1.5 group-hover/ic:border-white/35 group-hover/ic:bg-[rgb(1_38_31/0.3)] md:m-5 md:w-[calc(100%-2.5rem)]">
        <div><div className="text-[18px] font-semibold leading-snug">{title}</div>{sub && <div className="text-[14px] text-white/80">{sub}</div>}</div>
        {href && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-[background-color,color,rotate] duration-500 ease-[var(--ease-out)] group-hover/ic:rotate-45 group-hover/ic:bg-lime group-hover/ic:text-night"><Icon name="arrow-up-right" size={18} /></span>}
      </div>
    </ClipReveal>
  );
  return href ? <Link href={href} className="block" data-cursor="view">{inner}</Link> : inner;
}

/* ---------- Colour tiles ----------
 * Item: [icon, title, description, href?, img?, fit?]
 * With an image, the picture sits in the top of the card (about 4:3, never tinted) and the tint stays on the body below.
 * fit "cover" (photos) fills the frame; fit "art" (flat illustrations) sits on a lighter well with padding.
 * Illustrations fill the frame like photos; pass "art" to inset one. */
const TILE_BG = ["bg-lime-soft", "bg-sun-soft", "bg-tomato-soft", "bg-mint", "bg-orange-soft", "bg-plum-soft"];
export type TileFit = "cover" | "art";
export type TileItem = [IconName, string, string, string?, string?, TileFit?];
export function Tiles({ items, cols = 4, dark }: { items: TileItem[]; cols?: 2 | 3 | 4; dark?: boolean }) {
  return (
    <Stagger className={cx("grid gap-3 md:grid-cols-2 md:gap-4", cols === 3 ? "lg:grid-cols-3" : cols === 4 ? "lg:grid-cols-4" : "")}>
      {items.map((it, n) => <Tile key={it[1]} item={it} n={n} dark={dark} />)}
    </Stagger>
  );
}
function Tile({ item, n, dark }: { item: TileItem; n: number; dark?: boolean }) {
  const [icon, t, d, href, img, fitIn] = item;
  const art = img ? (fitIn ?? "cover") === "art" : false;
  const tint = dark ? "bg-forest text-white" : TILE_BG[n % TILE_BG.length];
  const chip = cx(
    "flex shrink-0 items-center justify-center rounded-2xl transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/t:-translate-y-1 group-hover/t:-rotate-[8deg] group-hover/t:scale-110",
    dark ? "bg-lime text-night" : "bg-white text-deep",
  );
  const arrow = href && (
    <span aria-hidden className={cx(
      "absolute right-3 top-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full transition-[opacity,translate,rotate] duration-500 ease-[var(--ease-out)]",
      "translate-x-3 -translate-y-1 opacity-0 group-hover/t:translate-x-0 group-hover/t:translate-y-0 group-hover/t:rotate-45 group-hover/t:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
      img ? "bg-lime text-night shadow-[var(--shadow-1)]" : dark ? "bg-lime text-night" : "bg-white text-deep",
    )}><Icon name="arrow-up-right" size={18} /></span>
  );
  const card = cx(
    "vf-tile vf-spot group/t relative flex h-full flex-col overflow-hidden rounded-3xl transition-[translate,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1.5",
    dark ? "vf-spot-dark hover:shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)]" : "hover:shadow-[var(--shadow-3)]",
    tint, img ? "p-2" : "min-h-[240px] p-6 md:p-7",
  );
  const body = img ? (
    <div className={card} onPointerMove={spotlight}>
      <div className={cx("relative z-[1] aspect-[16/10] overflow-hidden rounded-[18px] md:aspect-[4/3]", art && (dark ? "bg-deep/60" : "bg-white/60"))}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" loading="lazy" className={cx("vf-tile-img absolute inset-0 h-full w-full", art ? "vf-art object-contain object-bottom px-5 pt-5 md:px-6 md:pt-6" : "object-cover")} />
        {arrow}
      </div>
      <div className="relative z-[1] flex flex-1 flex-col px-3.5 pb-4 pt-10 md:px-4 md:pb-5">
        <span className={cx(chip, "absolute -top-7 left-3.5 h-14 w-14 shadow-[0_8px_20px_-6px_rgb(1_38_31/0.3)] md:left-4")}><Icon name={icon} size={24} /></span>
        <div className={T.h4}>{t}</div>
        <div className={cx("mt-2", T.body, dark ? "text-white/75" : "text-muted")}>{d}</div>
      </div>
    </div>
  ) : (
    <div className={card} onPointerMove={spotlight}>
      {arrow}
      <span className={cx(chip, "relative z-[1] h-[52px] w-[52px]")}><Icon name={icon} size={24} /></span>
      <div className="relative z-[1] mt-auto pt-6 lg:pt-10"><div className={T.h4}>{t}</div><div className={cx("mt-2", T.body, dark ? "text-white/75" : "text-muted")}>{d}</div></div>
    </div>
  );
  return <div className="h-full">{href ? <Link href={href} className="block h-full" data-cursor={img ? "view" : undefined}>{body}</Link> : body}</div>;
}

/** Numbered steps. Phones and tablets: a grid. Large screens: sticky stacked cards that pile up as you scroll. */
export function StepsRow({ items, dark }: { items: [string, string, string][]; dark?: boolean }) {
  return (
    <>
      <Stagger className="grid gap-3 md:grid-cols-2 md:gap-4 lg:hidden">
        {items.map(([n, t, d]) => (
          <div key={t} className={cx("vf-spot group/sr relative flex h-full flex-col gap-3.5 overflow-hidden rounded-3xl p-6 transition-[translate] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 md:p-7", dark ? "vf-spot-dark bg-forest text-white" : "bg-white")} onPointerMove={spotlight}>
            <RollNumber value={n} className={cx("text-[36px] font-medium tracking-[-0.03em]", dark ? "text-lime" : "text-leaf")} />
            <div className={T.h5}>{t}</div><div className={cx(T.small, dark ? "text-white/75" : "text-muted")}>{d}</div>
          </div>
        ))}
      </Stagger>
      <StackCards className="hidden lg:block" top={120} step={18} space="10vh">
        {items.map(([n, t, d], i) => (
          <Tilt key={t} max={1.5}>
            <div className={cx("vf-spot group/sr relative grid min-h-[200px] grid-cols-[180px_1fr_auto] items-center gap-12 overflow-hidden rounded-3xl px-12 py-10 shadow-[0_-16px_40px_-12px_rgb(1_20_16/0.35)]", dark ? "vf-spot-dark bg-forest text-white" : "bg-white")} onPointerMove={spotlight}>
              <RollNumber value={n} className={cx("text-[88px] font-medium leading-none tracking-[-0.04em]", dark ? "text-lime" : "text-leaf")} />
              <div className="flex flex-col gap-2"><div className={T.h3}>{t}</div><div className={cx(T.lead, dark ? "text-white/75" : "text-muted")}>{d}</div></div>
              <span className={cx("text-[14px] font-semibold tabular", dark ? "text-white/50" : "text-muted")}>{i + 1} / {items.length}</span>
            </div>
          </Tilt>
        ))}
      </StackCards>
    </>
  );
}

/* ---------- FAQ accordion ---------- */
export function Faq({ qs, bg }: { qs: [string, string][]; bg?: string }) {
  const [open, setOpen] = useState(0);
  return (
    <Section bg={bg} className="flex flex-col gap-8 lg:flex-row lg:gap-24">
      <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
        <h2 className={cx(T.h2, "text-deep")}>Common questions</h2>
        <p className="text-muted">Still unsure? Call or WhatsApp our team.</p>
        <Link href={R.contact} className="group/cu inline-flex items-center gap-1.5 font-semibold text-deep"><span className="u-draw">Contact us</span> <Icon name="arrow-up-right" size={18} className="transition-transform duration-300 group-hover/cu:-translate-y-0.5 group-hover/cu:translate-x-0.5" /></Link>
      </div>
      <div className="flex-1 divide-y divide-line">
        {qs.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="group/fq flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={open === i}>
              <span className="text-[17px] font-semibold transition-[color,translate] duration-300 ease-[var(--ease-out)] group-hover/fq:translate-x-1 group-hover/fq:text-deep">{q}</span>
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25 }} className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color,scale] duration-300 group-hover/fq:scale-110", open === i ? "bg-deep text-white" : "bg-mist text-deep group-hover/fq:bg-lime group-hover/fq:text-night")}><Icon name="plus" size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                  <p className="max-w-[640px] pb-6 text-muted">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Product card ---------- */
export function ProductCard({ p, size = "L" }: { p: Product; size?: "L" | "S" }) {
  const { add } = useBag();
  const btn = useRef<HTMLButtonElement>(null);
  const farm = farmBySlug(p.farm);
  return (
    <div className="group/pc flex flex-col gap-3">
      <Link href={R.product(p.slug)} className="block" data-cursor="view">
        <Tilt max={4} className="relative aspect-[312/228] overflow-hidden rounded-[20px] transition-[box-shadow,translate] duration-500 ease-[var(--ease-out)] group-hover/pc:-translate-y-1 group-hover/pc:shadow-[var(--shadow-2)]">
          <div className="absolute inset-0" style={{ background: TINT[p.img] ?? "#F2F7F4" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImg(p)} alt={p.name} className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover/pc:scale-[1.07]" loading="lazy" />
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-deep backdrop-blur transition-transform duration-500 ease-[var(--ease-out)] group-hover/pc:-translate-y-0.5"><Icon name="leaf" size={13} className="text-leaf transition-transform duration-500 group-hover/pc:-rotate-12" />{p.fresh}</span>
          <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-deep transition-[color,scale] duration-300 hover:scale-110 hover:text-tomato"><Icon name="heart" size={16} /></span>
          {p.was && <span className="absolute bottom-2.5 left-2.5 rounded-full bg-tomato px-2.5 py-1 text-[12px] font-bold text-white">−15%</span>}
        </Tilt>
      </Link>
      <div className="flex flex-col gap-0.5">
        <Link href={R.farm(farm.slug)} className="truncate text-[13px] text-muted transition-colors hover:text-leaf"><span className="u-draw">{farm.name}</span></Link>
        <Link href={R.product(p.slug)} className={cx("truncate font-semibold text-ink transition-colors group-hover/pc:text-deep", size === "L" ? "text-[17px]" : "text-[15px]")}>{p.name}</Link>
      </div>
      <div className="flex items-center justify-between">
        <span className="tabular"><span className={cx("font-semibold", size === "L" ? "text-[17px]" : "text-[15px]")}>{cedi(p.price)}</span> <span className="text-[13px] text-muted">/ {p.unit}</span></span>
        <button ref={btn} onClick={() => add(p, btn.current)} aria-label={`Add ${p.name} to bag`} className="flex h-10 w-10 items-center justify-center rounded-full bg-deep text-white transition-[background-color,color,transform] duration-300 hover:rotate-90 hover:bg-lime hover:text-night active:scale-90">
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}
export function ProductGrid({ items, cols = 4 }: { items: Product[]; cols?: 3 | 4 }) {
  return (
    <Stagger className={cx("grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-9", cols === 4 && "lg:grid-cols-4")}>
      {items.map((p) => <ProductCard key={p.slug} p={p} />)}
    </Stagger>
  );
}

/* ---------- Category bar ---------- */
export function CategoryBar({ active = "all" }: { active?: string }) {
  return (
    <div className="sticky top-[68px] z-30 border-b border-line bg-white/90 backdrop-blur lg:top-[72px]">
      <Container className="no-scrollbar flex gap-2 overflow-x-auto py-3">
        {CATEGORIES.map((c) => {
          const on = c.slug === active;
          return (
            <Link key={c.slug} href={c.slug === "all" ? R.shop : c.slug === "packs" ? R.packs : R.category(c.slug)} className={cx("relative shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-[color,filter,translate,scale] duration-300 ease-[var(--ease-out)] active:scale-95", on ? "text-white" : cx(c.tint, "text-ink hover:-translate-y-0.5 hover:brightness-95"))}>
              {on && <motion.span layoutId="catbar" className="absolute inset-0 rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{c.label}</span>
            </Link>
          );
        })}
      </Container>
    </div>
  );
}

/* ---------- Promise band ---------- */
export function PromiseBand() {
  return (
    <section className="bg-night text-white">
      <Container className="grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
        {([["timer", "Picked within 72 hours", "Freshness shown on every product"], ["badge-check", "Every farm checked", "Officers visit before farms can sell"], ["qr-code", "Scan to trace", "Farm, checks and route on every order"], ["spray-can", "Safe spray records", "Last spray date logged per harvest"]] as const).map(([i, t, d], n) => (
          <Reveal key={t} delay={n * 0.06} className="group/pb flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-lime transition-[background-color,color,rotate,scale] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/pb:-rotate-[8deg] group-hover/pb:scale-110 group-hover/pb:bg-lime group-hover/pb:text-night"><Icon name={i} size={20} /></span>
            <div className="font-semibold">{t}</div><div className="text-[14px] text-white/70">{d}</div>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

/* ---------- Story card ---------- */
export function StoryCard({ s, h = "h-[240px] md:h-[300px]" }: { s: { slug: string; img: string; tag: string; title: string; meta: string }; h?: string }) {
  return (
    <Link href={R.story(s.slug)} className="group/s flex flex-col gap-3" data-cursor="view" data-cursor-label="Read">
      <MediaFrame className={cx("rounded-[20px] transition-[border-radius] duration-500 group-hover/s:rounded-[28px]", h)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.img} alt="" className="h-full w-full object-cover" loading="lazy" />
      </MediaFrame>
      <Chip className="w-fit bg-mist text-deep transition-colors group-hover/s:bg-lime group-hover/s:text-night">{s.tag}</Chip>
      <div className="text-[18px] font-semibold leading-snug transition-[color,translate] duration-500 ease-[var(--ease-out)] group-hover/s:-translate-y-0.5 group-hover/s:text-deep"><span className="u-draw">{s.title}</span></div>
      <div className="text-[13px] text-muted">{s.meta}</div>
    </Link>
  );
}

/* ---------- Page header band (non-hero pages) ---------- */
export function TopBand({ title, sub, eyebrow, crumbs, bg = "bg-mist", children }: { title: string; sub?: string; eyebrow?: string; crumbs?: [string, string?][]; bg?: string; children?: ReactNode }) {
  return (
    <section className={cx(bg, "pt-[68px] lg:pt-[72px]")}>
      <Container className="flex flex-col gap-4 py-10 md:py-14">
        {crumbs && <Crumbs items={crumbs} />}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <SplitWords text={title} className={cx(T.h1, "text-deep")} delay={0.05} />
        {sub && <Reveal delay={0.25}><p className={cx(T.lead, "max-w-[720px] text-muted")}>{sub}</p></Reveal>}
        {children && <Reveal delay={0.35}>{children}</Reveal>}
      </Container>
    </section>
  );
}

/* ---------- Number card ---------- */
export function NumCard({ n, l, bg = "bg-mist" }: { n: string; l: string; bg?: string }) {
  return (
    <Tilt max={5} className="h-full">
      <div onPointerMove={spotlight} className={cx("vf-spot group/nc relative flex h-full flex-col gap-2 overflow-hidden rounded-3xl p-5 transition-[translate,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-2)] md:p-7", bg)}>
        <RollNumber value={n} className="relative text-[36px] font-medium leading-none tracking-[-0.03em] text-deep md:text-[56px]" />
        <span className="relative text-muted transition-colors duration-300 group-hover/nc:text-ink">{l}</span>
      </div>
    </Tilt>
  );
}

/* ---------- Newsletter band ---------- */
export function NewsBand({ title, sub }: { title: string; sub: string }) {
  const toast = useToast();
  return (
    <Section bg="bg-deep" className="flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
      <Reveal className="flex flex-col gap-2"><h2 className={T.h2}>{title}</h2><p className="text-[18px] text-white/75">{sub}</p></Reveal>
      <Reveal delay={0.1} className="w-full lg:w-[520px]">
        <form onSubmit={(e) => { e.preventDefault(); toast("You are on the list. First story arrives Friday."); e.currentTarget.reset(); }} className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5"><input type="email" required placeholder="Your email address" aria-label="Email" className="min-w-0 flex-1 text-[16px] text-ink outline-none placeholder:text-muted" /><Button size="M" type="submit">Subscribe</Button></form>
      </Reveal>
    </Section>
  );
}

export { Head, Section, Container, Eyebrow };
