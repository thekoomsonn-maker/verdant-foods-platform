"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { EASE } from "@/components/motion";
import { cx } from "@/components/tokens";

export type A1Row = { key: string; cells: ReactNode[] };

/**
 * Selectable table. A grid on desktop, cards on phones. The selected row has a
 * mist highlight that slides between rows (shared layout), rows stagger in at 40 ms.
 */
export function A1Table({ cols, rows, sel, onSel, empty = "Nothing here yet" }: {
  cols: [string, string][]; rows: A1Row[]; sel?: string; onSel?: (k: string) => void; empty?: string;
}) {
  const gid = useId();
  const grid = { gridTemplateColumns: cols.map((c) => c[1]).join(" ") };
  return (
    <LayoutGroup id={gid}>
      <div className="hidden md:block">
        <div style={grid} className="grid items-center gap-3 rounded-xl bg-paper px-4 py-2.5 text-[13px] font-medium text-muted">
          {cols.map(([c]) => <span key={c}>{c}</span>)}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {rows.map((r, i) => {
            const on = sel === r.key;
            return (
              <motion.div
                key={r.key} layout="position"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                role={onSel ? "button" : undefined} tabIndex={onSel ? 0 : undefined}
                onClick={() => onSel?.(r.key)} onKeyDown={(e) => { if (onSel && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSel(r.key); } }}
                style={grid}
                className={cx("relative grid items-center gap-3 border-b border-line px-4 py-3.5 text-[14px] outline-none last:border-0 focus-visible:ring-2 focus-visible:ring-deep", onSel && "cursor-pointer", !on && onSel && "hover:bg-paper/70")}
              >
                {on && <motion.span layoutId="a1-row" className="absolute inset-0 rounded-xl bg-mist" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                {r.cells.map((c, j) => <span key={j} className={cx("relative min-w-0", j === 0 && "font-semibold")}>{c}</span>)}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-muted">{empty}</p>}
      </div>
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r, i) => {
          const on = sel === r.key;
          return (
            <motion.button
              key={r.key} type="button" onClick={() => onSel?.(r.key)}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
              className="relative flex flex-col gap-2 rounded-2xl bg-paper p-3.5 text-left"
            >
              {on && <motion.span layoutId="a1-card" className="absolute inset-0 rounded-2xl bg-mint" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
              <span className="relative flex items-center justify-between gap-2 font-semibold">{r.cells[0]}{r.cells[r.cells.length - 1]}</span>
              <span className="relative flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                {r.cells.slice(1, -1).map((c, j) => <span key={j}>{cols[j + 1][0]}: <span className="text-ink">{c}</span></span>)}
              </span>
            </motion.button>
          );
        })}
        {rows.length === 0 && <p className="py-8 text-center text-muted">{empty}</p>}
      </div>
    </LayoutGroup>
  );
}

/** Pill tabs with counts and a sliding indicator. Controlled. */
export function A1Tabs({ items, value, onChange }: { items: [string, number?][]; value: string; onChange: (v: string) => void }) {
  const gid = useId();
  return (
    <LayoutGroup id={gid}>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {items.map(([t, n]) => {
          const on = t === value;
          return (
            <button key={t} onClick={() => onChange(t)} className={cx("relative shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors duration-200", on ? "text-white" : "bg-white text-deep hover:bg-mint")}>
              {on && <motion.span layoutId="a1-tab" className="absolute inset-0 rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{t}{n !== undefined && <span className="tabular"> {n}</span>}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/** Underline tabs, controlled, with counts. */
export function A1Under({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  const gid = useId();
  return (
    <LayoutGroup id={gid}>
      <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line md:gap-8">
        {items.map((it) => (
          <button key={it} onClick={() => onChange(it)} className={cx("relative shrink-0 pb-3 text-[15px] font-semibold transition-colors", it === value ? "text-deep" : "text-muted hover:text-ink")}>
            {it}
            {it === value && <motion.span layoutId="a1-under" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-deep" />}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** Side detail card that cross-fades when the selection changes. */
export function A1Swap({ k, children, className }: { k: string; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Small tinted chip with an icon (counts like "3 plots mapped"). */
export function A1Tag({ icon, children, tone = "paper" }: { icon?: IconName; children: ReactNode; tone?: "paper" | "success" | "info" | "danger" | "warning" }) {
  const C = { paper: "bg-paper text-ink", success: "bg-success-bg text-success", info: "bg-info-bg text-info", danger: "bg-danger-bg text-danger", warning: "bg-warning-bg text-warning" }[tone];
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium", C)}>{icon && <Icon name={icon} size={14} />}{children}</span>;
}

/** Text link styled like the panel header links. */
export function A1Link({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-[14px] font-semibold text-leaf transition-colors hover:text-deep">{children}</Link>;
}
