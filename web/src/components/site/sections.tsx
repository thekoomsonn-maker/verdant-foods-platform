"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { CATEGORIES, farmBySlug, productImg, TINT, cedi, type Product } from "@/lib/data";
import { R } from "@/lib/routes";
import { Icon, type IconName } from "../icon";
import { ClipReveal, CountUp, ParallaxImage, Reveal, SplitWords, Stagger, Tilt, EASE } from "../motion";
import { Button, Chip, Container, Crumbs, cx, Eyebrow, GlassChip, GlassStat, Head, Section, T } from "../ui";
import { useBag } from "./bag";
import { useToast } from "../toast";

const SHADE = "linear-gradient(180deg, rgb(1 31 26 / .5) 0%, rgb(1 31 26 / .1) 35%, rgb(1 26 20 / .88) 100%)";

/* ---------- Full-bleed hero (image or video), parallax + scale-in ---------- */
export function PageHero({ img, video, title, sub, eyebrow, actions, side, height = "tall", children, crumbs }: {
  img: string; video?: string; title: string; sub?: string; eyebrow?: ReactNode; actions?: ReactNode; side?: ReactNode; height?: "tall" | "mid" | "short"; children?: ReactNode; crumbs?: [string, string?][];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "15%"]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.45]);
  const h = height === "tall" ? "min-h-[720px] h-[100svh] max-h-[960px]" : height === "mid" ? "min-h-[600px] h-[78svh] max-h-[760px]" : "min-h-[480px] h-[60svh] max-h-[580px]";
  return (
    <section ref={ref} className={cx("relative flex overflow-hidden bg-night text-white", h)}>
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.div className="absolute inset-0" initial={{ scale: reduce ? 1 : 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
          {video ? (
            <video className="h-full w-full object-cover" src={video} poster={img} autoPlay muted loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" style={{ background: SHADE }} />
      <motion.div className="absolute inset-0 bg-night" style={{ opacity: dim }} />
      <Container className="relative mt-auto flex flex-col gap-8 pb-10 pt-32 md:pb-14 lg:flex-row lg:items-end lg:justify-between lg:pb-[72px]">
        <div className="flex max-w-[860px] flex-col gap-5 md:gap-6">
          {crumbs && <Crumbs items={crumbs} light />}
          {eyebrow && <Reveal delay={0.05}>{typeof eyebrow === "string" ? <GlassChip dot>{eyebrow}</GlassChip> : eyebrow}</Reveal>}
          <SplitWords text={title} className={T.hero} />
          {sub && <Reveal delay={0.45}><p className={cx(T.lead, "max-w-[640px] text-white/85")}>{sub}</p></Reveal>}
          {actions && <Reveal delay={0.6} className="flex flex-col gap-3 sm:flex-row">{actions}</Reveal>}
          {children}
        </div>
        {side && <Reveal delay={0.7} className="lg:w-[380px] lg:shrink-0">{side}</Reveal>}
      </Container>
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
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/ic:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(1_31_26/.75))]" />
      <div className="glass-dark relative mt-auto m-4 flex w-[calc(100%-2rem)] items-end justify-between gap-3 rounded-2xl px-[18px] py-3.5 text-white transition-transform duration-300 group-hover/ic:-translate-y-1 md:m-5 md:w-[calc(100%-2.5rem)]">
        <div><div className="text-[18px] font-semibold leading-snug">{title}</div>{sub && <div className="text-[14px] text-white/80">{sub}</div>}</div>
        {href && <Icon name="arrow-up-right" size={20} className="shrink-0 transition-transform group-hover/ic:-translate-y-0.5 group-hover/ic:translate-x-0.5" />}
      </div>
    </ClipReveal>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

/* ---------- Colour tiles ---------- */
const TILE_BG = ["bg-lime-soft", "bg-sun-soft", "bg-tomato-soft", "bg-mint", "bg-orange-soft", "bg-plum-soft"];
export function Tiles({ items, cols = 4, dark }: { items: [IconName, string, string, string?][]; cols?: 2 | 3 | 4; dark?: boolean }) {
  return (
    <Stagger className={cx("grid gap-3 md:grid-cols-2 md:gap-4", cols === 3 ? "lg:grid-cols-3" : cols === 4 ? "lg:grid-cols-4" : "")}>
      {items.map(([i, t, d, href], n) => {
        const body = (
          <div className={cx("group/t flex h-full flex-col gap-4 rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7", dark ? "bg-forest text-white" : TILE_BG[n % TILE_BG.length])}>
            <span className={cx("flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-transform duration-300 group-hover/t:rotate-[-6deg]", dark ? "bg-lime text-night" : "bg-white text-deep")}><Icon name={i} size={24} /></span>
            <div className="mt-auto pt-6 lg:pt-10"><div className={T.h4}>{t}</div><div className={cx("mt-2", T.body, dark ? "text-white/75" : "text-muted")}>{d}</div></div>
          </div>
        );
        return <div key={t} className="h-full">{href ? <Link href={href} className="block h-full">{body}</Link> : body}</div>;
      })}
    </Stagger>
  );
}
export function StepsRow({ items, dark }: { items: [string, string, string][]; dark?: boolean }) {
  return (
    <Stagger className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {items.map(([n, t, d], i) => (
        <div key={t} className={cx("flex h-full flex-col gap-3.5 rounded-3xl p-6 md:p-7", dark ? "bg-forest text-white" : "bg-white")}>
          <div className="flex items-center justify-between"><span className={cx("text-[36px] font-medium tracking-[-0.03em]", dark ? "text-lime" : "text-leaf")}>{n}</span>{i < items.length - 1 && <Icon name="arrow-right" className={cx("hidden lg:block", dark ? "text-white/60" : "text-muted")} />}</div>
          <div className={T.h5}>{t}</div><div className={cx(T.small, dark ? "text-white/75" : "text-muted")}>{d}</div>
        </div>
      ))}
    </Stagger>
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
        <Link href={R.contact} className="inline-flex items-center gap-1.5 font-semibold text-deep">Contact us <Icon name="arrow-up-right" size={18} /></Link>
      </div>
      <div className="flex-1 divide-y divide-line">
        {qs.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left" aria-expanded={open === i}>
              <span className="text-[17px] font-semibold">{q}</span>
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-deep"><Icon name="plus" size={18} /></motion.span>
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
      <Link href={R.product(p.slug)} className="block">
        <Tilt className="relative aspect-[312/228] overflow-hidden rounded-[20px] transition-shadow duration-300 group-hover/pc:shadow-[var(--shadow-2)]">
          <div className="absolute inset-0" style={{ background: TINT[p.img] ?? "#F2F7F4" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImg(p)} alt={p.name} className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/pc:scale-[1.04]" loading="lazy" />
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-deep backdrop-blur"><Icon name="leaf" size={13} className="text-leaf" />{p.fresh}</span>
          <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-deep transition-colors hover:text-tomato"><Icon name="heart" size={16} /></span>
          {p.was && <span className="absolute bottom-2.5 left-2.5 rounded-full bg-tomato px-2.5 py-1 text-[12px] font-bold text-white">−15%</span>}
        </Tilt>
      </Link>
      <div className="flex flex-col gap-0.5">
        <Link href={R.farm(farm.slug)} className="truncate text-[13px] text-muted hover:text-leaf">{farm.name}</Link>
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
            <Link key={c.slug} href={c.slug === "all" ? R.shop : c.slug === "packs" ? R.packs : R.category(c.slug)} className={cx("relative shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors", on ? "text-white" : cx(c.tint, "text-ink hover:brightness-95"))}>
              {on && <motion.span layoutId="catbar" className="absolute inset-0 rounded-full bg-deep" />}
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
          <Reveal key={t} delay={n * 0.06} className="flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-lime"><Icon name={i} size={20} /></span>
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
    <Link href={R.story(s.slug)} className="group/s flex flex-col gap-3">
      <div className={cx("overflow-hidden rounded-[20px]", h)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.img} alt="" className="h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/s:scale-105" loading="lazy" />
      </div>
      <Chip className="w-fit bg-mist text-deep">{s.tag}</Chip>
      <div className="text-[18px] font-semibold leading-snug transition-colors group-hover/s:text-deep">{s.title}</div>
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
    <div className={cx("flex h-full flex-col gap-2 rounded-3xl p-5 md:p-7", bg)}>
      <CountUp value={n} className="text-[36px] font-medium leading-none tracking-[-0.03em] text-deep md:text-[56px]" />
      <span className="text-muted">{l}</span>
    </div>
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
