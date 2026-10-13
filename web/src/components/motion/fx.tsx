"use client";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { Children, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { cx } from "../tokens";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 260, damping: 30 };

/* =====================================================================================
 * Media frame FX: scroll parallax (image slower than the page), 1.12 → 1 settle on enter,
 * pointer pan toward the cursor. Values are written as CSS variables on the frame and read
 * by `.vf-media > img|video` in globals.css, so the <img> markup stays exactly as written.
 * ===================================================================================== */
export function useMediaFX<T extends HTMLElement>({ off, depth = 3.5, pan = 1.4 }: { off?: boolean; depth?: number; pan?: number } = {}) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const still = !!reduce || !!off;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], still ? ["0%", "0%"] : [`${-depth}%`, `${depth}%`]);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 }), sy = useSpring(my, { stiffness: 120, damping: 20 });
  const px = useTransform(sx, (v) => `${v}%`), py = useTransform(sy, (v) => `${v}%`);
  const s = useMotionValue(still ? 1 : 1.12);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  useEffect(() => { if (inView && !still) { const c = animate(s, 1, { duration: 1.6, ease: EASE }); return () => c.stop(); } }, [inView, still, s]);
  return {
    ref,
    style: { "--vf-y": y, "--vf-mx": px, "--vf-my": py, "--vf-s": s } as unknown as CSSProperties,
    onPointerMove: (e: RPointerEvent<HTMLElement>) => {
      if (still || e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width - 0.5) * pan * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * pan * 2);
    },
    onPointerLeave: () => { mx.set(0); my.set(0); },
  };
}

/** A rounded frame for a photo or video that gets the full media FX (parallax, settle, pan, hover zoom). */
export function MediaFrame({ children, className, cursor, label }: { children: ReactNode; className?: string; cursor?: "view" | "play"; label?: string }) {
  const fx = useMediaFX<HTMLDivElement>();
  return (
    <motion.div ref={fx.ref} style={fx.style} onPointerMove={fx.onPointerMove} onPointerLeave={fx.onPointerLeave} className={cx("vf-media relative overflow-hidden", className)} data-cursor={cursor} data-cursor-label={label}>
      {children}
    </motion.div>
  );
}

/* =====================================================================================
 * Magnetic pull (desktop pointers only): the element drifts toward the cursor and springs back.
 * ===================================================================================== */
export function useMagnetic(strength = 0.28, max = 10) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 }), sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });
  const clamp = (v: number) => Math.max(-max, Math.min(max, v));
  return {
    style: { x: sx, y: sy } as { x: MotionValue<number>; y: MotionValue<number> },
    onPointerMove: (e: RPointerEvent<HTMLElement>) => {
      if (reduce || e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
      y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
    },
    onPointerLeave: () => { x.set(0); y.set(0); },
  };
}
export function Magnetic({ children, className, strength, max }: { children: ReactNode; className?: string; strength?: number; max?: number }) {
  const m = useMagnetic(strength, max);
  return <motion.span className={cx("inline-flex", className)} style={m.style} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} data-magnetic>{children}</motion.span>;
}

/** Pointer handler that feeds the `.vf-spot` sheen (sets --mx/--my on the element). Cheap: no React state. */
export function spotlight(e: RPointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
  el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  el.style.setProperty("--px", `${((x - 0.5) * 5).toFixed(2)}%`);
  el.style.setProperty("--py", `${((y - 0.5) * 5).toFixed(2)}%`);
}

/* =====================================================================================
 * Number roll: each digit is a reel that rolls into place when seen, and spins once more on hover.
 * ===================================================================================== */
export function RollNumber({ value, className, hover = true }: { value: string; className?: string; hover?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [spin, setSpin] = useState(0);
  const chars = value.split("");
  let di = 0;
  return (
    <span ref={ref} className={cx("tabular inline-flex items-baseline", className)} aria-label={value} role="text"
      onPointerEnter={(e) => { if (hover && e.pointerType === "mouse") setSpin((s) => s + 1); }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i} aria-hidden className="whitespace-pre">{c}</span>;
        const d = Number(c), k = di++;
        const pos = !inView ? 0 : spin % 2 ? 10 + d : d;
        return (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-none" style={{ verticalAlign: "-0.1em" }}>
            <span className="invisible">{c}</span>
            <motion.span className="absolute inset-x-0 top-0 flex flex-col" initial={false}
              animate={{ y: `${-pos * 10 / 2}%` }}
              transition={reduce ? { duration: 0 } : { duration: spin ? 0.9 : 1.3, ease: EASE, delay: (spin ? 0 : 0.1) + k * 0.07 }}>
              {Array.from({ length: 20 }, (_, n) => <span key={n} className="block h-[1em] leading-none">{n % 10}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/* =====================================================================================
 * Marquee: infinite, seamless strip for logos and stats. Pauses on hover. CSS animation only.
 * ===================================================================================== */
export function Marquee({ children, speed = 40, reverse, className, gap = 40, pauseOnHover = true, fade = true }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string; gap?: number; pauseOnHover?: boolean; fade?: boolean }) {
  return (
    <div className={cx("vf-marquee relative flex overflow-hidden", pauseOnHover && "vf-marquee-pause", className)}
      style={fade ? { maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" } : undefined}>
      {[0, 1].map((k) => (
        <div key={k} aria-hidden={k === 1 || undefined} className="vf-marquee-track flex shrink-0 items-center"
          style={{ gap, paddingRight: gap, animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}>
          {children}
        </div>
      ))}
    </div>
  );
}

/* =====================================================================================
 * Scroll-velocity skew for horizontal rows: fast scrolling leans the row a few degrees.
 * ===================================================================================== */
export function ScrollSkew({ children, className, max = 3 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const sv = useSpring(v, { stiffness: 300, damping: 60 });
  const skewY = useTransform(sv, [-3000, 3000], reduce ? [0, 0] : [max, -max], { clamp: true });
  return <motion.div style={{ skewY }} className={className}>{children}</motion.div>;
}

/* =====================================================================================
 * Sticky stacked cards: each card pins under the one before, the earlier ones ease back.
 * ===================================================================================== */
export function StackCards({ children, top = 112, step = 22, space = "14vh", className }: { children: ReactNode; top?: number; step?: number; space?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className={cx("relative", className)}>
      {items.map((c, i) => (
        <StackItem key={i} i={i} n={items.length} p={scrollYProgress} top={top + i * step} space={i < items.length - 1 ? space : "0px"}>{c}</StackItem>
      ))}
    </div>
  );
}
function StackItem({ children, i, n, p, top, space }: { children: ReactNode; i: number; n: number; p: MotionValue<number>; top: number; space: string }) {
  const reduce = useReducedMotion();
  const scale = useTransform(p, [i / n, 1], reduce ? [1, 1] : [1, 1 - (n - 1 - i) * 0.035]);
  const dim = useTransform(p, [i / n, 1], reduce ? [0, 0] : [0, (n - 1 - i) * 0.12]);
  return (
    <div className="sticky" style={{ top, marginBottom: space }}>
      <motion.div style={{ scale, transformOrigin: "50% 0%" }} className="relative">
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-night" style={{ opacity: dim, borderRadius: 24 }} />
      </motion.div>
    </div>
  );
}

export { SPRING };
