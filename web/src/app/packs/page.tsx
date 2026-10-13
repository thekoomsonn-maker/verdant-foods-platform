import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { CategoryBar, Container, Section } from "@/components/site/sections";
import { Reveal, SplitWords, Stagger } from "@/components/motion";
import { Head } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { PackGrid, PackHeroButton, SubscribePanel } from "./packs-client";

export const metadata: Metadata = { title: "Stock-up packs", description: "Ready packs of fresh produce, packed the day you order from farms you can trace." };

export default function PacksPage() {
  return (
    <PublicPage nav="light">
      <div className="pt-[68px] lg:pt-[72px]">
        <CategoryBar active="packs" />
        <Container className="pt-6 md:pt-8">
          <section className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-orange p-6 text-white md:flex-row md:items-center md:justify-between md:p-12 lg:px-14">
            <div className="flex max-w-[680px] flex-col gap-5">
              <Reveal><span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80">Stock-up packs</span></Reveal>
              <SplitWords text="A week of fresh food. One box." className={T.display} delay={0.1} />
              <Reveal delay={0.3}><p className="text-[16px] text-white/85">Packed the day you order, from farms you can trace. Pause or skip any week.</p></Reveal>
              <Reveal delay={0.4}><PackHeroButton /></Reveal>
            </div>
            <Reveal delay={0.2} className="relative mx-auto shrink-0 md:mx-0">
              <span className="block h-[220px] w-[220px] overflow-hidden rounded-full bg-[#EDE3D6] ring-[12px] ring-white/25 md:h-[300px] md:w-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/products/box.jpg" alt="" className="h-full w-full object-cover mix-blend-multiply" />
              </span>
              <span className="absolute -left-2 top-2 flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-lime text-night md:h-[88px] md:w-[88px]">
                <span className="text-[22px] font-semibold leading-none">180</span><span className="text-[11px]">from GH₵</span>
              </span>
            </Reveal>
          </section>
        </Container>
      </div>

      <Section className="flex flex-col gap-10" id="packs">
        <Head title="Choose your pack" sub="Every pack lists the farms inside it before you pay." />
        <PackGrid />
      </Section>

      <SubscribePanel />

      <Section className="flex flex-col gap-10">
        <Reveal><h2 className={cx(T.h2, "text-deep")}>How packs work</h2></Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {[["01", "Pick a pack", "Choose a ready pack or build your own.", "bg-lime-soft"], ["02", "We pack on the day", "Harvested, weighed and packed the morning of delivery.", "bg-sun-soft"], ["03", "Scan to see the farms", "Each pack carries one code for every farm inside.", "bg-tomato-soft"]].map(([n, t, d, bg]) => (
            <div key={n} className={cx("flex h-full flex-col gap-3 rounded-3xl p-6 md:p-8", bg)}>
              <span className="text-[44px] font-medium leading-none tracking-[-0.03em] text-deep">{n}</span>
              <span className="mt-4 text-[19px] font-semibold">{t}</span>
              <span className="text-muted">{d}</span>
            </div>
          ))}
        </Stagger>
      </Section>
    </PublicPage>
  );
}
