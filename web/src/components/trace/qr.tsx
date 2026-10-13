"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cx } from "../tokens";

/** A simple QR-like mark (not a real code). */
export function QrGlyph({ size = 64, className }: { size?: number; className?: string }) {
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}><rect x={x} y={y} width="7" height="7" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x={x + 2.2} y={y + 2.2} width="2.6" height="2.6" rx="0.5" fill="currentColor" /></g>
  );
  const dots: [number, number][] = [[10, 1], [12, 3], [10, 5], [13, 7], [1, 10], [4, 11], [7, 10], [10, 10], [12, 12], [10, 13], [14, 10], [11, 15], [14, 14], [16, 12], [16, 16]];
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      {finder(0.7, 0.7)}{finder(10.3, 0.7)}{finder(0.7, 10.3)}
      {dots.map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="1.5" height="1.5" rx="0.3" fill="currentColor" />)}
    </svg>
  );
}

/** Lime scan line that runs top to bottom every 1.8 s (spec §11). */
export function ScanLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div aria-hidden className={cx("pointer-events-none absolute inset-0", className)} initial={{ y: "0%", opacity: 0 }} animate={{ y: ["0%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], repeat: Infinity }}>
      <div className="h-[2px] w-full rounded-full bg-lime shadow-[0_0_14px_3px_rgb(187_234_112/0.7)]" />
      <div className="h-8 w-full -translate-y-full bg-gradient-to-t from-lime/25 to-transparent" />
    </motion.div>
  );
}

/** Viewfinder: four lime corners around the content, with the scan line running inside. */
export function Viewfinder({ children, className, corner = "border-lime" }: { children?: ReactNode; className?: string; corner?: string }) {
  const c = cx("absolute h-6 w-6 rounded-[3px]", corner);
  return (
    <div className={cx("relative overflow-hidden", className)}>
      {children}
      <span className={cx(c, "left-0 top-0 border-l-[3px] border-t-[3px]")} />
      <span className={cx(c, "right-0 top-0 border-r-[3px] border-t-[3px]")} />
      <span className={cx(c, "bottom-0 left-0 border-b-[3px] border-l-[3px]")} />
      <span className={cx(c, "bottom-0 right-0 border-b-[3px] border-r-[3px]")} />
      <ScanLine className="inset-x-2 top-2 bottom-2" />
    </div>
  );
}
