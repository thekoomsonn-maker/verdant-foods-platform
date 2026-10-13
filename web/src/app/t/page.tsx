import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { Section, Tiles } from "@/components/site/sections";
import { ParallaxImage, Reveal, SplitWords } from "@/components/motion";
import { Checks, Eyebrow, GlassChip } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { CodeForm } from "@/components/trace/actions";
import { QrGlyph, Viewfinder } from "@/components/trace/qr";
import { JOURNEY } from "@/lib/data";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Trace your food", description: "Enter or scan the code on your bag to see the farm, the checks and the route behind your food." };

export default function TraceSearch() {
  return (
    <PublicPage nav="overlay">
      <section className="relative flex min-h-[560px] overflow-hidden bg-night text-white h-[72svh] max-h-[720px]">
        <ParallaxImage src="/img/qr-scan-crate.jpg" speed={0.2} priority overlay="linear-gradient(180deg, rgb(1 31 26 / .55) 0%, rgb(1 31 26 / .2) 40%, rgb(1 26 20 / .88) 100%)" />
        <div className="relative mx-auto mt-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pb-10 pt-32 md:px-8 md:pb-14 lg:px-16 lg:pb-16">
          <Reveal delay={0.05}><GlassChip icon="qr-code">Trace your food</GlassChip></Reveal>
          <SplitWords text="Where did your food come from?" className={cx(T.display, "max-w-[820px]")} />
          <Reveal delay={0.4} className="flex flex-col">
            <CodeForm withScan />
          </Reveal>
        </div>
      </section>

      <Section className="grid items-center gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-16">
        <Reveal className="flex items-center gap-5 rounded-[28px] bg-lime-soft p-5 md:p-6">
          <Viewfinder className="flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-2xl bg-white p-3" corner="border-leaf">
            <QrGlyph size={72} className="text-night" />
          </Viewfinder>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-leaf">Verdant · Vine tomatoes</div>
            <div className="mt-1 text-[24px] font-semibold tracking-[0.01em] text-night md:text-[28px]">{JOURNEY.code}</div>
            <div className="mt-1 text-[14px] text-muted">Picked 12 Oct · 2 kg</div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-5">
          <Eyebrow>Find your code</Eyebrow>
          <h2 className={cx(T.h2, "text-deep")}>On the label of every bag and crate</h2>
          <Checks items={["Scan the square with your phone camera", "Or type the code under it", "Business buyers: find it on your delivery note"]} />
          <Link href={R.trace()} className="inline-flex w-fit items-center gap-1.5 text-[15px] font-semibold text-deep">Try the sample code <Icon name="arrow-up-right" size={18} /></Link>
        </Reveal>
      </Section>

      <Section bg="bg-deep" className="flex flex-col gap-10 text-white">
        <Reveal><h2 className={T.h2}>What you will see</h2></Reveal>
        <Tiles dark items={[
          ["sprout", "The farmer", "Name, farm and photo.", R.traceFarm(), "/img/elder-woman-farmer.jpg"],
          ["map", "The plot", "Mapped by GPS.", R.traceFarm(), "/img/eastern-farm-aerial.jpg"],
          ["spray-can", "Spray record", "And the safe gap.", R.traceSpray(), "/img/farm-store.jpg"],
          ["waypoints", "Every handover", "With weights at each step.", R.trace(), "/img/weighing-collection.jpg"],
        ]} />
      </Section>
    </PublicPage>
  );
}
