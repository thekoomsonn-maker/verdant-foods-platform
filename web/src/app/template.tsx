"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const EASE_IO = [0.65, 0, 0.35, 1] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Last path seen on the client. Never set on the server, so SSR and hydration always render without the curtain. */
let lastPath: string | null = null;
const area = (p: string) => p.split("/")[1] ?? "";
const PORTALS = new Set(["admin", "b2b", "account"]);

/** Page transition (spec §3, v2). On client navigations a deep-green curtain carrying the Verdant mark sits over the new page
 *  and wipes upward (clip-path) with a lime edge trailing it. The wrapper itself never gets a transform, so the fixed nav
 *  inside the page keeps working. No curtain on first load, between pages of the same portal, or with reduced motion. */
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [curtain, setCurtain] = useState(() => {
    if (typeof window === "undefined") return false;
    const prev = lastPath;
    if (prev === null || prev === path) return false;
    if (PORTALS.has(area(prev)) && area(prev) === area(path)) return false;
    return true;
  });
  useEffect(() => {
    lastPath = path;
    if (!curtain) return;
    const t = setTimeout(() => setCurtain(false), 60);
    return () => clearTimeout(t);
  }, [path, curtain]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: curtain ? 0.01 : 0.4, ease: EASE }}>
        {children}
      </motion.div>
      <AnimatePresence>
        {curtain && !reduce && (
          <motion.div key="curtain" aria-hidden className="pointer-events-none fixed inset-0 z-[95]" initial={false}>
            <motion.div className="absolute inset-0 bg-lime" exit={{ clipPath: "inset(0% 0% 100% 0%)" }} transition={{ duration: 0.75, ease: EASE_IO, delay: 0.08 }} style={{ clipPath: "inset(0% 0% 0% 0%)" }} />
            <motion.div className="absolute inset-0 flex items-center justify-center bg-deep" exit={{ clipPath: "inset(0% 0% 100% 0%)" }} transition={{ duration: 0.7, ease: EASE_IO }} style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
              <motion.img src="/brand/logo-green.png" alt="" className="h-auto w-[180px] brightness-0 invert md:w-[220px]" exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: EASE }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
