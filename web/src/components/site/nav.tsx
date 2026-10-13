"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV, R } from "@/lib/routes";
import { CATEGORIES, PRODUCTS, productImg } from "@/lib/data";
import { Icon } from "../icon";
import { Button, cx, Pills } from "../ui";
import { BagCount, useBag } from "./bag";

export function Nav({ theme = "overlay" }: { theme?: "overlay" | "light" }) {
  const path = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [sheet, setSheet] = useState(false);
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { setOpen } = useBag();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 80);
    const d = y - last.current;
    if (y > 320 && d > 8 && !mega) setHidden(true);
    else if (d < -4) setHidden(false);
    last.current = y;
  });
  useEffect(() => { setSheet(false); setMega(false); }, [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setSheet(false); setMega(false); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const solid = theme === "light" || scrolled || mega;
  const fg = solid ? "text-ink" : "text-white";

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cx("fixed inset-x-0 top-0 z-50 transition-[background-color,height,box-shadow,border-color] duration-[250ms]", solid ? "glass-light h-[68px] lg:h-[72px] shadow-[0_1px_0_rgb(1_38_31/0.04)]" : "h-16 md:h-[72px] lg:h-[84px] border-b border-white/0")}
        onMouseLeave={() => { clearTimeout(timer.current); timer.current = setTimeout(() => setMega(false), 200); }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8 lg:px-16">
          <Link href={R.home} aria-label="Verdant Foods home" className="relative block h-9 w-[104px] shrink-0 lg:h-10 lg:w-[120px]">
            <Image src={solid ? "/brand/logo-green.png" : "/brand/logo-cream.png"} alt="Verdant Foods" fill sizes="120px" className="object-contain object-left" priority />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {MAIN_NAV.map((n) => {
              const active = path.startsWith(n.href);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  onMouseEnter={() => { clearTimeout(timer.current); if (n.label === "Shop") timer.current = setTimeout(() => setMega(true), 120); else setMega(false); }}
                  className={cx("group/nl relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors", fg, solid ? "hover:bg-mist" : "hover:bg-white/10")}
                >
                  {n.label}
                  <span className={cx("absolute inset-x-4 bottom-1 h-[2px] origin-left rounded-full transition-transform duration-300 ease-[var(--ease-out)]", solid ? "bg-deep" : "bg-lime", active ? "scale-x-100" : "scale-x-0 group-hover/nl:scale-x-100")} />
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Link href={R.search()} aria-label="Search" className={cx("hidden h-11 w-11 items-center justify-center rounded-full transition-colors md:flex", fg, solid ? "hover:bg-mist" : "hover:bg-white/10")}><Icon name="search" /></Link>
            <Link href={R.signIn} aria-label="Account" className={cx("hidden h-11 w-11 items-center justify-center rounded-full transition-colors md:flex", fg, solid ? "hover:bg-mist" : "hover:bg-white/10")}><Icon name="user" /></Link>
            <button data-bag-target onClick={() => setOpen(true)} aria-label="Open bag" className={cx("relative flex h-11 w-11 items-center justify-center rounded-full transition-colors", fg, solid ? "hover:bg-mist" : "hover:bg-white/10")}><Icon name="shopping-bag" /><BagCount /></button>
            <Button href={R.shop} size="M" variant={solid ? "primary" : "light"} className="ml-2 hidden lg:inline-flex">Shop fresh</Button>
            <button onClick={() => setSheet(true)} aria-label="Open menu" className={cx("flex h-11 w-11 items-center justify-center rounded-full lg:hidden", fg)}><Icon name="menu" size={24} /></button>
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[var(--shadow-2)] lg:block"
              onMouseEnter={() => clearTimeout(timer.current)}
            >
              <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_380px] gap-10 px-16 py-8">
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORIES.map((c, i) => (
                    <motion.div key={c.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.35 }}>
                      <Link href={c.slug === "all" ? R.shop : c.slug === "packs" ? R.packs : R.category(c.slug)} className={cx("group/c flex h-[92px] items-end justify-between rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5", c.tint)}>
                        <span className="text-[15px] font-semibold text-ink">{c.label}</span>
                        <Icon name="arrow-up-right" size={18} className={cx("transition-transform group-hover/c:-translate-y-0.5 group-hover/c:translate-x-0.5", c.accent)} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <Link href={R.product()} className="group/p relative overflow-hidden rounded-3xl bg-tomato-soft p-6">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-tomato">Harvest week</div>
                  <div className="mt-2 max-w-[200px] text-[22px] font-semibold leading-tight text-ink">Tomato season is here</div>
                  <div className="mt-2 text-[14px] text-muted">15% off until Sunday</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImg(PRODUCTS[0])} alt="" className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/p:scale-110" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {sheet && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-night px-5 pb-8 pt-4 text-white md:px-8"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.4 }} onDragEnd={(_, i) => { if (i.offset.x > 100) setSheet(false); }}
            role="dialog" aria-label="Menu"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hero-aerial.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]" />
            <div className="relative flex items-center justify-between">
              <div className="relative h-9 w-[104px]"><Image src="/brand/logo-cream.png" alt="Verdant Foods" fill className="object-contain object-left" /></div>
              <button onClick={() => setSheet(false)} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-full bg-forest"><Icon name="x" /></button>
            </div>
            <nav className="relative mt-8 flex flex-col">
              {[...MAIN_NAV, { label: "Stories", href: R.stories }, { label: "Help centre", href: R.help }].map((n, i) => (
                <motion.div key={n.label} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={n.href} className="flex items-center justify-between border-b border-forest py-4 text-[26px] font-medium tracking-[-0.02em] md:text-[32px]">
                    {n.label}<Icon name="arrow-up-right" size={22} className="text-lime" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div className="relative mt-auto flex flex-col gap-4 pt-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.45 }}>
              <div className="glass-dark rounded-3xl p-5">
                <div className="mb-3 text-[13px] text-white/70">Language</div>
                <Pills items={["English", "Twi", "Dagbani", "Dagaare"]} size="S" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Button href={R.shop} variant="lime" arrow full>Shop fresh</Button>
                <Button href={R.signIn} variant="glass" full>Sign in</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
