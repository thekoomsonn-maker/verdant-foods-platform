"use client";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type HTMLMotionProps } from "motion/react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { Children, Fragment, useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_IO = [0.65, 0, 0.35, 1] as const;

/** Lenis smooth scroll on public pages only (spec §3). */
export function SmoothScroll() {
  const path = usePathname();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || path.startsWith("/admin") || path.startsWith("/b2b")) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let id = 0;
    const raf = (t: number) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, [path, reduce]);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  return null;
}

/** Fade and rise when in view. Once only. */
export function Reveal({ children, delay = 0, y = 16, className, as = "div", amount = 0.2 }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" | "span"; amount?: number }) {
  const reduce = useReducedMotion();
  const C = motion[as] as typeof motion.div;
  return (
    <C className={className} initial={reduce ? { opacity: 0 } : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount }} transition={{ duration: reduce ? 0.15 : 0.7, delay, ease: EASE }}>
      {children}
    </C>
  );
}

/** Children appear one after another (60 ms). Max 8 staggered, rest together. */
export function Stagger({ children, className, gap = 0.06, y = 20 }: { children: ReactNode; className?: string; gap?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      {Children.map(children, (c, i) => (
        <motion.div
          className="contents-child"
          variants={{ hidden: reduce ? { opacity: 0 } : { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: Math.min(i, 8) * gap } } }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Hero headline: words rise inside a mask, staggered 40 ms. */
export function SplitWords({ text, className, delay = 0.15, as = "h1", inView }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" | "p"; inView?: boolean }) {
  const reduce = useReducedMotion();
  const C = motion[as] as typeof motion.h1;
  const words = text.split(" ");
  return (
    <C className={className} initial="hidden" {...(inView ?? as !== "h1" ? { whileInView: "show", viewport: { once: true, amount: 0.5 } } : { animate: "show" })} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
        {i > 0 && " "}
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{ hidden: reduce ? { opacity: 0 } : { y: "105%" }, show: { y: 0, opacity: 1, transition: { duration: reduce ? 0.15 : 0.8, ease: EASE, delay: delay + i * 0.04 } } }}
          >
            {w}
          </motion.span>
        </span>
        </Fragment>
      ))}
    </C>
  );
}

/** Count up from 0 when in view. */
export function CountUp({ value, className, duration = 1.2 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const m = value.match(/^([^\d-]*)(-?[\d,.]+)(.*)$/);
  const [out, setOut] = useState(m ? m[1] + "0" + m[3] : value);
  const prev = useRef(0);
  useEffect(() => {
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] || "").length;
    if (!inView) return;
    if (reduce) { setOut(value); return; }
    const from = prev.current; prev.current = target;
    const c = animate(from, target, { duration: from ? 0.5 : duration, ease: EASE, onUpdate: (v) => setOut(m[1] + v.toLocaleString("en-GH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + m[3]) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);
  return <span ref={ref} className={`tabular ${className ?? ""}`}>{out}</span>;
}

/** Background image that moves slower than the page (spec §5). */
export function ParallaxImage({ src, alt = "", speed = 0.2, className, overlay, priority }: { src: string; alt?: string; speed?: number; className?: string; overlay?: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [`-${speed * 50}%`, `${speed * 50}%`]);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="absolute -inset-y-[12%] inset-x-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" fetchPriority={priority ? "high" : "auto"} />
      </motion.div>
      {overlay && <div className="absolute inset-0" style={{ background: overlay }} />}
    </div>
  );
}

/** Image reveal: clip-path wipe from the bottom. The observer sits on an unclipped wrapper (a clipped target never intersects). */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} style={{ display: undefined }}>
      <motion.div
        className="h-full w-full [display:inherit] [flex-direction:inherit] [align-items:inherit] [justify-content:inherit] [gap:inherit]"
        variants={{ hidden: reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }, show: reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Pointer tilt, desktop only. */
export function Tilt({ children, className, max = 2 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 260, damping: 30 }), sry = useSpring(ry, { stiffness: 260, damping: 30 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2); rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2); }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/** 2px lime reading bar. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return <motion.div style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-lime" />;
}

export function FadeIn(props: HTMLMotionProps<"div">) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: EASE }} {...props} />;
}
