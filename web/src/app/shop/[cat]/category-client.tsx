"use client";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Reveal, SplitWords } from "@/components/motion";
import { Crumbs, Pills } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import type { Product } from "@/lib/data";
import type { CatMeta } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { LiveGrid } from "@/components/market/bits";
import { applyFilters, SortMenu, type Sort } from "@/components/market/catalog";

export function CategoryClient({ cat, label, meta, items, farmCount }: { cat: string; label: string; meta: CatMeta; items: Product[]; farmCount: number }) {
  const [chip, setChip] = useState("All");
  const [sort, setSort] = useState<Sort>("fresh");
  const light = meta.fg === "light";
  const shown = useMemo(() => {
    const base = chip === "All" ? items : items.filter((p) => p.name.toLowerCase().includes(chip.toLowerCase().replace(/s$/, "")));
    return applyFilters(base, { fresh: "Week", regions: [], grown: [], proof: [], maxPrice: 9999, sort, q: "" });
  }, [chip, sort, items]);
  const hero = items.find((p) => p.img === meta.hero) ?? items[0];
  return (
    <>
      <section className={cx("relative flex flex-col gap-8 overflow-hidden rounded-3xl p-6 md:flex-row md:items-center md:justify-between md:p-10 lg:px-14", meta.bg, light ? "text-white" : "text-night")}>
        <div className="relative z-10 flex flex-col gap-4">
          <Crumbs items={[["Shop", R.shop], [label]]} light={light} />
          <SplitWords text={meta.title} className={cx(T.display)} delay={0.05} />
          <Reveal delay={0.2}><p className={cx("text-[16px]", light ? "text-white/85" : "text-night/75")}>{meta.sub} {items.length} items from {farmCount} {farmCount === 1 ? "farm" : "farms"}.</p></Reveal>
          <Reveal delay={0.3}><Pills items={["All", ...meta.chips]} onChange={setChip} size="S" light className="mt-1" /></Reveal>
        </div>
        {hero && (
          <motion.span initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className={cx("relative mx-auto h-[200px] w-[200px] shrink-0 overflow-hidden rounded-full ring-[14px] ring-white/40 md:mx-0 md:h-[240px] md:w-[240px]", meta.ring)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/products/${hero.img}.jpg`} alt="" className="h-full w-full object-cover mix-blend-multiply" />
          </motion.span>
        )}
      </section>
      <section className="flex flex-col gap-8" data-cat={cat}>
        <div className="flex items-end justify-between gap-4">
          <Reveal><h2 className={cx(T.h3, "text-deep")}>Best right now</h2></Reveal>
          <SortMenu value={sort} onChange={setSort} />
        </div>
        <LiveGrid items={shown} cols={4} empty={<p className="rounded-3xl bg-paper px-6 py-12 text-center text-muted">Nothing in this group this week. Try All.</p>} />
      </section>
    </>
  );
}
