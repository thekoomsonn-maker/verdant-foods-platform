"use client";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role=button], [role=switch], [role=tab], summary, label, select, [data-magnetic]";
const NATIVE = "input, textarea, select, [contenteditable=true], .maplibregl-map, [data-cursor=native]";

/** Cursor follower for fine pointers: a lime dot and a soft trailing disc that grows over links and buttons,
 *  and turns into a lime "View" / "Play" bubble over elements with `data-cursor="view|play"` (custom text: `data-cursor-label`).
 *  Off on touch devices and with reduced motion (the native cursor stays). Text fields and maps keep the native cursor. */
export function Cursor() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setOn(fine.matches && !rm.matches);
    upd();
    fine.addEventListener("change", upd); rm.addEventListener("change", upd);
    return () => { fine.removeEventListener("change", upd); rm.removeEventListener("change", upd); };
  }, []);
  return on ? <Follower /> : null;
}

type Mode = "idle" | "link" | "label" | "native";

function Follower() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 }), ry = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("View");
  const [shown, setShown] = useState(false);
  const [down, setDown] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX); y.set(e.clientY);
      if (!shownRef.current) { shownRef.current = true; setShown(true); rx.jump(e.clientX); ry.jump(e.clientY); }
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      if (t.closest(NATIVE)) return setMode("native");
      const c = t.closest("[data-cursor]");
      if (c) { const k = c.getAttribute("data-cursor"); setLabel(c.getAttribute("data-cursor-label") || (k === "play" ? "Play" : "View")); return setMode("label"); }
      setMode(t.closest(INTERACTIVE) ? "link" : "idle");
    };
    const leave = () => { shownRef.current = false; setShown(false); };
    const dn = () => setDown(true), up = () => setDown(false);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerdown", dn, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", dn);
      document.removeEventListener("pointerup", up);
      root.removeEventListener("pointerleave", leave);
    };
  }, [x, y, rx, ry]);

  const hidden = !shown || mode === "native";
  const ring = mode === "link" ? 1.7 : mode === "label" ? 0 : 1;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="absolute -left-[18px] -top-[18px] h-9 w-9 rounded-full"
          animate={{ scale: hidden ? 0 : down ? ring * 0.85 : ring, backgroundColor: mode === "link" ? "rgba(187,234,112,0.28)" : "rgba(95,159,13,0.16)" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        />
        <AnimatePresence>
          {mode === "label" && !hidden && (
            <motion.div key="bubble"
              className="absolute -left-[42px] -top-[42px] flex h-[84px] w-[84px] items-center justify-center rounded-full bg-lime text-[13px] font-semibold text-night shadow-[0_10px_30px_rgb(1_38_31/0.25)]"
              initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: down ? 0.9 : 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}>
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-lime shadow-[0_0_0_1px_rgb(1_38_31/0.18),0_2px_6px_rgb(1_38_31/0.25)]"
          animate={{ scale: hidden || mode === "label" ? 0 : mode === "link" ? 0.6 : 1 }}
          transition={{ duration: 0.18 }}
        />
      </motion.div>
    </div>
  );
}
