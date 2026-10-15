"use client";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";

/** Seconds since mount, ticking once a second. Starts at 0 on the server and client, so no hydration mismatch. */
export function useTick(ms = 1000, run = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms, run]);
  return t;
}

export function ago(sec: number) {
  if (sec < 45) return "now";
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} min`;
  return `${Math.floor(sec / 3600)} h`;
}

const BOX = { danger: "bg-danger-bg text-danger", warning: "bg-warning-bg text-warning", success: "bg-success-bg text-success", info: "bg-mist text-deep", plain: "bg-paper text-deep" } as const;
export function IconBox({ icon, tone = "info", size = 36 }: { icon: IconName; tone?: keyof typeof BOX; size?: number }) {
  return <span style={{ width: size, height: size }} className={cx("flex shrink-0 items-center justify-center rounded-xl", BOX[tone])}><Icon name={icon} size={Math.round(size * 0.45)} /></span>;
}

/** Primary pill used for header actions that do something on the page (no navigation). */
export function ActionPill({ children, onClick, icon, arrow, variant = "primary", className }: { children: ReactNode; onClick?: () => void; icon?: IconName; arrow?: boolean; variant?: "primary" | "light" | "lime"; className?: string }) {
  const v = { primary: "bg-deep text-white hover:bg-forest", light: "bg-white text-deep hover:bg-mist", lime: "bg-lime text-night hover:bg-leaf-light" }[variant];
  return (
    <button onClick={onClick} className={cx("group/ap inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold transition-[background-color,box-shadow,transform] duration-150 hover:shadow-[var(--shadow-1)] active:scale-[0.97]", v, className)}>
      {icon && <Icon name={icon} size={18} />}{children}
      {arrow && <Icon name="arrow-right" size={18} className="transition-transform duration-200 group-hover/ap:translate-x-[3px]" />}
    </button>
  );
}

/** Controlled switch with the same look as ui Toggle. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx("relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200", on ? "bg-deep" : "bg-line")}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cx("h-5 w-5 rounded-full bg-white shadow", on && "ml-auto")} />
    </button>
  );
}

/** Horizontal bar that grows from the left when in view. Value updates tween (spec §9). */
export function GrowBar({ pct, color = "bg-leaf", track = "bg-mist", h = "h-2", delay = 0 }: { pct: number; color?: string; track?: string; h?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className={cx("w-full overflow-hidden rounded-full", track, h)}>
      <motion.div className={cx("h-full w-full origin-left rounded-full", color)} initial={{ scaleX: 0 }} animate={{ scaleX: inView ? pct / 100 : 0 }} transition={{ duration: reduce ? 0 : 0.9, delay: inView ? delay : 0, ease: EASE }} />
    </div>
  );
}

/** Side card on desktop (inside a relative parent), bottom sheet on phones (spec §8). */
export function DetailCard({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.aside key="side" role="dialog" aria-label={title} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease: EASE }}
            className="absolute left-4 top-16 z-20 hidden max-h-[calc(100%-140px)] w-[320px] flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-5 shadow-[var(--shadow-3)] md:flex">
            <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-deep hover:bg-mist"><Icon name="x" size={18} /></button>
            {children}
          </motion.aside>
          <motion.div key="dim" className="fixed inset-0 z-40 bg-night/30 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside key="sheet" role="dialog" aria-label={title} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.4, ease: EASE }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragEnd={(_, i) => { if (i.offset.y > 80) onClose(); }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[75vh] flex-col gap-3 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[var(--shadow-3)] md:hidden">
            <span className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-line-strong" />
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-deep"><Icon name="x" size={18} /></button>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Small editable value chip (used in Settings). */
export function ValueField({ value, onChange, pre = "", unit = "", label }: { value: string; onChange: (v: string) => void; pre?: string; unit?: string; label: string }) {
  return (
    <label className="flex h-10 shrink-0 items-center rounded-xl bg-paper px-3 text-[15px] font-semibold ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]">
      {pre && <span>{pre}</span>}
      <input aria-label={label} value={value} inputMode="decimal" onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))} style={{ width: `${Math.max(1, value.length) + 0.5}ch` }} className="tabular bg-transparent text-right outline-none" />
      {unit && <span className="whitespace-pre">{unit}</span>}
    </label>
  );
}
