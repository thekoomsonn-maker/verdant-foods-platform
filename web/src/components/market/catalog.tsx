"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { EASE, Reveal, SplitWords } from "@/components/motion";
import { Button, Crumbs } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { PROOF, productImg, type Product, type Proof } from "@/lib/data";
import { CATALOG, freshDays, PRACTICE_LABEL, practicesOf, regionOf, type Practice } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { LiveGrid } from "./bits";

/* ---------- Filter model ---------- */
export type Sort = "fresh" | "price-low" | "price-high" | "name" | "match";
export const SORT_LABEL: Record<Sort, string> = { match: "Best match", fresh: "Freshest first", "price-low": "Price, low to high", "price-high": "Price, high to low", name: "Name, A to Z" };
const FRESH = { "24 h": 0, "3 days": 3, Week: 7 } as const;
type Fresh = keyof typeof FRESH;

export type Filters = { fresh: Fresh; regions: string[]; grown: Practice[]; proof: Proof[]; maxPrice: number; sort: Sort; q: string };

export function applyFilters(items: Product[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean).map((w) => w.replace(/(es|s)$/, ""));
  const out = items.filter((p) =>
    freshDays(p) <= FRESH[f.fresh] &&
    (!f.regions.length || f.regions.includes(regionOf(p))) &&
    f.grown.every((g) => practicesOf(p).includes(g)) &&
    (!f.proof.length || f.proof.includes(p.proof)) &&
    p.price <= f.maxPrice &&
    (!words.length || words.every((w) => `${p.name} ${p.cat} ${p.farm.replace(/-/g, " ")}`.toLowerCase().includes(w))),
  );
  const s = [...out];
  if (f.sort === "fresh") s.sort((a, b) => freshDays(a) - freshDays(b) || b.proof - a.proof);
  if (f.sort === "price-low") s.sort((a, b) => a.price - b.price);
  if (f.sort === "price-high") s.sort((a, b) => b.price - a.price);
  if (f.sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
  if (f.sort === "match" && words.length) s.sort((a, b) => Number(b.name.toLowerCase().startsWith(words[0])) - Number(a.name.toLowerCase().startsWith(words[0])) || freshDays(a) - freshDays(b));
  return s;
}

export function useFilters(base: Product[], init?: Partial<Filters>) {
  const top = Math.max(10, ...base.map((p) => p.price));
  const blank: Filters = { fresh: "Week", regions: [], grown: [], proof: [], maxPrice: top, sort: "fresh", q: "", ...init };
  const [f, setF] = useState<Filters>(blank);
  const items = useMemo(() => applyFilters(base, f), [base, f]);
  const set = (p: Partial<Filters>) => setF((o) => ({ ...o, ...p }));
  const toggle = <K extends "regions" | "grown" | "proof">(k: K, v: Filters[K][number]) =>
    setF((o) => { const arr = o[k] as Filters[K][number][]; return { ...o, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }; });
  const active = (f.fresh !== "Week" ? 1 : 0) + f.regions.length + f.grown.length + f.proof.length + (f.maxPrice < top ? 1 : 0);
  return { f, set, toggle, items, top, active, reset: () => setF({ ...blank, q: f.q, sort: f.sort }) };
}
type FilterApi = ReturnType<typeof useFilters>;

/* ---------- Controlled check row ---------- */
function CheckRow({ on, label, count, onClick }: { on: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={on} className="group/cr flex w-full items-center gap-3 py-1.5 text-left">
      <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-150", on ? "bg-deep" : "bg-paper ring-1 ring-line-strong group-hover/cr:ring-deep")}>
        <AnimatePresence>{on && <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.15 }}><Icon name="check" size={14} className="text-white" /></motion.span>}</AnimatePresence>
      </span>
      <span className="flex-1 text-[14px] text-ink">{label}</span>
      {count !== undefined && <span className="text-[13px] tabular text-muted">{count}</span>}
    </button>
  );
}

/* ---------- Sidebar panel (desktop) and sheet body (mobile) ---------- */
export function FilterPanel({ api, base }: { api: FilterApi; base: Product[] }) {
  const { f, set, toggle, top } = api;
  const n = (fn: (p: Product) => boolean) => base.filter(fn).length;
  const pct = ((f.maxPrice - 10) / Math.max(1, top - 10)) * 100;
  return (
    <div className="flex flex-col gap-7">
      <div className="rounded-2xl bg-lime-soft p-4">
        <div className="text-[15px] font-semibold text-deep">Freshness</div>
        <div className="mt-0.5 text-[13px] text-muted">Picked within</div>
        <LayoutGroup id="fresh">
          <div className="mt-3 flex gap-1.5">
            {(Object.keys(FRESH) as Fresh[]).map((k) => (
              <button key={k} onClick={() => set({ fresh: k })} className={cx("relative rounded-full px-3 py-2 text-[13px] font-semibold transition-colors", f.fresh === k ? "text-white" : "bg-white text-deep hover:bg-mint")}>
                {f.fresh === k && <motion.span layoutId="fresh-pill" className="absolute inset-0 rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{k}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <fieldset className="flex flex-col gap-1 border-b border-line pb-6">
        <legend className="mb-2 text-[15px] font-semibold">Region</legend>
        {["Northern", "Upper West"].map((r) => <CheckRow key={r} on={f.regions.includes(r)} label={`${r} Region`} count={n((p) => regionOf(p) === r)} onClick={() => toggle("regions", r)} />)}
      </fieldset>
      <fieldset className="flex flex-col gap-1 border-b border-line pb-6">
        <legend className="mb-2 text-[15px] font-semibold">How it is grown</legend>
        {(Object.keys(PRACTICE_LABEL) as Practice[]).map((g) => <CheckRow key={g} on={f.grown.includes(g)} label={PRACTICE_LABEL[g]} count={n((p) => practicesOf(p).includes(g))} onClick={() => toggle("grown", g)} />)}
      </fieldset>
      <fieldset className="flex flex-col gap-1 border-b border-line pb-6">
        <legend className="mb-2 text-[15px] font-semibold">Proof level</legend>
        {([3, 2, 1] as Proof[]).map((l) => <CheckRow key={l} on={f.proof.includes(l)} label={PROOF[l].label} count={n((p) => p.proof === l)} onClick={() => toggle("proof", l)} />)}
      </fieldset>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between"><span className="text-[15px] font-semibold">Price</span><span className="text-[13px] tabular text-muted">Up to GH₵ {f.maxPrice}</span></div>
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
          <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-deep" style={{ width: `${pct}%` }} />
          <input type="range" min={10} max={top} step={1} value={f.maxPrice} onChange={(e) => set({ maxPrice: Number(e.target.value) })} aria-label="Highest price"
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-deep [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-deep [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_white]" />
        </div>
        <div className="flex justify-between text-[13px] text-muted"><span>GH₵ 10</span><span>GH₵ {top}</span></div>
      </div>
      {api.active > 0 && <button onClick={api.reset} className="self-start text-[14px] font-semibold text-leaf hover:text-deep">Clear filters ({api.active})</button>}
    </div>
  );
}

/* ---------- Sort menu ---------- */
export function SortMenu({ value, onChange, options = ["fresh", "price-low", "price-high", "name"], className }: { value: Sort; onChange: (s: Sort) => void; options?: Sort[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className={cx("relative", className)}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-mist px-4 text-[14px] font-semibold text-deep transition-colors hover:bg-mint">
        {SORT_LABEL[value]}<motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><Icon name="chevron-down" size={16} /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-12 z-20 w-[220px] origin-top-right rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)]" role="listbox">
            {options.map((o) => (
              <li key={o}><button role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); }} className={cx("flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-mist", o === value && "font-semibold text-deep")}>{SORT_LABEL[o]}{o === value && <Icon name="check" size={16} />}</button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Mobile filter sheet ---------- */
export function FilterSheet({ open, onClose, children, count }: { open: boolean; onClose: () => void; children: ReactNode; count: number }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-night/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-label="Filters" className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[86svh] flex-col rounded-t-3xl bg-white"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.4, ease: EASE }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }} onDragEnd={(_, i) => { if (i.offset.y > 100) onClose(); }}>
            <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line" />
            <div className="flex items-center justify-between px-5 py-3"><span className="text-[18px] font-semibold">Filters</span><button onClick={onClose} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-deep"><Icon name="x" size={18} /></button></div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            <div className="border-t border-line p-4"><Button full onClick={onClose}>Show {count} items</Button></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Promo cards ---------- */
export function BoxPromo({ title = "A week of vegetables in one box" }: { title?: string }) {
  return (
    <Link href={R.packs} className="group/bp relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-orange p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
      <div className="relative z-10 flex flex-col gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80">Save time</span>
        <span className="text-[24px] font-medium leading-tight tracking-[-0.02em] md:text-[30px]">{title}</span>
        <span className="text-[14px] text-white/85">Seasonal packs from GH₵ 180, packed the day you order.</span>
        <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-deep">See stock-up packs <Icon name="arrow-right" size={16} className="transition-transform group-hover/bp:translate-x-[3px]" /></span>
      </div>
      <span className="relative mx-auto h-[150px] w-[150px] shrink-0 overflow-hidden rounded-full bg-orange-soft md:mx-0 md:h-[170px] md:w-[170px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/products/box.jpg" alt="" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/bp:scale-110" />
      </span>
    </Link>
  );
}

export function ShopPromos() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.9fr_1fr]">
      <Reveal>
        <Link href={R.product("vine-tomatoes")} className="group/tp relative flex h-full min-h-[300px] flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-plum p-6 text-white md:flex-row md:items-center md:p-10">
          <div className="relative z-10 flex max-w-[460px] flex-col gap-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/75">Harvest week</span>
            <span className={cx(T.h1, "text-white")}>Tomato season is here</span>
            <span className="text-[15px] text-white/80">15% off vine tomatoes from Nyankpala until Sunday.</span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-lime px-4 py-2 text-[14px] font-semibold text-night">Shop tomatoes <Icon name="arrow-right" size={16} className="transition-transform group-hover/tp:translate-x-[3px]" /></span>
          </div>
          <span className="relative mx-auto h-[190px] w-[190px] shrink-0 md:mx-0 md:h-[230px] md:w-[230px]">
            <span className="absolute inset-0 overflow-hidden rounded-full bg-[#F4EEE9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImg(CATALOG[0])} alt="" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/tp:scale-110" />
            </span>
            <motion.span initial={{ scale: 0, rotate: -20 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.4 }}
              className="absolute -left-3 -top-2 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-lime text-night">
              <span className="text-[22px] font-semibold leading-none">15%</span><span className="text-[11px]">off</span>
            </motion.span>
          </span>
        </Link>
      </Reveal>
      <Reveal delay={0.08}>
        <Link href={R.delivery} className="group/fd flex h-full min-h-[200px] flex-col justify-center gap-3 rounded-3xl bg-sun p-6 text-night md:p-8">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-night/70">Free delivery</span>
          <span className="text-[28px] font-medium leading-tight tracking-[-0.02em]">Orders over GH₵ 200</span>
          <span className="inline-flex items-center gap-1.5 text-[14px] text-night/75">Accra, Kumasi and Tamale. <Icon name="arrow-up-right" size={16} className="transition-transform group-hover/fd:-translate-y-0.5 group-hover/fd:translate-x-0.5" /></span>
        </Link>
      </Reveal>
    </div>
  );
}

/* ---------- The full catalogue block used by Shop ---------- */
export function Catalog({ base, title, crumbs, promo = true }: { base?: Product[]; title: string; crumbs: [string, string?][]; promo?: boolean }) {
  const items0 = base ?? CATALOG;
  const api = useFilters(items0);
  const [shown, setShown] = useState(9);
  const [sheet, setSheet] = useState(false);
  const { f, set, toggle, items } = api;
  const visible = items.slice(0, shown);
  useEffect(() => setShown(9), [f]);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <Crumbs items={crumbs} />
          <SplitWords text={title} className={cx(T.display, "text-deep")} delay={0.05} />
          <p className="text-[15px] text-muted">{items0.length} items from {new Set(items0.map((p) => p.farm)).size} farms · picked this week</p>
        </div>
        <label className="flex h-12 w-full items-center gap-2.5 rounded-full bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep lg:w-[420px]">
          <Icon name="search" size={18} className="text-muted" />
          <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search tomatoes, yam, farms" aria-label="Search this page" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted" />
          {f.q ? <button onClick={() => set({ q: "" })} aria-label="Clear search" className="text-muted hover:text-ink"><Icon name="x" size={16} /></button> : <Icon name="sliders-horizontal" size={18} className="text-deep" />}
        </label>
      </div>

      {/* Mobile quick filters */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:hidden">
        <button onClick={() => setSheet(true)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mist px-4 text-[14px] font-semibold text-deep"><Icon name="list-filter" size={16} />Filters{api.active > 0 && <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-deep px-1 text-[11px] text-white">{api.active}</span>}</button>
        <button onClick={() => set({ fresh: f.fresh === "24 h" ? "Week" : "24 h" })} className={cx("h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors", f.fresh === "24 h" ? "bg-deep text-white" : "bg-mist text-deep")}>Picked today</button>
        {["Northern", "Upper West"].map((r) => <button key={r} onClick={() => toggle("regions", r)} className={cx("h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors", f.regions.includes(r) ? "bg-deep text-white" : "bg-mist text-deep")}>{r}</button>)}
        <SortMenu value={f.sort} onChange={(s) => set({ sort: s })} className="shrink-0" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside className="hidden lg:block"><div className="sticky top-[150px]"><FilterPanel api={api} base={items0} /></div></aside>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="hidden items-center justify-between lg:flex">
            <span className="text-[14px] text-muted">Showing {visible.length} of {items.length}</span>
            <SortMenu value={f.sort} onChange={(s) => set({ sort: s })} />
          </div>
          <LiveGrid items={visible} insertAt={6} insert={promo ? <BoxPromo /> : undefined}
            empty={<div className="flex flex-col items-center gap-4 rounded-3xl bg-paper px-6 py-16 text-center"><Icon name="search" size={28} className="text-muted" /><p className="text-[17px] font-semibold">Nothing matches these filters</p><p className="text-muted">Try a wider freshness window or clear a filter.</p><Button size="M" variant="secondary" onClick={api.reset}>Clear filters</Button></div>} />
          {items.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <span className="text-[14px] text-muted">Showing {visible.length} of {items.length}</span>
              <span className="h-1 w-[160px] overflow-hidden rounded-full bg-line"><motion.span className="block h-full rounded-full bg-deep" animate={{ width: `${(visible.length / items.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} /></span>
              {visible.length < items.length && <Button size="M" variant="secondary" onClick={() => setShown((s) => s + 9)}>Show more produce</Button>}
            </div>
          )}
        </div>
      </div>
      <FilterSheet open={sheet} onClose={() => setSheet(false)} count={items.length}><FilterPanel api={api} base={items0} /></FilterSheet>
    </div>
  );
}
