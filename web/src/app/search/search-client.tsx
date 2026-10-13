"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { EASE, Reveal, Stagger } from "@/components/motion";
import { Container } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { StoryCard } from "@/components/site/sections";
import { FARMS, STORIES, TINT } from "@/lib/data";
import { CATALOG } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { LiveGrid, Menu, Stars } from "@/components/market/bits";
import { FilterPanel, FilterSheet, useFilters, type Sort } from "@/components/market/catalog";

const SUGGEST: Record<string, string[]> = { tomato: ["vine tomatoes", "tomato and pepper pack", "plum tomatoes"], yam: ["puna yam", "yam 3 tubers"], pepper: ["scotch bonnet", "tomato and pepper pack"], onion: ["red onions", "shallots"] };
const stem = (s: string) => s.toLowerCase().trim().replace(/(es|s)$/, "");

export function SearchView({ q: q0 }: { q: string }) {
  const router = useRouter();
  const [input, setInput] = useState(q0);
  const api = useFilters(CATALOG, { q: q0, sort: "match" });
  const { f, set, toggle, items } = api;
  const [tab, setTab] = useState<"Produce" | "Farms" | "Stories">("Produce");
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    setInput(q0); set({ q: q0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q0]);

  const word = stem(f.q.split(/\s+/)[0] ?? "");
  const farms = useMemo(() => {
    if (!word) return FARMS;
    return FARMS.filter((fm) => fm.name.toLowerCase().includes(word) || fm.district.toLowerCase().includes(word) || CATALOG.some((p) => p.farm === fm.slug && p.name.toLowerCase().includes(word)));
  }, [word]);
  const stories = useMemo(() => (word ? STORIES.filter((s) => `${s.title} ${s.tag}`.toLowerCase().includes(word)) : STORIES), [word]);
  const also = (SUGGEST[word] ?? ["vine tomatoes", "puna yam", "family veg box"]).filter((s) => s !== f.q.toLowerCase());
  const go = (s: string) => { setInput(s); set({ q: s }); router.replace(R.search(s), { scroll: false }); };
  const counts = { Produce: items.length, Farms: farms.length, Stories: stories.length };
  const quick: [string, boolean, () => void][] = [
    ["Picked today", f.fresh === "24 h", () => set({ fresh: f.fresh === "24 h" ? "Week" : "24 h" })],
    ["Under GH₵ 50", f.maxPrice <= 50, () => set({ maxPrice: f.maxPrice <= 50 ? api.top : 50 })],
    ["Weighed and photographed", f.proof.includes(3), () => toggle("proof", 3)],
  ];

  return (
    <>
      <section className="bg-deep pt-[68px] text-white lg:pt-[72px]">
        <Container className="flex flex-col gap-4 py-8 md:py-10">
          <form onSubmit={(e) => { e.preventDefault(); go(input.trim()); }} className="flex items-center gap-2 rounded-full bg-forest p-1.5 pl-5 ring-1 ring-white/10 transition focus-within:ring-lime/60" role="search">
            <Icon name="search" size={20} className="shrink-0 text-lime" />
            <input value={input} onChange={(e) => { setInput(e.target.value); set({ q: e.target.value }); }} placeholder="Search tomatoes, yam, farms" aria-label="Search" autoFocus={!q0}
              className="min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/55" />
            <AnimatePresence>{input && <motion.button type="button" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => go("")} aria-label="Clear search" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><Icon name="x" size={16} /></motion.button>}</AnimatePresence>
            <button className="h-10 shrink-0 rounded-full bg-lime px-5 text-[14px] font-semibold text-night transition-colors hover:bg-leaf-light">Search</button>
          </form>
          <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            <span className="shrink-0 text-[14px] text-white/65">Also try</span>
            {also.map((s) => <button key={s} onClick={() => go(s)} className="shrink-0 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/20">{s}</button>)}
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-8 pb-20 pt-2 md:pb-28">
        <LayoutGroup id="search-tabs">
          <div className="no-scrollbar flex gap-7 overflow-x-auto border-b border-line" role="tablist">
            {(["Produce", "Farms", "Stories"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx("relative shrink-0 pb-3 pt-4 text-[15px] font-semibold transition-colors", tab === t ? "text-deep" : "text-muted hover:text-ink")}>
                {t} · <span className="tabular">{counts[t]}</span>
                {tab === t && <motion.span layoutId="search-tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-deep" />}
              </button>
            ))}
          </div>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-8">
            {tab === "Produce" && (
              <>
                <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
                  <button onClick={() => setSheet(true)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mist px-4 text-[14px] font-semibold text-deep hover:bg-mint"><Icon name="list-filter" size={16} />Filters{api.active > 0 && <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-deep px-1 text-[11px] text-white">{api.active}</span>}</button>
                  {quick.map(([l, on, fn]) => (
                    <button key={l} onClick={fn} aria-pressed={on} className={cx("h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors duration-200", on ? "bg-deep text-white" : "bg-mist text-deep hover:bg-mint")}>{l}</button>
                  ))}
                  <Menu<Sort> value={f.sort} onChange={(s) => set({ sort: s })} className="shrink-0 [&>button]:bg-mist" options={[["match", "Best match"], ["fresh", "Freshest first"], ["price-low", "Price, low to high"], ["price-high", "Price, high to low"]]} />
                </div>
                <LiveGrid items={items} cols={4} empty={
                  <div className="flex flex-col items-center gap-3 rounded-3xl bg-paper px-6 py-16 text-center">
                    <Icon name="search" size={28} className="text-muted" />
                    <p className="text-[18px] font-semibold">No produce matches “{f.q}”</p>
                    <p className="text-muted">Check the spelling, clear a filter or browse all produce.</p>
                    <Link href={R.shop} className="mt-1 inline-flex items-center gap-1.5 font-semibold text-deep">Browse the shop <Icon name="arrow-up-right" size={18} /></Link>
                  </div>
                } />
              </>
            )}
            {tab === "Farms" && <FarmRow farms={farms} />}
            {tab === "Stories" && (stories.length ? <Stagger className="grid gap-x-4 gap-y-10 md:grid-cols-2 lg:grid-cols-3">{stories.map((s) => <StoryCard key={s.slug} s={s} />)}</Stagger> : <p className="rounded-3xl bg-paper px-6 py-12 text-center text-muted">No stories mention “{f.q}” yet. <Link href={R.stories} className="font-semibold text-deep">See all stories</Link></p>)}
          </motion.div>
        </AnimatePresence>
      </Container>

      {tab === "Produce" && farms.length > 0 && (
        <section className="bg-paper py-[72px] md:py-24">
          <Container className="flex flex-col gap-8">
            <Reveal><h2 className={cx(T.h2, "text-deep")}>{word ? `Farms that grow ${f.q.trim().split(/\s+/)[0].toLowerCase()}` : "Farms on Verdant"}</h2></Reveal>
            <FarmRow farms={farms.slice(0, 3)} />
          </Container>
        </section>
      )}
      <FilterSheet open={sheet} onClose={() => setSheet(false)} count={items.length}><FilterPanel api={api} base={CATALOG} /></FilterSheet>
    </>
  );
}

function FarmRow({ farms }: { farms: typeof FARMS }) {
  if (!farms.length) return <p className="rounded-3xl bg-paper px-6 py-12 text-center text-muted">No farms match this search.</p>;
  return (
    <Stagger className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {farms.map((fm, i) => {
        const p = CATALOG.find((x) => x.farm === fm.slug && x.cat !== "packs");
        return (
          <Link key={fm.slug} href={R.farm(fm.slug)} className="group/fr flex items-center gap-4 rounded-2xl bg-white p-3.5 shadow-[var(--shadow-1)] transition-transform duration-300 hover:-translate-y-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p && <img src={`/products/${p.img}.jpg`} alt="" className="h-14 w-14 rounded-xl object-cover mix-blend-multiply" style={{ background: TINT[p.img] }} />}
            <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-semibold group-hover/fr:text-deep">{fm.name}</span><span className="block text-[13px] text-muted">{fm.district} · {fm.members} farmers</span></span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2.5 py-1 text-[13px] font-semibold"><Stars n={1} size={13} className="[&>svg:not(:first-child)]:hidden" />{(4.9 - (i % 3) * 0.1).toFixed(1)}</span>
          </Link>
        );
      })}
    </Stagger>
  );
}
