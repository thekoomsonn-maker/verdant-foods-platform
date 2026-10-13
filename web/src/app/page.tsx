import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, ImageCard, PageHero, ProductGrid, PromiseBand } from "@/components/site/sections";
import { HomeLiveCard, HomeTrace, HomeFreshTabs } from "./home-client";
import { Button, Container, Eyebrow, Head, Section } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { ClipReveal, CountUp, Reveal, Stagger } from "@/components/motion";
import { Icon } from "@/components/icon";
import { CATEGORIES, PRODUCTS, productImg, TINT } from "@/lib/data";
import { R } from "@/lib/routes";

export default function Home() {
  return (
    <PublicPage>
      <PageHero
        img="/video/home-poster.jpg"
        video="/video/home"
        eyebrow="Live · 38 farms harvesting today"
        title="Fresh from the farm. Traced to your table."
        sub="Vegetables and fruit from smallholder farmers in Northern Ghana."
        actions={<><Button href={R.shop} variant="light" arrow>Shop fresh produce</Button><Button href={R.business} variant="glass">Buy for your business</Button></>}
        side={<HomeLiveCard />}
      />

      <Section className="flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="flex max-w-[820px] flex-col gap-5"><Eyebrow>Why Verdant</Eyebrow><h2 className={cx(T.h2, "text-ink")}>We connect smallholder farmers to the homes and kitchens that cook their food.</h2></Reveal>
          <Reveal delay={0.1}><Link href={R.about} className="inline-flex items-center gap-1.5 font-semibold text-deep">About Verdant <Icon name="arrow-up-right" size={18} /></Link></Reveal>
        </div>
        <Stagger className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[["500+", "farmers selling"], ["20", "savings groups"], ["48 h", "harvest to door"], ["100%", "orders traced"]].map(([n, l], i) => (
            <div key={l} className="flex flex-col gap-3 border-t-2 pt-5" style={{ borderColor: i === 0 ? "#5F9F0D" : "#E2E8E4" }}>
              <CountUp value={n} className="text-[44px] font-medium leading-none tracking-[-0.03em] text-deep md:text-[56px]" />
              <span className="text-muted">{l}</span>
            </div>
          ))}
        </Stagger>
      </Section>

      <Section bg="bg-paper" className="flex flex-col gap-10">
        <Head title="One platform, from field to fork" sub="Shop, buy in bulk, sell your harvest or save as a group." />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <ImageCard img="/img/family-unbox.jpg" title="Marketplace" sub="Fresh produce delivered to your door" href={R.shop} h="h-[380px] lg:h-[620px]" />
          <div className="grid gap-4">
            <Link href={R.traceInfo} className="group/tc relative flex h-[300px] flex-col justify-end overflow-hidden rounded-3xl bg-deep p-5 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/aerial-plots.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover/tc:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(1_38_31/.9))]" />
              <span className="glass-dark absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"><span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />Live supply map</span>
              <div className="relative flex items-end justify-between"><div><div className="text-[20px] font-semibold">Trace every crate</div><div className="text-[14px] text-white/75">Farm, harvest, checks and route on every order</div></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-night transition-transform group-hover/tc:rotate-45"><Icon name="arrow-up-right" size={18} /></span></div>
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <ImageCard img="/img/chef-kitchen.jpg" title="For business" sub="Bids and repeat orders" href={R.business} h="h-[300px]" />
              <Link href={R.farmers} className="group/vs flex h-[300px] flex-col justify-between rounded-3xl bg-lime p-5 transition-transform hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-deep transition-transform group-hover/vs:rotate-[-8deg]"><Icon name="piggy-bank" /></span>
                <div><CountUp value="1,400" className="text-[40px] font-medium leading-none tracking-[-0.03em] text-night" /><div className="mt-2 text-[14px] text-night/75">savings group members keep their records on Verdant</div></div>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section className="flex flex-col gap-10">
        <div className="flex items-end justify-between"><Reveal><h2 className={cx(T.h3, "text-ink")}>Shop by category</h2></Reveal><Link href={R.shop} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-deep">All produce <Icon name="arrow-up-right" size={18} /></Link></div>
        <Stagger className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-6">
          {CATEGORIES.filter((c) => c.slug !== "all" && c.slug !== "grains").map((c) => {
            const p = PRODUCTS.find((x) => x.cat === c.slug)!;
            return (
              <Link key={c.slug} href={c.slug === "packs" ? R.packs : R.category(c.slug)} className={cx("group/cat relative flex h-[220px] w-[180px] shrink-0 flex-col overflow-hidden rounded-3xl md:w-auto", c.tint)}>
                <div className="relative z-10 flex items-start justify-between p-4"><div><div className="font-semibold">{c.label}</div><div className="text-[13px] text-muted">{PRODUCTS.filter((x) => x.cat === c.slug).length * 7 + 4} items</div></div><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform group-hover/cat:rotate-45"><Icon name="arrow-up-right" size={16} className={c.accent} /></span></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImg(p)} alt="" className="mt-auto h-[130px] w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/cat:scale-110" style={{ background: TINT[p.img] }} />
              </Link>
            );
          })}
        </Stagger>
        <HomeFreshTabs />
        <ProductGrid items={PRODUCTS.slice(0, 8)} />
        <div className="flex justify-center"><Button href={R.shop} variant="secondary" size="M" arrow>See all produce</Button></div>
      </Section>

      <HomeTrace />

      <Section className="flex flex-col gap-10">
        <Head title="From the farm to your door in four steps" sub="Logged, checked, packed and delivered within 48 hours." />
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[["/img/hands-tomato.jpg", "01", "Grown", "Farmers log each harvest, even offline."], ["/img/officer-tablet.jpg", "02", "Checked", "Field officers visit and verify every farm."], ["/img/packhouse.jpg", "03", "Packed", "Sorted and packed in Tamale with a QR code."], ["/img/delivery.jpg", "04", "Delivered", "At your door with the farm on the label."]].map(([img, n, t, d]) => (
            <div key={t} className="group/st flex flex-col gap-4">
              <ClipReveal className="relative h-[220px] overflow-hidden rounded-3xl md:h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover/st:scale-105" />
                <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[13px] font-semibold text-white">{n}</span>
              </ClipReveal>
              <div><div className="text-[18px] font-semibold">{t}</div><div className="mt-1 text-[14px] text-muted">{d}</div></div>
            </div>
          ))}
        </Stagger>
        <div className="grid gap-4 lg:grid-cols-2">
          {[["/img/hotel-kitchen.jpg", "For business", "Reliable supply for kitchens and shops", "Farm prices, bids and weekly deliveries with trace reports.", "Open a business account", R.b2bJoin], ["/img/vsla-meeting.jpg", "For farmers", "Fair prices. Stronger savings groups.", "Sell without middlemen, get paid to mobile money, save as a group.", "Sell with Verdant", R.farmers]].map(([img, e, t, d, b, h]) => (
            <ClipReveal key={t} className="group/bf relative flex flex-col justify-end h-[440px] overflow-hidden rounded-3xl text-white md:h-[520px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/bf:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(1_31_26/.85))]" />
              <div className="glass-dark relative m-4 mt-auto flex w-[calc(100%-2rem)] flex-col gap-2 rounded-2xl p-4 md:m-6 md:w-[calc(100%-3rem)] md:gap-3 md:p-6">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-lime md:text-[13px]">{e}</span>
                <div className="text-[19px] font-semibold leading-tight md:text-[26px]">{t}</div>
                <p className="hidden text-[15px] text-white/80 md:block">{d}</p>
                <div><Button href={h} variant="lime" size="M" arrow>{b}</Button></div>
              </div>
            </ClipReveal>
          ))}
        </div>
      </Section>

      <section className="bg-paper py-20 md:py-28">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Reveal><p className="max-w-[920px] text-[24px] font-medium leading-snug tracking-[-0.02em] text-deep md:text-[34px]">“We know which farm our tomatoes came from, and they reach our kitchen the day after harvest.”</p></Reveal>
          <Reveal delay={0.15} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/chef-kitchen.jpg" alt="" className="h-12 w-12 rounded-full object-cover" />
            <div className="text-left"><div className="font-semibold">Kwabena Asare</div><div className="text-[14px] text-muted">Head chef, Accra</div></div>
          </Reveal>
        </Container>
      </section>

      <PromiseBand />
      <CtaBleed img="/img/packhouse.jpg" title="Fresh food you can trace." actions={<><Button href={R.shop} variant="lime" arrow>Shop fresh produce</Button><Button href={R.contact} variant="glass">Talk to our team</Button></>} />
    </PublicPage>
  );
}
