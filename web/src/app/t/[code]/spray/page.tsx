import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { TopBand } from "@/components/site/sections";
import { ClipReveal, Reveal, Stagger } from "@/components/motion";
import { Checks, Container, Section } from "@/components/ui";
import { Icon } from "@/components/icon";
import { cx } from "@/components/tokens";
import { CodeNotFound } from "@/components/trace/code-not-found";
import { getTrace, normaliseCode, SPRAY_CHECKS } from "@/lib/data-trace";
import { R } from "@/lib/routes";
import { SafeGap } from "./spray-client";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: getTrace(code) ? "Spray and fertiliser record" : "Code not found" };
}

const TYPE_TONE: Record<string, string> = { Organic: "bg-lime-soft text-deep", Fertiliser: "bg-sun-soft text-warning", "Approved spray": "bg-info-bg text-info", Water: "bg-mist text-muted" };

export default async function SprayRecord({ params }: Props) {
  const { code } = await params;
  const t = getTrace(code);
  if (!t) return <CodeNotFound code={normaliseCode(code)} />;
  return (
    <PublicPage nav="light">
      <TopBand title="Spray and fertiliser record" sub="Everything used on the plot that grew your tomatoes." crumbs={[["Your food", R.trace(t.code)], ["Spray record"]]}>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="qr-code" size={15} />{t.code}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-deep"><Icon name="map-pin" size={15} />Plot A · Nyankpala</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-3 py-1.5 text-[13px] font-medium text-info"><Icon name="user-check" size={15} />Checked by officer</span>
        </div>
      </TopBand>

      <section className="py-12 md:py-20"><Container><Reveal><SafeGap /></Reveal></Container></section>

      <Section bg="bg-paper" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <Reveal className="self-start overflow-hidden rounded-[20px] bg-white p-4 md:p-5">
          <h2 className="px-1 pb-3 text-[18px] font-semibold">This season on Plot A</h2>
          <div className="hidden grid-cols-[90px_1fr_140px_90px] gap-3 rounded-xl bg-paper px-3 py-2.5 text-[13px] text-muted md:grid"><span>Date</span><span>What was used</span><span>Type</span><span>Safe gap</span></div>
          <Stagger gap={0.05} y={8}>
            {t.sprays.map((s) => (
              <div key={s.date} className="grid grid-cols-[64px_1fr_auto] items-center gap-x-3 gap-y-1 border-b border-line px-3 py-3.5 text-[14px] last:border-0 md:grid-cols-[90px_1fr_140px_90px]">
                <span className="font-semibold tabular">{s.date}</span>
                <span>{s.input}</span>
                <span className="hidden md:block"><span className={cx("rounded-full px-2.5 py-1 text-[12px] font-medium", TYPE_TONE[s.type])}>{s.type}</span></span>
                <span className="text-right tabular text-muted md:text-left md:text-ink">{s.gap}</span>
                <span className="col-start-2 md:hidden"><span className={cx("rounded-full px-2.5 py-1 text-[12px] font-medium", TYPE_TONE[s.type])}>{s.type}</span></span>
              </div>
            ))}
          </Stagger>
        </Reveal>
        <div className="flex flex-col gap-4">
          <ClipReveal className="relative flex h-[260px] overflow-hidden rounded-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/officer-tablet.jpg" alt="Officer Yaw checking the farm store" className="absolute inset-0 h-full w-full object-cover" />
            <div className="glass-dark relative m-3 mt-auto w-[calc(100%-1.5rem)] rounded-2xl px-4 py-3.5 text-white">
              <div className="text-[17px] font-semibold">Checked 6 Oct</div>
              <div className="text-[14px] text-white/80">Officer Yaw compared this record with the farm store.</div>
            </div>
          </ClipReveal>
          <Reveal delay={0.1} className="rounded-[20px] bg-white p-5">
            <h3 className="mb-4 text-[17px] font-semibold">What we check</h3>
            <Checks items={SPRAY_CHECKS} />
          </Reveal>
        </div>
      </Section>
    </PublicPage>
  );
}
