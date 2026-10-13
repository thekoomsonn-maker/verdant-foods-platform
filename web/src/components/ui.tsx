"use client";
import Link from "next/link";
import { motion, LayoutGroup } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { PROOF, type Proof } from "@/lib/data";
import { CountUp } from "./motion";

export { cx, T } from "./tokens";
import { cx, T } from "./tokens";

/* ---------- Layout ---------- */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-[1440px] px-5 md:px-8 lg:px-16", className)}>{children}</div>;
}
export function Section({ children, className, bg, id, tight }: { children: ReactNode; className?: string; bg?: string; id?: string; tight?: boolean }) {
  return (
    <section id={id} className={cx(bg, tight ? "py-14 md:py-20" : "py-[72px] md:py-24 lg:py-[120px]")}>
      <Container className={className}>{children}</Container>
    </section>
  );
}
export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em]", light ? "text-lime" : "text-leaf")}>
      <span className={cx("h-1.5 w-1.5 rounded-full", light ? "bg-lime" : "bg-leaf")} />
      {children}
    </span>
  );
}
export function Head({ title, sub, light, center, className }: { title: string; sub?: string; light?: boolean; center?: boolean; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-4", !center && "lg:flex-row lg:items-end lg:justify-between lg:gap-24", center && "items-center text-center", className)}>
      <h2 className={cx(T.h2, "max-w-[640px]", light ? "text-white" : "text-deep")}>{title}</h2>
      {sub && <p className={cx(T.lead, "max-w-[460px]", light ? "text-white/75" : "text-muted")}>{sub}</p>}
    </div>
  );
}

/* ---------- Buttons ---------- */
type BtnVariant = "primary" | "secondary" | "light" | "lime" | "glass" | "ghost" | "danger";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-deep text-white hover:bg-forest",
  secondary: "bg-mist text-deep hover:bg-mint",
  light: "bg-white text-deep hover:bg-mist",
  lime: "bg-lime text-night hover:bg-leaf-light",
  glass: "glass text-white hover:bg-white/25",
  ghost: "text-deep hover:bg-mist",
  danger: "bg-danger text-white hover:brightness-110",
};
export function Button({ children, href, variant = "primary", size = "L", arrow, icon, full, className, onClick, type = "button" }: {
  children: ReactNode; href?: string; variant?: BtnVariant; size?: "L" | "M" | "S"; arrow?: boolean; icon?: IconName; full?: boolean; className?: string; onClick?: () => void; type?: "button" | "submit";
}) {
  const cls = cx(
    "group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,box-shadow,transform,filter] duration-150 ease-[var(--ease-out)] hover:shadow-[var(--shadow-1)] active:scale-[0.97]",
    size === "L" ? "h-12 px-[26px] text-[16px]" : size === "M" ? "h-10 px-5 text-[14px]" : "h-8 px-3.5 text-[13px]",
    BTN[variant], full && "w-full", className,
  );
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "L" ? 20 : 18} />}
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" size={size === "L" ? 20 : 18} className="transition-transform duration-200 group-hover/btn:translate-x-[3px]" />}
    </>
  );
  if (href) return <Link href={href} className={cls} onClick={onClick}>{inner}</Link>;
  return <button type={type} className={cls} onClick={onClick}>{inner}</button>;
}
export function IconButton({ name, href, label, className, onClick, badge }: { name: IconName; href?: string; label: string; className?: string; onClick?: () => void; badge?: ReactNode }) {
  const cls = cx("relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150", className ?? "bg-mist text-deep hover:bg-mint");
  const inner = (<><Icon name={name} size={20} />{badge}</>);
  return href ? <Link href={href} aria-label={label} className={cls}>{inner}</Link> : <button aria-label={label} onClick={onClick} className={cls}>{inner}</button>;
}
export function ArrowLink({ children, href, light }: { children: ReactNode; href: string; light?: boolean }) {
  return (
    <Link href={href} className={cx("group/al inline-flex items-center gap-1.5 text-[15px] font-semibold", light ? "text-lime" : "text-deep")}>
      {children}
      <Icon name="arrow-up-right" size={18} className="transition-transform duration-200 group-hover/al:-translate-y-0.5 group-hover/al:translate-x-0.5" />
    </Link>
  );
}

/* ---------- Chips, status, proof ---------- */
export function Chip({ children, icon, className }: { children: ReactNode; icon?: IconName; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium", className ?? "bg-mist text-deep")}>{icon && <Icon name={icon} size={16} />}{children}</span>;
}
export function GlassChip({ children, icon, dot }: { children: ReactNode; icon?: IconName; dot?: boolean }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-white">
      {dot && <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />}
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}
const TONE = { success: "bg-success-bg text-success", warning: "bg-warning-bg text-warning", danger: "bg-danger-bg text-danger", info: "bg-info-bg text-info", neutral: "bg-mist text-muted" } as const;
export type Tone = keyof typeof TONE;
export function Status({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium", TONE[tone])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}
export function ProofChip({ level }: { level: Proof }) {
  const p = PROOF[level];
  const icon = level === 3 ? "badge-check" : level === 2 ? "user-check" : "smartphone";
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium", TONE[p.tone])}><Icon name={icon} size={14} />{p.label}</span>;
}

/* ---------- Pills with sliding indicator ---------- */
export function Pills({ items, value, onChange, className, light, size = "M" }: { items: string[]; value?: string; onChange?: (v: string) => void; className?: string; light?: boolean; size?: "M" | "S" }) {
  const [v, setV] = useState(value ?? items[0]);
  const id = useState(() => Math.random().toString(36).slice(2))[0];
  return (
    <LayoutGroup id={id}>
      <div className={cx("no-scrollbar flex gap-2 overflow-x-auto", className)}>
        {items.map((it) => {
          const on = it === v;
          return (
            <button key={it} onClick={() => { setV(it); onChange?.(it); }} className={cx("relative shrink-0 rounded-full font-semibold transition-colors duration-200", size === "M" ? "px-4 py-2.5 text-[14px]" : "px-3 py-2 text-[13px]", on ? "text-white" : light ? "bg-white text-deep hover:bg-mint" : "bg-mist text-deep hover:bg-mint")}>
              {on && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{it}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ---------- Underline tabs ---------- */
export function Tabs({ items, value, onChange, className }: { items: string[]; value?: string; onChange?: (v: string) => void; className?: string }) {
  const [v, setV] = useState(value ?? items[0]);
  const id = useState(() => Math.random().toString(36).slice(2))[0];
  return (
    <LayoutGroup id={id}>
      <div className={cx("no-scrollbar flex gap-6 overflow-x-auto border-b border-line md:gap-8", className)}>
        {items.map((it) => (
          <button key={it} onClick={() => { setV(it); onChange?.(it); }} className={cx("relative shrink-0 pb-3 text-[15px] font-semibold transition-colors", it === v ? "text-deep" : "text-muted hover:text-ink")}>
            {it}
            {it === v && <motion.span layoutId="tab" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-deep" />}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

/* ---------- Glass stat ---------- */
export function GlassStat({ n, l, dark = true, className }: { n: string; l: string; dark?: boolean; className?: string }) {
  return (
    <div className={cx(dark ? "glass-dark" : "glass", "rounded-[20px] px-5 py-4 text-white md:px-7 md:py-6", className)}>
      <div className="text-[28px] font-medium leading-none tracking-[-0.02em] md:text-[36px]"><CountUp value={n} /></div>
      <div className="mt-2 text-[14px] text-white/75">{l}</div>
    </div>
  );
}

/* ---------- Breadcrumbs ---------- */
export function Crumbs({ items, light }: { items: [string, string?][]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[14px]">
      {items.map(([t, h], i) => (
        <span key={t} className="inline-flex items-center gap-2">
          {i > 0 && <Icon name="chevron-right" size={14} className={light ? "text-white/60" : "text-muted"} />}
          {h ? <Link href={h} className={cx("transition-colors", light ? "text-white/70 hover:text-white" : "text-muted hover:text-deep")}>{t}</Link> : <span className={light ? "text-white" : "text-ink"}>{t}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ---------- Form bits ---------- */
export function Field({ label, placeholder, value, icon, trail, area, className, type = "text" }: { label?: string; placeholder?: string; value?: string; icon?: IconName; trail?: IconName; area?: boolean; className?: string; type?: string }) {
  return (
    <label className={cx("flex w-full flex-col gap-2", className)}>
      {label && <span className="text-[14px] font-semibold text-ink">{label}</span>}
      <span className={cx("flex w-full gap-2.5 rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]", area ? "items-start py-3.5" : "h-[52px] items-center")}>
        {icon && <Icon name={icon} size={18} className="shrink-0 text-muted" />}
        {area ? <textarea defaultValue={value} placeholder={placeholder} rows={4} className="w-full resize-none bg-transparent text-[16px] outline-none placeholder:text-muted" /> : <input type={type} defaultValue={value} placeholder={placeholder} className="w-full bg-transparent text-[16px] outline-none placeholder:text-muted" />}
        {trail && <Icon name={trail} size={18} className="shrink-0 text-muted" />}
      </span>
    </label>
  );
}
export function Toggle({ on: init = false, label }: { on?: boolean; label?: string }) {
  const [on, setOn] = useState(init);
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => setOn(!on)} className={cx("relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200", on ? "bg-deep" : "bg-line")}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cx("h-5 w-5 rounded-full bg-white shadow", on && "ml-auto")} />
    </button>
  );
}
export function Check({ on: init = false, label, children }: { on?: boolean; label?: string; children?: ReactNode }) {
  const [on, setOn] = useState(init);
  return (
    <button onClick={() => setOn(!on)} className="flex w-full items-center gap-3 text-left">
      <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors", on ? "bg-deep" : "bg-paper ring-1 ring-line-strong")}>{on && <Icon name="check" size={14} className="text-white" />}</span>
      {label && <span className="text-[15px]">{label}</span>}
      {children}
    </button>
  );
}
export function Avatar({ initials, className, size = 40 }: { initials: string; className?: string; size?: number }) {
  return <span style={{ width: size, height: size }} className={cx("inline-flex shrink-0 items-center justify-center rounded-full text-[13px] font-semibold", className ?? "bg-mist text-deep")}>{initials}</span>;
}
export function KV({ k, v, light }: { k: string; v: ReactNode; light?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><span className={cx("text-[14px]", light ? "text-white/70" : "text-muted")}>{k}</span><span className={cx("text-[14px] font-semibold", light ? "text-white" : "text-ink")}>{v}</span></div>;
}
export function Checks({ items, light }: { items: string[]; light?: boolean }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((s) => (
        <li key={s} className="flex items-center gap-3">
          <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", light ? "bg-lime text-night" : "bg-mist text-deep")}><Icon name="check" size={16} /></span>
          <span className={cx(T.body, light && "text-white")}>{s}</span>
        </li>
      ))}
    </ul>
  );
}
