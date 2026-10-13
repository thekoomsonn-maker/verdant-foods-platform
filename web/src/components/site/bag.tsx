"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { PRODUCTS, productImg, cedi, farmBySlug, type Product } from "@/lib/data";
import { Icon } from "../icon";
import { Button } from "../ui";
import { R } from "@/lib/routes";

type Line = { p: Product; qty: number };
type Ctx = { lines: Line[]; count: number; add: (p: Product, from?: HTMLElement | null) => void; open: boolean; setOpen: (b: boolean) => void; bump: number };
const BagCtx = createContext<Ctx | null>(null);
export const useBag = () => useContext(BagCtx)!;

const START: Line[] = [{ p: PRODUCTS[0], qty: 1 }, { p: PRODUCTS[6], qty: 2 }];

export function BagProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(START);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const add = useCallback((p: Product, from?: HTMLElement | null) => {
    const target = Array.from(document.querySelectorAll<HTMLElement>("[data-bag-target]")).find((e) => e.offsetParent !== null);
    const done = () => {
      setLines((ls) => { const f = ls.find((l) => l.p.slug === p.slug); return f ? ls.map((l) => (l === f ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { p, qty: 1 }]; });
      setBump((b) => b + 1);
    };
    if (!from || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const img = document.createElement("img");
    img.src = productImg(p);
    const s = 72;
    Object.assign(img.style, { position: "fixed", left: `${a.left + a.width / 2 - s / 2}px`, top: `${a.top + a.height / 2 - s / 2}px`, width: `${s}px`, height: `${s}px`, borderRadius: "999px", objectFit: "cover", zIndex: "100", pointerEvents: "none", boxShadow: "0 12px 30px rgb(1 38 31 / .25)" });
    document.body.appendChild(img);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = img.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(0.7)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.4 },
      ],
      { duration: 700, easing: "cubic-bezier(0.65,0,0.35,1)" },
    );
    anim.onfinish = () => { img.remove(); done(); };
  }, []);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return (
    <BagCtx.Provider value={{ lines, count, add, open, setOpen, bump }}>
      {children}
      <BagDrawer />
    </BagCtx.Provider>
  );
}

export function BagCount({ className }: { className?: string }) {
  const { count, bump } = useBag();
  return (
    <motion.span key={bump} initial={{ scale: bump ? 1.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
      className={className ?? "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-[11px] font-bold text-night"}>
      {count}
    </motion.span>
  );
}

function BagDrawer() {
  const { open, setOpen, lines } = useBag();
  const total = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-night/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[440px] flex-col bg-white shadow-[var(--shadow-3)]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} aria-label="Your bag">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div><div className="text-[20px] font-semibold">Your bag</div><div className="text-[13px] text-muted">From {new Set(lines.map((l) => l.p.farm)).size} farms</div></div>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-deep hover:bg-mint"><Icon name="x" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map((l, i) => (
                <motion.div key={l.p.slug} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }} className="flex items-center gap-4 border-b border-line py-4 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImg(l.p)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1"><div className="truncate font-semibold">{l.p.name}</div><div className="truncate text-[13px] text-muted">{farmBySlug(l.p.farm).name} · {l.p.fresh}</div></div>
                  <div className="text-right"><div className="font-semibold tabular">{cedi(l.p.price * l.qty)}</div><div className="text-[13px] text-muted">× {l.qty}</div></div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-line px-6 py-5">
              <div className="flex justify-between text-[15px]"><span className="text-muted">Subtotal</span><span className="font-semibold tabular">{cedi(total)}</span></div>
              <Button href={R.checkout} arrow full onClick={() => setOpen(false)}>Go to checkout</Button>
              <Link href={R.bag} onClick={() => setOpen(false)} className="text-center text-[14px] font-semibold text-leaf">See full bag</Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
