"use client";
import { animate, AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../icon";
import { Button, Status, type Tone } from "../ui";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { TINT } from "@/lib/data";

/** Product photo on its tinted well. */
export function Thumb({ img, size = 48, className }: { img: string; size?: number; className?: string }) {
  return (
    <span className={cx("relative inline-block shrink-0 overflow-hidden rounded-xl", className)} style={{ width: size, height: size, background: TINT[img] ?? "#F2F7F4" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/products/${img}.jpg`} alt="" className="h-full w-full object-cover mix-blend-multiply" loading="lazy" />
    </span>
  );
}

/** A button whose only result is a toast (no page behind it). */
export function ToastButton({ msg, children, variant = "primary", size = "M", icon, arrow, tone = "success", className }: { msg: string; children: ReactNode; variant?: "primary" | "secondary" | "light" | "lime" | "glass" | "ghost"; size?: "L" | "M" | "S"; icon?: IconName; arrow?: boolean; tone?: "success" | "info"; className?: string }) {
  const toast = useToast();
  return <Button variant={variant} size={size} icon={icon} arrow={arrow} className={className} onClick={() => toast(msg, tone)}>{children}</Button>;
}

/** Underline tabs with a sliding indicator; keys are stable while labels (counts) change. */
export function UTabs({ items, value, onChange, className }: { items: [string, string][]; value: string; onChange: (k: string) => void; className?: string }) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div role="tablist" className={cx("no-scrollbar flex gap-6 overflow-x-auto border-b border-line md:gap-8", className)}>
        {items.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={k === value} onClick={() => onChange(k)} className={cx("relative shrink-0 pb-3 text-[16px] font-semibold transition-colors", k === value ? "text-deep" : "text-muted hover:text-ink")}>
            {l}
            {k === value && <motion.span layoutId="utab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** Number that tweens to a new value over 250 ms instead of jumping (spec §9). */
export function Tween({ value, fmt, className }: { value: number; fmt: (n: number) => string; className?: string }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setShown(value); prev.current = value; return; }
    const c = animate(prev.current, value, { duration: 0.45, ease: EASE, onUpdate: setShown });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <span className={cx("tabular", className)}>{fmt(shown)}</span>;
}

/** Live countdown. Renders the static hour count on the server, then ticks. */
export function Countdown({ hours, prefix = "Reply due in", tone = "warning" }: { hours: number; prefix?: string; tone?: "warning" | "success" }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = Date.now() + hours * 3600_000 - 7 * 60_000;
    const t = () => setLeft(Math.max(0, end - Date.now()));
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, [hours]);
  let txt = `${prefix} ${hours} h`;
  if (left !== null) {
    const h = Math.floor(left / 3600_000), m = Math.floor((left % 3600_000) / 60_000), s = Math.floor((left % 60_000) / 1000);
    txt = `${prefix} ${h} h ${String(m).padStart(2, "0")} m ${String(s).padStart(2, "0")} s`;
  }
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium", tone === "warning" ? "bg-warning-bg text-warning" : "bg-success-bg text-success")}>
      <Icon name="timer" size={15} /><span className="tabular">{txt}</span>
    </span>
  );
}

/** Dropdown used as a form field or a filter chip. */
export function Select({ value, options, onChange, variant = "field", icon, label, className, active }: { value: string; options: string[]; onChange: (v: string) => void; variant?: "field" | "chip" | "mini"; icon?: IconName; label?: string; className?: string; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", off); document.removeEventListener("keydown", esc); };
  }, [open]);
  const btn = variant === "field"
    ? "flex h-[52px] w-full items-center gap-2.5 rounded-xl bg-paper px-4 text-left text-[16px] ring-1 ring-transparent transition hover:bg-mist focus-visible:ring-deep"
    : variant === "chip"
      ? cx("flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors", active ? "bg-deep text-white" : "bg-white text-deep hover:bg-mint")
      : "flex h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-[14px] font-medium text-ink hover:bg-mist";
  return (
    <div ref={ref} className={cx("relative", variant === "field" && "w-full", className)}>
      {label && <span className="mb-2 block text-[14px] font-semibold text-ink">{label}</span>}
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={btn}>
        {icon && <Icon name={icon} size={18} className={variant === "field" ? "shrink-0 text-muted" : ""} />}
        <span className="flex-1 truncate">{value}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex"><Icon name="chevron-down" size={variant === "mini" ? 15 : 18} /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul role="listbox" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2, ease: EASE }}
            className="absolute left-0 z-40 mt-2 max-h-[280px] min-w-full origin-top overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)]">
            {options.map((o) => (
              <li key={o}>
                <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); }} className={cx("flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors", o === value ? "bg-mist font-semibold text-deep" : "hover:bg-paper")}>
                  {o}{o === value && <Icon name="check" size={16} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Controlled text input in the house style. */
export function Input({ label, value, onChange, icon, placeholder, type = "text", area, className, suffix }: { label?: string; value: string; onChange: (v: string) => void; icon?: IconName; placeholder?: string; type?: string; area?: boolean; className?: string; suffix?: string }) {
  return (
    <label className={cx("flex w-full flex-col gap-2", className)}>
      {label && <span className="text-[14px] font-semibold text-ink">{label}</span>}
      <span className={cx("flex w-full gap-2.5 rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]", area ? "items-start py-3.5" : "h-[52px] items-center")}>
        {icon && <Icon name={icon} size={18} className="shrink-0 text-muted" />}
        {area
          ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full resize-none bg-transparent text-[16px] outline-none placeholder:text-muted" />
          : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-muted" />}
        {suffix && <span className="shrink-0 text-[14px] text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

const TONES: Record<string, Tone> = {
  Waiting: "warning", Countered: "info", Accepted: "success", Closed: "neutral", "On the way": "info", Packed: "success", Delivered: "neutral", "Claim open": "warning",
  "To pay": "warning", "Due today": "danger", Paid: "success", Active: "success", Pending: "warning", Open: "warning", "With farm": "info", Credited: "success", Replaced: "success",
  Received: "success",
};
/** Status pill with a soft cross-fade when the status text changes. */
export function StatusFor({ s }: { s: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="inline-flex">
        <Status tone={TONES[s] ?? "neutral"}>{s}</Status>
      </motion.span>
    </AnimatePresence>
  );
}

/** Self-drawing check (spec §10). */
export function DrawCheck({ size = 72 }: { size?: number }) {
  return (
    <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35, ease: EASE }} className="flex items-center justify-center rounded-full bg-lime text-night" style={{ width: size, height: size }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: EASE }} />
      </svg>
    </motion.span>
  );
}

export const ghs = (n: number, d = 0) => `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const perKg = (n: number) => `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}/kg`;
