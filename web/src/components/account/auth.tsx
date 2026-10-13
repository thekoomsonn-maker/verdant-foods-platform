"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "../motion";
import { R } from "@/lib/routes";

/** Split layout for sign in, sign up and code entry: photo with a quote on the left, form on the right. */
export function AuthSplit({ children, img = "/img/family-unbox.jpg", quote = "I scan the code on every bag. My children know the farmer who grew their tomatoes.", by = "Ama Owusu, shopper in Accra" }: { children: ReactNode; img?: string; quote?: string; by?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-[100svh] flex-col bg-white lg:flex-row">
      <div className="relative h-[240px] shrink-0 overflow-hidden bg-night md:h-[320px] lg:sticky lg:top-0 lg:h-[100svh] lg:w-1/2">
        <motion.div className="absolute inset-0" initial={{ scale: reduce ? 1 : 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(1_31_26/.45)_0%,transparent_30%,transparent_55%,rgb(1_26_20/.75)_100%)]" />
        <Link href={R.home} aria-label="Verdant Foods home" className="absolute left-5 top-5 block h-9 w-[110px] md:left-8 md:top-8 lg:left-10 lg:top-10 lg:h-11 lg:w-[132px]">
          <Image src="/brand/logo-cream.png" alt="Verdant Foods" fill sizes="132px" className="object-contain object-left" priority />
        </Link>
        <motion.figure initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="glass-dark absolute inset-x-5 bottom-5 hidden rounded-3xl p-5 text-white md:block md:inset-x-8 md:bottom-8 lg:inset-x-10 lg:bottom-10 lg:p-6">
          <blockquote className="text-[17px] font-medium leading-snug lg:text-[19px]">“{quote}”</blockquote>
          <figcaption className="mt-2 text-[14px] text-white/75">{by}</figcaption>
        </motion.figure>
      </div>
      <div className="flex flex-1 items-start justify-center px-5 py-10 md:px-8 md:py-14 lg:items-center lg:px-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }} className="flex w-full max-w-[440px] flex-col gap-6">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/** Text input with the shared focus ring, controlled. */
export function Input({ label, value, onChange, placeholder, type = "text", icon, prefix, inputMode, autoComplete, error, name }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: ReactNode; prefix?: ReactNode;
  inputMode?: "text" | "tel" | "email" | "numeric"; autoComplete?: string; error?: string; name?: string;
}) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      <span className="flex gap-2">
        {prefix}
        <span className={`flex h-[52px] w-full items-center gap-2.5 rounded-xl bg-paper px-4 ring-1 transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-deep ${error ? "ring-danger" : "ring-transparent"}`}>
          {icon}
          <input name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete} aria-invalid={!!error} className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-muted" />
        </span>
      </span>
      {error && <span className="text-[13px] text-danger">{error}</span>}
    </label>
  );
}
