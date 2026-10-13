"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { R } from "@/lib/routes";
import { Icon, type IconName } from "../icon";
import { Avatar, Container, cx, GlassStat } from "../ui";
import { EASE } from "../motion";
import { Nav } from "./nav";
import { Footer } from "./footer";

const ITEMS: [IconName, string, string][] = [["layout-dashboard", "Overview", R.account], ["package", "Orders", R.orders], ["repeat", "Weekly box", R.myBox], ["heart", "Saved items", R.saved], ["wallet", "Addresses and payment", R.addresses], ["settings", "Settings", R.settings]];

export function AccountShell({ active, title, sub, children }: { active: string; title: string; sub: string; children: ReactNode }) {
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => { tabs.current?.querySelector("[data-on]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, []);
  return (
    <>
      <Nav theme="light" />
      <div className="bg-paper pt-[68px] lg:pt-[72px]">
        <section className="relative overflow-hidden bg-deep text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/hero-aerial.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.12]" />
          <Container className="relative flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between md:py-9">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex items-center gap-4">
              <Avatar initials="AO" size={56} className="bg-lime text-night" />
              <div><h1 className="text-[26px] font-medium tracking-[-0.02em] md:text-[36px]">{title}</h1><p className="text-[14px] text-white/75">{sub}</p></div>
            </motion.div>
            <div className="hidden gap-3 lg:flex">{[["14", "orders"], ["9", "farms you buy from"], ["GH₵ 186", "saved with weekly box"]].map(([n, l]) => <GlassStat key={l} n={n} l={l} className="!px-4 !py-3 [&>div:first-child]:!text-[18px] [&>div:last-child]:!mt-0.5 [&>div:last-child]:!text-[12px]" />)}</div>
          </Container>
        </section>
        <Container className="flex flex-col gap-4 pb-14 pt-4 md:pt-8 lg:flex-row lg:gap-8 lg:pb-20">
          <aside className="hidden w-[264px] shrink-0 self-start rounded-[20px] bg-white p-3 lg:sticky lg:top-24 lg:block">
            {ITEMS.map(([i, t, h]) => {
              const on = t === active;
              return (
                <Link key={t} href={h} className={cx("group/a relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold", on ? "text-deep" : "text-ink hover:bg-paper")}>
                  {on && <motion.span layoutId="acct" className="absolute inset-0 rounded-xl bg-mist" />}
                  <Icon name={i} className={cx("relative transition-transform group-hover/a:scale-110", !on && "text-muted")} /><span className="relative">{t}</span>
                </Link>
              );
            })}
            <div className="my-2 h-px bg-line" />
            <Link href={R.home} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold text-muted hover:bg-paper"><Icon name="log-out" />Sign out</Link>
          </aside>
          <div ref={tabs} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:hidden">
            {ITEMS.map(([i, t, h]) => <Link key={t} href={h} data-on={t === active ? "" : undefined} className={cx("inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold", t === active ? "bg-deep text-white" : "bg-white text-deep")}><Icon name={i} size={16} />{t}</Link>)}
          </div>
          <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease: EASE }} className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">{children}</motion.main>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("flex flex-col gap-4 rounded-[20px] bg-white p-4 md:p-6", className)}>{children}</section>;
}
