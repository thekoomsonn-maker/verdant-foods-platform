"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { CountUp, EASE, Reveal } from "@/components/motion";
import { Avatar, Button, Pills } from "@/components/ui";
import { useToast } from "@/components/toast";
import { TINT } from "@/lib/data";
import { RATING, REVIEWS } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { Menu, RatingBars, Stars } from "@/components/market/bits";

export function RatingCard() {
  return (
    <Reveal delay={0.15} className="flex flex-col gap-6 rounded-3xl bg-sun-soft p-6 sm:flex-row sm:items-center md:p-7">
      <div className="flex shrink-0 flex-col gap-1.5">
        <CountUp value={String(RATING.avg)} className="text-[64px] font-medium leading-none tracking-[-0.03em] text-deep md:text-[72px]" />
        <Stars n={RATING.avg} size={18} />
        <span className="text-[14px] text-muted">{RATING.count} reviews</span>
      </div>
      <RatingBars bars={RATING.bars} />
    </Reveal>
  );
}

const FILTERS = ["All", "With photos", "5 stars", "Freshness"];
export function ReviewList({ product }: { product: string }) {
  const [f, setF] = useState("All");
  const [sort, setSort] = useState<"new" | "high" | "low">("new");
  const [more, setMore] = useState(false);
  const [helpful, setHelpful] = useState<string[]>([]);
  const toast = useToast();
  const list = useMemo(() => {
    const l = REVIEWS.filter((r) => f === "All" || (f === "With photos" && r.photos.length) || (f === "5 stars" && r.stars === 5) || (f === "Freshness" && r.fresh));
    return [...l].sort((a, b) => (sort === "new" ? a.age - b.age : sort === "high" ? b.stars - a.stars : a.stars - b.stars));
  }, [f, sort]);
  const shown = more ? list : list.slice(0, 4);
  const cols = [shown.filter((_, i) => i % 2 === 0), shown.filter((_, i) => i % 2 === 1)];
  const card = (r: (typeof REVIEWS)[number]) => (
    <motion.article key={r.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }} className="flex flex-col gap-4 rounded-3xl bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><Avatar initials={r.initials} /><div><div className="text-[15px] font-semibold">{r.name}</div><div className="text-[13px] text-muted">{r.place} · {r.when}</div></div></div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[13px] font-medium text-success"><Icon name="circle-check" size={14} /><span className="hidden sm:inline">Verified buyer</span><span className="sm:hidden">Verified</span></span>
      </div>
      <Stars n={r.stars} />
      <p className="text-[16px] leading-[1.6]">{r.text}</p>
      {r.photos.length > 0 && <div className="flex gap-2">{r.photos.map((ph, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={`/products/${ph}.jpg`} alt="" className="h-16 w-16 rounded-xl object-cover mix-blend-multiply transition-transform duration-300 hover:scale-105" style={{ background: TINT[ph] }} />
      ))}</div>}
      {r.reply && <div className="flex flex-col gap-1 rounded-2xl bg-mist px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-leaf"><Icon name="sprout" size={15} />Reply from the farm</span><span className="text-[14px] text-deep">{r.reply}</span></div>}
      <button onClick={() => { setHelpful((h) => (h.includes(r.id) ? h.filter((x) => x !== r.id) : [...h, r.id])); if (!helpful.includes(r.id)) toast("Thanks. We use this to sort reviews."); }} className={`inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold transition-colors ${helpful.includes(r.id) ? "text-leaf" : "text-muted hover:text-deep"}`}>
        <Icon name={helpful.includes(r.id) ? "check" : "user-check"} size={15} />{helpful.includes(r.id) ? "Marked helpful" : "Helpful"}
      </button>
    </motion.article>
  );
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills items={FILTERS} onChange={(v) => { setF(v); setMore(false); }} light />
        <Menu value={sort} onChange={setSort} options={[["new", "Newest"], ["high", "Highest rated"], ["low", "Lowest rated"]]} />
      </div>
      {list.length === 0 ? <p className="rounded-3xl bg-white px-6 py-12 text-center text-muted">No reviews match this filter yet.</p> : (
        <>
          <div className="grid gap-4 md:hidden"><AnimatePresence mode="popLayout">{shown.map(card)}</AnimatePresence></div>
          <div className="hidden gap-4 md:grid md:grid-cols-2 md:items-start">
            {cols.map((c, i) => <div key={i} className="flex flex-col gap-4"><AnimatePresence mode="popLayout">{c.map(card)}</AnimatePresence></div>)}
          </div>
        </>
      )}
      <div className="flex flex-col items-center gap-3">
        {!more && list.length > 4 && <Button variant="light" size="M" onClick={() => setMore(true)}>Show more reviews</Button>}
        <Link href={R.product(product)} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-deep">Back to the product <Icon name="arrow-up-right" size={18} /></Link>
      </div>
    </div>
  );
}
