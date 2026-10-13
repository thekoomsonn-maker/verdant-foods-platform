"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spark } from "@/components/charts";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { CountUp, ParallaxImage, Reveal, SplitWords } from "@/components/motion";
import { Container, cx, GlassChip, Pills, T } from "@/components/ui";
import { JOURNEY, plotAround } from "@/lib/data";
import { R } from "@/lib/routes";

export function HomeLiveCard() {
  return (
    <div className="glass-dark rounded-3xl p-5 text-white">
      <div className="flex items-center justify-between"><span className="text-[14px] font-semibold">Today on Verdant</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[12px]"><span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />Live</span></div>
      <div className="mt-3 h-10"><Spark values={[3, 4, 3.6, 5, 4.6, 6, 6.4, 7.2]} color="#BBEA70" w={340} h={40} /></div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[["146", "orders out"], ["7", "farms ready"], ["31 h", "avg. freshness"]].map(([n, l]) => <div key={l}><CountUp value={n} className="text-[22px] font-semibold" /><div className="text-[12px] text-white/70">{l}</div></div>)}
      </div>
    </div>
  );
}

export function HomeFreshTabs() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <Reveal><h2 className={cx(T.h3, "text-ink")}>Fresh this week</h2><p className="mt-1 text-muted">Picked in the last three days</p></Reveal>
      <Pills items={["All", "Vegetables", "Fruits", "Leafy greens"]} size="S" />
    </div>
  );
}

export function HomeTrace() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [step, setStep] = useState(0);
  const s = JOURNEY.steps;
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <ParallaxImage src="/img/aerial-plots.jpg" speed={0.25} overlay="linear-gradient(90deg, rgb(1 31 26 / .85), rgb(1 31 26 / .45))" />
      <Container className="relative grid gap-10 py-20 lg:grid-cols-[1fr_520px] lg:items-center lg:py-28">
        <div className="flex flex-col gap-6">
          <Reveal><GlassChip icon="qr-code">Every crate has a code</GlassChip></Reveal>
          <SplitWords as="h2" text="Scan the code. Meet the farmer." className={T.display} delay={0} />
          <Reveal delay={0.2}><p className={cx(T.lead, "max-w-[520px] text-white/80")}>See the farm, harvest day, checks and route behind your food.</p></Reveal>
          <Reveal delay={0.3}>
            <form onSubmit={(e) => { e.preventDefault(); router.push(R.trace(code.trim() || JOURNEY.code)); }} className="glass-dark flex max-w-[560px] items-center gap-2 rounded-full p-1.5 pl-5">
              <Icon name="qr-code" size={20} className="text-lime" />
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter a code, e.g. VF-TOM-00048" aria-label="Trace code" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-white/60" />
              <button className="h-10 rounded-full bg-lime px-5 text-[14px] font-semibold text-night transition-[background-color,scale,box-shadow] duration-300 hover:scale-[1.04] hover:bg-[#CDF28F] hover:shadow-[0_10px_26px_-8px_rgb(187_234_112/0.7)] active:scale-95">Trace</button>
            </form>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="glass-dark flex flex-col gap-4 rounded-3xl p-4">
          <div className="flex items-center gap-3 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/products/tomatoes.jpg" alt="" className="h-10 w-10 rounded-xl object-cover" />
            <div className="flex-1"><div className="text-[15px] font-semibold">Vine tomatoes · 400 kg</div><div className="text-[12px] text-white/70">{JOURNEY.code}</div></div>
            <span className="rounded-full bg-lime px-2.5 py-1 text-[12px] font-semibold text-night">Verified</span>
          </div>
          <LiveMap height="h-[260px]" rounded="rounded-2xl" controls={false} focus={{ lat: 8.1, lng: -0.75, zoom: 6.1 }}
            plots={[{ id: "a", coords: plotAround(9.4021, -0.9876, 0.03, 0.006) }]}
            routes={[{ id: "r", coords: s.map((x) => [x.lng, x.lat]) }]}
            pins={s.map((x, i) => ({ id: String(i), lat: x.lat, lng: x.lng, kind: i === 0 ? "farm" : i === s.length - 1 ? "home" : i === 3 ? "van" : "handover", label: x.title }))}
            active={String(step)} onPin={(id) => setStep(Number(id))} />
          <div className="flex flex-col">
            {s.slice(0, 4).map((x, i) => (
              <button key={x.title} onClick={() => setStep(i)} className={cx("group/js flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-[background-color,translate] duration-300 ease-[var(--ease-out)]", step === i ? "bg-white/10" : "hover:translate-x-1 hover:bg-white/5")}>
                <span className={cx("flex h-8 w-8 items-center justify-center rounded-full transition-[background-color,color,scale] duration-300 group-hover/js:scale-110", step === i ? "bg-lime text-night" : "bg-forest text-lime")}><Icon name={x.icon} size={15} /></span>
                <span className="flex-1"><span className="block text-[14px] font-semibold">{x.title}: {x.place.split(" · ")[0]}</span><span className="block text-[12px] text-white/65">{x.time}{x.kg && ` · ${x.kg}`}</span></span>
              </button>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
