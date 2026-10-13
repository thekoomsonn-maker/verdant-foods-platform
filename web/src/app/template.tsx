"use client";
import { motion } from "motion/react";

/** Page transition: incoming page fades in (spec §3; content rises via Reveal so fixed nav is never inside a transform). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
