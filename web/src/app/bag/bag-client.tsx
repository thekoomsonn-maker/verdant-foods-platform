"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { EASE, Reveal, SplitWords } from "@/components/motion";
import { Button, Container } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { ProductGrid } from "@/components/site/sections";
import { cedi, farmBySlug, PRODUCTS, productImg, TINT, type Product } from "@/lib/data";
import { FREE_DELIVERY_AT } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { QtyStepper } from "@/components/market/bits";
import { useBagLines } from "@/components/market/bag-lines";

const baseSlug = (p: Product) => p.slug.split("--")[0];
const linkOf = (p: Product) => (p.slug.startsWith("pack-") ? R.packs : R.product(baseSlug(p)));

export function Summary({ subtotal, delivery, total, discount = 0, cta, children }: { subtotal: number; delivery: number; total: number; discount?: number; cta?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-1)] md:p-6">
      <span className="text-[18px] font-semibold">Order summary</span>
      {children}
      <div className="flex flex-col gap-3 text-[15px]">
        <div className="flex justify-between"><span className="text-muted">Subtotal</span><Tween v={subtotal} /></div>
        <div className="flex justify-between"><span className="text-muted">Delivery</span>{delivery ? <Tween v={delivery} /> : <span className="font-semibold text-leaf">Free</span>}</div>
        <div className="flex justify-between"><span className="text-muted">Weekly box discount</span><span className="font-semibold tabular">– {cedi(discount)}</span></div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-4"><span className="font-semibold">Total</span><Tween v={total - discount} className="text-[26px] text-deep" /></div>
      {cta}
    </div>
  );
}
function Tween({ v, className }: { v: number; className?: string }) {
  return (
    <span className={cx("relative inline-block overflow-hidden font-semibold tabular", className)}>
      <AnimatePresence mode="popLayout" initial={false}><motion.span key={v} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>{cedi(v)}</motion.span></AnimatePresence>
    </span>
  );
}

export function BagView() {
  const { lines, subtotal, delivery, total, count, inc, dec, remove } = useBagLines();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const toast = useToast();
  const farms = [...new Set(lines.map((l) => l.p.farm))];
  const away = Math.max(0, FREE_DELIVERY_AT - subtotal);
  const more = PRODUCTS.filter((p) => farms.includes(p.farm) && !lines.some((l) => baseSlug(l.p) === p.slug) && p.cat !== "packs");
  const suggest = [...more, ...PRODUCTS.filter((p) => !more.includes(p) && !lines.some((l) => baseSlug(l.p) === p.slug) && p.cat !== "packs")].slice(0, 4);
  const apply = () => {
    if (code.trim().toUpperCase() === "FRESH10") { setDiscount(Math.round(subtotal * 0.1)); toast("Code applied. You save 10%."); }
    else { setDiscount(0); toast(code.trim() ? "That code is not valid" : "Enter a promo code first", "danger"); }
  };
  return (
    <>
      <section className="bg-paper pt-[68px] lg:pt-[72px]">
        <Container className="grid gap-8 py-10 md:py-14 lg:grid-cols-[1fr_400px] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-2">
                <SplitWords text="Your bag" className={cx(T.display, "text-deep")} delay={0.05} />
                <span className="text-[16px] text-muted">{count} {count === 1 ? "item" : "items"} from {farms.length} {farms.length === 1 ? "farm" : "farms"}</span>
              </div>
              <Link href={R.shop} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-deep">Keep shopping <Icon name="arrow-up-right" size={18} /></Link>
            </div>

            {lines.length > 0 && (
              <Reveal className="flex flex-col gap-3 rounded-2xl bg-lime-soft px-5 py-4">
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-deep"><Icon name="truck" size={18} />{away > 0 ? `You are ${cedi(away)} away from free delivery` : "Delivery is free on this order"}</span>
                <span className="h-2 overflow-hidden rounded-full bg-white"><motion.span className="block h-full rounded-full bg-leaf" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_AT) * 100)}%` }} transition={{ duration: 0.8, ease: EASE }} /></span>
              </Reveal>
            )}

            {lines.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-deep"><Icon name="shopping-bag" size={26} /></span>
                <span className="text-[19px] font-semibold">Your bag is empty</span>
                <span className="text-muted">Fresh produce from 38 farms is waiting.</span>
                <Button href={R.shop} arrow>Shop fresh produce</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <AnimatePresence initial={false}>
                  {farms.map((fs) => {
                    const f = farmBySlug(fs);
                    return (
                      <motion.div key={fs} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="flex flex-col gap-2.5">
                        <Link href={R.farm(f.slug)} className="inline-flex w-fit items-center gap-2 text-[14px]"><Icon name="sprout" size={16} className="text-leaf" /><span className="font-semibold text-deep hover:underline">{f.name}</span><span className="text-muted">· {f.district} · checked 6 Oct</span></Link>
                        <AnimatePresence initial={false}>
                          {lines.filter((l) => l.p.farm === fs).map((l, i) => (
                            <motion.div key={l.p.slug} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
                              className="flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-white p-3.5 md:flex-nowrap md:p-4">
                              <Link href={linkOf(l.p)} className="shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={productImg(l.p)} alt="" className="h-[72px] w-[72px] rounded-xl object-cover mix-blend-multiply" style={{ background: TINT[l.p.img] }} />
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link href={linkOf(l.p)} className="block truncate text-[17px] font-semibold hover:text-deep">{l.p.name}</Link>
                                <div className="text-[14px] text-muted">{l.p.unit}</div>
                                <div className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-leaf"><Icon name="leaf" size={13} />{l.p.fresh}</div>
                              </div>
                              <div className="flex w-full items-center justify-between gap-4 md:w-auto">
                                <QtyStepper size="S" value={l.qty} onInc={() => inc(l.p)} onDec={() => dec(l.p)} />
                                <div className="w-[110px] text-right"><Tween v={l.p.price * l.qty} className="text-[17px]" /><div className="text-[12px] text-muted">{cedi(l.p.price)} / {l.p.unit}</div></div>
                                <button onClick={() => { remove(l.p); toast(`${l.p.name} removed`, "info"); }} aria-label={`Remove ${l.p.name}`} className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-bg hover:text-danger"><Icon name="trash-2" size={18} /></button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-[96px] lg:self-start">
            <Summary subtotal={subtotal} delivery={delivery} total={total} discount={discount}
              cta={<>
                <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex items-center gap-2 rounded-full bg-paper py-1.5 pl-4 pr-1.5">
                  <Icon name="tag" size={16} className="text-muted" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code (try FRESH10)" aria-label="Promo code" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" />
                  <button className="h-9 rounded-full px-4 text-[14px] font-semibold text-leaf hover:bg-mist">Apply</button>
                </form>
                {lines.length > 0 ? <Button href={R.checkout} arrow full>Go to checkout</Button> : <Button href={R.shop} arrow full>Start shopping</Button>}
                <span className="text-center text-[12px] text-muted">MTN MoMo · Telecel Cash · AT Money · Visa · Mastercard</span>
              </>} />
            <Link href={R.traceInfo} className="group/qr flex items-center gap-4 rounded-3xl bg-deep p-5 text-white">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime text-night transition-transform group-hover/qr:rotate-[-6deg]"><Icon name="qr-code" size={22} /></span>
              <span><span className="block text-[15px] font-semibold">Every item comes with a trace code</span><span className="block text-[13px] text-white/70">Scan it to see the farm, harvest and route.</span></span>
            </Link>
          </div>
        </Container>
      </section>
      {suggest.length > 0 && (
        <section className="py-[72px] md:py-24">
          <Container className="flex flex-col gap-10">
            <Reveal><h2 className={cx(T.h2, "text-deep")}>{more.length ? "Add more from these farms" : "You may also like"}</h2></Reveal>
            <ProductGrid items={suggest} />
          </Container>
        </section>
      )}
    </>
  );
}
