"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { productImg, TINT, type Product } from "@/lib/data";

/** Controlled switch that reports changes (the shared Toggle keeps its state private). */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cx("relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep", on ? "bg-deep" : "bg-line-strong")}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cx("h-5 w-5 rounded-full bg-white shadow", on && "ml-auto")} />
    </button>
  );
}

/** Product photo on its tinted well. */
export function Thumb({ p, size = 44, className }: { p: Product; size?: number; className?: string }) {
  return (
    <span className={cx("relative inline-block shrink-0 overflow-hidden rounded-xl", className)} style={{ width: size, height: size, background: TINT[p.img] ?? "#F2F7F4" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={productImg(p)} alt="" className="h-full w-full object-cover mix-blend-multiply" loading="lazy" />
    </span>
  );
}

/** Overlapping product photos for an order. */
export function Thumbs({ items, max = 4, size = 44 }: { items: Product[]; max?: number; size?: number }) {
  const more = items.length - max;
  return (
    <span className="flex items-center">
      {items.slice(0, max).map((p, i) => <Thumb key={p.slug + i} p={p} size={size} className={cx("ring-2 ring-white", i > 0 && "-ml-3")} />)}
      {more > 0 && <span className="-ml-3 flex items-center justify-center rounded-xl bg-mist text-[13px] font-semibold text-deep ring-2 ring-white" style={{ width: size, height: size }}>+{more}</span>}
    </span>
  );
}

export function CardHead({ title, href, link, children }: { title: string; href?: string; link?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-semibold md:text-[20px]">{title}</h2>
      {href && link && <Link href={href} className="group/ch inline-flex items-center gap-1 text-[14px] font-semibold text-leaf">{link}<Icon name="arrow-up-right" size={16} className="transition-transform group-hover/ch:-translate-y-0.5 group-hover/ch:translate-x-0.5" /></Link>}
      {children}
    </div>
  );
}

/** Check that draws itself (spec §10). */
export function DrawnCheck({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden>
      <motion.circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="M17 29l7 7 15-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  );
}
