"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef, useState } from "react";
import { Card } from "@/components/site/account";
import { useBag } from "@/components/site/bag";
import { CardHead } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { EASE, Tilt } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Avatar, Button } from "@/components/ui";
import { cedi, farmBySlug, productBySlug, productImg, TINT } from "@/lib/data";
import { FOLLOWED_FARMS, SAVED } from "@/lib/data-account";
import { R } from "@/lib/routes";

type Saved = (typeof SAVED)[number];

export function SavedGrid() {
  const toast = useToast();
  const { add } = useBag();
  const [items, setItems] = useState(SAVED);
  const [f, setF] = useState<"all" | "stock" | "dropped">("all");
  const deal = useRef<HTMLSpanElement>(null);
  const list = items.filter((p) => f === "all" || (f === "stock" ? p.inStock : p.dropped));
  const chips: [typeof f, string, string?][] = [["all", `All · ${items.length}`], ["stock", "In stock"], ["dropped", `Price dropped · ${items.filter((p) => p.dropped).length}`, "tag"]];
  const tomatoes = productBySlug("vine-tomatoes");

  return (
    <>
      <LayoutGroup id="saved-f">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {chips.map(([id, l, ic]) => (
            <button key={id} onClick={() => setF(id)} className={cx("relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors", f === id ? "text-white" : "bg-white text-deep hover:bg-mint")}>
              {f === id && <motion.span layoutId="saved-pill" className="absolute inset-0 rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              {ic && <Icon name={ic} size={15} className="relative" />}<span className="relative">{l}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 }} className="flex items-center gap-3 rounded-2xl bg-tomato-soft p-3 pl-4">
        <Icon name="tag" size={18} className="shrink-0 text-tomato" />
        <span className="flex-1 text-[14px] font-medium">Vine tomatoes are 15% off until Sunday.</span>
        <span ref={deal}><Button size="S" onClick={() => { add(tomatoes, deal.current); toast("Vine tomatoes added to your bag"); }}>Add to bag</Button></span>
      </motion.div>

      <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-7 md:gap-x-5 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: Math.min(i, 8) * 0.05 } }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
              <SavedCard p={p} onRemove={() => { setItems((x) => x.filter((y) => y.slug !== p.slug)); toast(`${p.name} removed from saved`, "info"); }} onAdd={(el) => { add(p, el); toast(`${p.name} added to your bag`); }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <Card className="items-center py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mist text-deep"><Icon name="heart" size={24} /></span>
          <div className="font-semibold">Nothing here yet</div>
          <Button href={R.shop} size="M" arrow>Browse fresh produce</Button>
        </Card>
      )}
    </>
  );
}

function SavedCard({ p, onRemove, onAdd }: { p: Saved; onRemove: () => void; onAdd: (el: HTMLElement | null) => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  const farm = farmBySlug(p.farm);
  return (
    <div className="group/pc flex flex-col gap-3">
      <div className="relative">
        <Link href={R.product(p.slug)} className="block">
          <Tilt className="relative aspect-[256/220] overflow-hidden rounded-[20px] transition-shadow duration-300 group-hover/pc:shadow-[var(--shadow-2)]">
            <div className="absolute inset-0" style={{ background: TINT[p.img] ?? "#F2F7F4" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productImg(p)} alt={p.name} className={cx("absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover/pc:scale-[1.04]", !p.inStock && "opacity-60 grayscale-[40%]")} loading="lazy" />
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-deep backdrop-blur"><Icon name="leaf" size={13} className="text-leaf" />{p.inStock ? p.fresh : "Back next week"}</span>
          </Tilt>
        </Link>
        <motion.button whileTap={{ scale: 0.8 }} onClick={onRemove} aria-label={`Remove ${p.name} from saved`} className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-tomato transition-transform hover:scale-110">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" /></svg>
        </motion.button>
      </div>
      <div className="flex flex-col gap-0.5">
        <Link href={R.farm(farm.slug)} className="truncate text-[13px] text-muted hover:text-leaf">{farm.name}</Link>
        <Link href={R.product(p.slug)} className="truncate text-[16px] font-semibold text-ink group-hover/pc:text-deep">{p.name}</Link>
      </div>
      <div className="flex items-center justify-between">
        <span className="tabular"><span className="text-[16px] font-semibold text-deep">{cedi(p.dropped && p.was ? Math.round(p.price * 0.85) : p.price)}</span> <span className="text-[13px] text-muted">/ {p.unit}</span></span>
        {p.inStock
          ? <button ref={btn} onClick={() => onAdd(btn.current)} aria-label={`Add ${p.name} to bag`} className="flex h-10 w-10 items-center justify-center rounded-full bg-deep text-white transition-[background-color,color,transform] duration-300 hover:rotate-90 hover:bg-lime hover:text-night active:scale-90"><Icon name="plus" size={18} /></button>
          : <span className="text-[13px] text-muted">Sold out</span>}
      </div>
    </div>
  );
}

export function FollowedFarms() {
  return (
    <Card>
      <CardHead title="Farms you follow" />
      <div className="grid gap-2.5 md:grid-cols-3">
        {FOLLOWED_FARMS.map((f, i) => (
          <motion.div key={f.slug} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}>
            <Link href={R.farm(f.slug)} className="group/ff flex items-center gap-3 rounded-2xl bg-paper p-3 transition-colors hover:bg-mist">
              <Avatar initials={f.initials} size={40} className="bg-lime text-night" />
              <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{farmBySlug(f.slug).name}</span><span className="block text-[13px] font-medium text-leaf">{f.news}</span></span>
              <Icon name="chevron-right" size={16} className="text-muted transition-transform group-hover/ff:translate-x-0.5" />
            </Link>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
