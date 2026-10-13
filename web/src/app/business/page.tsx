import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { CtaBleed, PageHero, Tiles } from "@/components/site/sections";
import { Button, Container, Section } from "@/components/ui";
import { Reveal, Stagger } from "@/components/motion";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { HeroCard, Steps, Title } from "@/components/corporate/blocks";
import { SpendPreview, SplitIn } from "@/components/corporate/client";
import { cedi, productBySlug, productImg, TINT } from "@/lib/data";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "For business", description: "Restaurants, hotels, caterers and shops buy straight from verified Ghanaian farms, with bids, repeat deliveries and invoices." };

const STOCK: [string, string, number][] = [["vine-tomatoes", "2,200 kg", 9.5], ["red-onions", "2,400 kg", 7.8], ["scotch-bonnet", "410 kg", 21]];

export default function Business() {
  return (
    <PublicPage>
      <PageHero img="/img/hotel-kitchen.jpg" eyebrow="For business buyers" title="Fresh produce for your kitchen, at farm prices."
        sub="Restaurants, hotels, caterers and shops buy straight from verified Ghanaian farms."
        actions={<><Button href={R.b2bJoin} variant="lime" arrow>Open a business account</Button><Button href={R.contact} variant="glass">Talk to our team</Button></>}
        side={
          <HeroCard className="p-4">
            <div className="flex items-center justify-between px-1"><span className="text-[13px] font-semibold text-lime">Available now</span><span className="inline-flex items-center gap-1.5 text-[12px] text-white/70"><span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />Live stock</span></div>
            <div className="mt-2 flex flex-col">
              {STOCK.map(([slug, kg, price]) => {
                const p = productBySlug(slug);
                return (
                  <Link key={slug} href={R.product(slug)} className="flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productImg(p)} alt="" className="h-10 w-10 rounded-lg object-cover mix-blend-multiply" style={{ background: TINT[p.img] }} />
                    <span className="flex-1"><span className="block text-[14px] font-semibold">{p.name}</span><span className="block text-[12px] text-white/65">{kg}</span></span>
                    <span className="text-[14px] font-semibold text-lime tabular">{cedi(price)}/kg</span>
                  </Link>
                );
              })}
            </div>
          </HeroCard>
        } />

      <section className="bg-paper">
        <Container className="no-scrollbar flex items-center gap-3 overflow-x-auto py-6">
          <span className="shrink-0 text-[15px] text-muted">Trusted by kitchens across Ghana</span>
          <Stagger className="flex gap-3" gap={0.05} y={8}>
            {([["store", "Restaurants"], ["building-2", "Hotels"], ["shopping-basket", "Supermarkets"], ["briefcase", "Caterers"], ["house", "Schools and hospitals"]] as const).map(([i, l]) => (
              <span key={l} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[14px] font-medium text-deep"><Icon name={i} size={16} />{l}</span>
            ))}
          </Stagger>
        </Container>
      </section>

      <Section className="flex flex-col gap-10">
        <Title text="Everything your buying team needs" sub="One account for ordering, bidding, deliveries and payment." />
        <Tiles items={[
          ["layout-grid", "Live farm stock", "See what each farm has ready this week.", R.b2bSource],
          ["gavel", "Bids for large volumes", "Name your price; farmers reply within 48 hours.", R.b2bBids],
          ["repeat", "Repeat deliveries", "Set a weekly order and get it the same day each week.", R.b2bAgreements],
          ["receipt", "Invoices and credit terms", "Pay by invoice, bank transfer, card or MoMo.", R.b2bInvoices],
        ]} />
      </Section>

      <section className="bg-deep text-white">
        <Container className="grid gap-10 py-[72px] md:py-24 lg:grid-cols-[400px_1fr] lg:items-center lg:gap-16 lg:py-[120px]">
          <div className="flex flex-col gap-5">
            <Reveal><span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime"><span className="h-1.5 w-1.5 rounded-full bg-lime" />Your buyer account</span></Reveal>
            <SplitIn text="Buy from the farm, not the market" className={T.h2} />
            <Reveal delay={0.1}><p className="text-[17px] text-white/75">Filter by region, harvest date or farm, then buy now or make a bid.</p></Reveal>
            <Reveal delay={0.2}><Button href={R.b2bSource} variant="lime" size="M" arrow>See live stock</Button></Reveal>
          </div>
          <Reveal delay={0.1} y={28}><SpendPreview /></Reveal>
        </Container>
      </section>

      <Section className="flex flex-col gap-10">
        <Title text="Up and running in a day" />
        <Steps items={[
          ["01", "Open an account", "Tell us about your business and where you need deliveries."],
          ["02", "Get verified", "We confirm your business details, usually within one working day."],
          ["03", "Order or bid", "Buy what is in stock, make a bid, or set up repeat deliveries."],
        ]} />
      </Section>

      <section className="bg-sun-soft py-20 md:py-28">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Reveal><p className={cx("max-w-[960px] text-[24px] font-medium leading-snug tracking-[-0.02em] text-deep md:text-[34px]")}>“Our weekly order arrives the same morning every week, and the invoice matches what we ordered. That is rare.”</p></Reveal>
          <Reveal delay={0.15} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hotel-kitchen.jpg" alt="" className="h-[52px] w-[52px] rounded-full object-cover" />
            <div className="text-left"><div className="font-semibold">Efua Mensah</div><div className="text-[14px] text-muted">Purchasing manager, hotel group in Accra</div></div>
          </Reveal>
        </Container>
      </section>

      <CtaBleed img="/img/packhouse.jpg" title="Start buying from Ghanaian farms"
        actions={<><Button href={R.b2bJoin} variant="lime" arrow>Open a business account</Button><Button href={R.contact} variant="glass">Talk to our team</Button></>} />
    </PublicPage>
  );
}
