"use client";
import { motion, useInView } from "motion/react";
import { useId, useRef, useState } from "react";
import { cx } from "./ui";
import { EASE } from "./motion";

function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Area chart: draws left to right, end dot pops, crosshair on hover (spec §9). */
export function AreaChart({ values, compare, labels, tip, height = 220, color = "#024639", fill = "#5F9F0D", fmt = (v: number) => String(v) }: {
  values: number[]; compare?: number[]; labels?: string[]; tip?: [string, string]; height?: number; color?: string; fill?: string; fmt?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const id = useId().replace(/:/g, "");
  const [hi, setHi] = useState<number | null>(null);
  const W = 1000, H = height, pad = 12;
  const all = [...values, ...(compare ?? [])]; const mx = Math.max(...all) * 1.08, mn = Math.min(...all) * 0.85;
  const pt = (v: number, i: number, n: number): [number, number] => [(i / (n - 1)) * W, pad + (H - pad * 2) * (1 - (v - mn) / (mx - mn))];
  const P = values.map((v, i) => pt(v, i, values.length));
  const line = smooth(P);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const C = compare?.map((v, i) => pt(v, i, compare.length));
  const end = P[P.length - 1];
  const sel = hi ?? null;
  return (
    <div ref={ref} className="relative w-full select-none" onMouseLeave={() => setHi(null)}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHi(Math.round(((e.clientX - r.left) / r.width) * (values.length - 1))); }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
        <defs><linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={fill} stopOpacity="0.28" /><stop offset="1" stopColor={fill} stopOpacity="0" /></linearGradient>
          <clipPath id={`c${id}`}><motion.rect x="0" y="0" height={H} initial={{ width: 0 }} animate={{ width: inView ? W : 0 }} transition={{ duration: 0.9, ease: EASE }} /></clipPath></defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#E2E8E4" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {C && <path d={smooth(C)} fill="none" stroke="#C9D3CE" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />}
        <g clipPath={`url(#c${id})`}>
          <path d={area} fill={`url(#g${id})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </g>
        {sel !== null && <line x1={P[sel][0]} x2={P[sel][0]} y1="0" y2={H} stroke="#024639" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>
      <motion.span initial={{ scale: 0 }} animate={{ scale: inView ? 1 : 0 }} transition={{ delay: 0.9, type: "spring", stiffness: 500, damping: 20 }}
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${(end[0] / W) * 100}%`, top: end[1], background: color }} />
      {(sel !== null || tip) && (
        <motion.div key={sel ?? "tip"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: inView ? 1 : 0, y: 0 }} transition={{ delay: sel !== null ? 0 : 1, duration: 0.25 }}
          className="pointer-events-none absolute -translate-x-full -translate-y-[calc(100%+12px)] rounded-xl bg-night px-3 py-2 text-white shadow-[var(--shadow-2)]"
          style={{ left: `${((sel !== null ? P[sel][0] : end[0]) / W) * 100}%`, top: sel !== null ? P[sel][1] : end[1] }}>
          <div className="whitespace-nowrap text-[14px] font-semibold tabular">{sel !== null ? fmt(values[sel]) : tip?.[0]}</div>
          <div className="whitespace-nowrap text-[12px] text-white/70">{sel !== null ? labels?.[Math.round((sel / (values.length - 1)) * ((labels?.length ?? 1) - 1))] : tip?.[1]}</div>
        </motion.div>
      )}
      {labels && <div className="mt-3 flex justify-between text-[12px] text-muted">{labels.map((l) => <span key={l}>{l}</span>)}</div>}
    </div>
  );
}

export function Legend({ items, light, vertical }: { items: [string, string, string?][]; light?: boolean; vertical?: boolean }) {
  return (
    <div className={cx("flex gap-x-5 gap-y-2.5 text-[14px]", vertical ? "flex-col" : "flex-wrap")}>
      {items.map(([c, l, v]) => (
        <span key={l} className={cx("inline-flex items-center gap-2", vertical && "justify-between")}>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} /><span className={light ? "text-white/80" : "text-muted"}>{l}</span></span>
          {v && <span className={cx("font-semibold tabular", light ? "text-white" : "text-ink")}>{v}</span>}
        </span>
      ))}
    </div>
  );
}

/** Donut sweeps clockwise. */
export function Donut({ parts, size = 160, label, sub }: { parts: [number, string][]; size?: number; label?: string; sub?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const total = parts.reduce((a, p) => a + p[0], 0); const r = 42, c = 2 * Math.PI * r; let acc = 0;
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F2F7F4" strokeWidth="12" />
        {parts.map(([v, col], i) => {
          const len = (v / total) * c; const off = acc; acc += len;
          return <motion.circle key={i} cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="12" strokeDasharray={`${Math.max(len - 1.2, 0)} ${c}`} initial={{ strokeDashoffset: -off + len }} animate={{ strokeDashoffset: inView ? -off : -off + len }} transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }} />;
        })}
      </svg>
      {label && <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[24px] font-semibold tabular">{label}</span>{sub && <span className="text-[12px] text-muted">{sub}</span>}</div>}
    </div>
  );
}

/** Bars grow from the baseline. */
export function Bars({ values, labels, hi, height = 140, color = "#E4EFE8", hiColor = "#024639" }: { values: number[]; labels: string[]; hi?: number; height?: number; color?: string; hiColor?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mx = Math.max(...values);
  return (
    <div ref={ref} className="flex items-end gap-2" style={{ height: height + 26 }}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <motion.div className="w-full rounded-lg" style={{ background: i === hi ? hiColor : color, height: Math.max(6, (v / mx) * height), originY: 1 }} initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }} transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }} />
          <span className={cx("text-[12px]", i === hi ? "font-semibold text-ink" : "text-muted")}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function Spark({ values, color = "#5F9F0D", w = 72, h = 28 }: { values: number[]; color?: string; w?: number; h?: number }) {
  const mx = Math.max(...values), mn = Math.min(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, 2 + (h - 4) * (1 - (v - mn) / (mx - mn || 1))] as [number, number]);
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><motion.path d={smooth(pts)} fill="none" stroke={color} strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} /></svg>;
}

/** Thin progress bar that fills when in view. */
export function Progress({ pct, color = "bg-leaf", track = "bg-mist", h = "h-2" }: { pct: number; color?: string; track?: string; h?: string }) {
  return (
    <div className={cx("w-full overflow-hidden rounded-full", track, h)}>
      <motion.div className={cx("h-full rounded-full", color)} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} />
    </div>
  );
}
