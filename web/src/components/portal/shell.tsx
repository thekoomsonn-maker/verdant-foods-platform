"use client";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { R } from "@/lib/routes";
import { Icon, type IconName } from "../icon";
import { cx, T } from "../ui";
import { CountUp, EASE } from "../motion";
import { Spark } from "../charts";

type Item = [IconName, string, string, string?];
type Cfg = { tag: string; dark: boolean; search: string; initials: string; user: string; org: string; syncT: string; syncS: string; home: string; menu: [string, Item[]][] };

export const B2B: Cfg = {
  tag: "Business", dark: false, search: "Search produce, farms, orders", initials: "OK", user: "Osu Kitchen Group", org: "Business account · Accra", syncT: "Account verified", syncS: "Credit limit GH₵ 60,000", home: R.b2b,
  menu: [["", [["layout-dashboard", "Overview", R.b2b], ["store", "Source produce", R.b2bSource], ["gavel", "Bids", R.b2bBids, "2"], ["handshake", "Supply agreements", R.b2bAgreements], ["truck", "Orders and deliveries", R.b2bOrders], ["receipt", "Invoices", R.b2bInvoices]]],
    ["Traceability", [["file-check", "Trace reports", R.b2bReports], ["siren", "Quality claims", R.b2bClaims]]],
    ["Account", [["calendar", "Supply calendar", R.b2bCalendar], ["file-text", "Request a quote", R.b2bQuote], ["users", "Team and roles", R.b2bTeam]]]],
};
export const ADM: Cfg = {
  tag: "Admin", dark: true, search: "Search orders, farms, people, batches or codes", initials: "AD", user: "Akosua Darko", org: "Operations, Verdant Foods", syncT: "Field apps live", syncS: "86 records synced today", home: R.admin,
  menu: [["Overview", [["layout-dashboard", "Dashboard", R.admin], ["map", "Live supply map", R.adminMap]]],
    ["Sales", [["package", "Orders", R.adminOrders, "12"], ["leaf", "Products and harvests", R.adminProducts], ["building-2", "Buyers", R.adminBuyers], ["tag", "Pricing", R.adminPricing]]],
    ["Supply", [["tractor", "Farmers and farms", R.adminFarmers], ["users", "Savings groups", R.adminGroups], ["badge-check", "Farm checks", R.adminChecks, "7"], ["truck", "Deliveries", R.adminDeliveries]]],
    ["Trust", [["layers", "Batches and handovers", R.adminBatches], ["scale", "Weight checks", R.adminWeights, "2"], ["qr-code", "Trace codes", R.adminCodes], ["siren", "Recalls", R.adminRecalls], ["triangle-alert", "Problems", R.adminProblems, "9"]]],
    ["Money", [["wallet", "Payments and payouts", R.adminPayments], ["chart-line", "Reports", R.adminReports]]],
    ["System", [["newspaper", "Website content", R.adminContent], ["key", "Users and roles", R.adminUsers], ["settings", "Settings", R.adminSettings]]]],
};

function Menu({ cfg, active, onNav }: { cfg: Cfg; active: string; onNav?: () => void }) {
  const d = cfg.dark;
  return (
    <nav className="flex flex-col gap-5">
      {cfg.menu.map(([g, items]) => (
        <div key={g || "main"} className="flex flex-col gap-0.5">
          {g && <div className={cx("px-3 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em]", d ? "text-white/50" : "text-muted")}>{g}</div>}
          {items.map(([i, t, h, badge]) => {
            const on = t === active;
            return (
              <Link key={t} href={h} onClick={onNav} className={cx("group/m relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors", on ? (d ? "text-night" : "text-deep") : d ? "text-white/85 hover:bg-white/5" : "text-ink hover:bg-mist")}>
                {on && <motion.span layoutId={`menu-${cfg.tag}`} className={cx("absolute inset-0 rounded-xl", d ? "bg-lime" : "bg-mist")} transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                <Icon name={i} size={20} className={cx("relative transition-transform group-hover/m:scale-110", on ? "" : d ? "text-white/80" : "text-muted")} />
                <span className="relative flex-1">{t}</span>
                {badge && <span className={cx("relative rounded-full px-2 py-0.5 text-[12px]", d ? "bg-orange text-night" : "bg-deep text-white")}>{badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function PortalShell({ cfg, active, title, sub, actions, children }: { cfg: Cfg; active: string; title: string; sub?: string; actions?: ReactNode; children: ReactNode }) {
  const [sheet, setSheet] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => { tabs.current?.querySelector("[data-on]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, []);
  const d = cfg.dark;
  const all = cfg.menu.flatMap(([, it]) => it);
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className={cx("sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col gap-6 overflow-y-auto px-4 py-6 lg:flex", d ? "bg-night" : "bg-white border-r border-line")}>
        <Link href={cfg.home} className="flex items-center gap-2.5 px-2">
          <span className="relative block h-10 w-[112px]"><Image src={d ? "/brand/logo-cream.png" : "/brand/logo-green.png"} alt="Verdant" fill sizes="112px" className="object-contain object-left" /></span>
          <span className={cx("rounded-md px-2 py-1 text-[12px] font-semibold", d ? "bg-forest text-lime" : "bg-mist text-deep")}>{cfg.tag}</span>
        </Link>
        <Menu cfg={cfg} active={active} />
        <div className={cx("mt-auto rounded-2xl p-4", d ? "bg-forest" : "bg-mist")}>
          <div className={cx("flex items-center gap-2 text-[14px] font-semibold", d ? "text-white" : "text-deep")}><span className="h-2 w-2 animate-breathe rounded-full bg-lime" />{cfg.syncT}</div>
          <div className={cx("mt-1 text-[13px]", d ? "text-white/70" : "text-muted")}>{cfg.syncS}</div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/90 px-5 backdrop-blur md:h-[72px] md:px-8 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setSheet(true)} aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-mist"><Icon name="menu" size={22} /></button>
            <span className="relative block h-8 w-[92px]"><Image src="/brand/logo-green.png" alt="Verdant" fill sizes="92px" className="object-contain object-left" /></span>
          </div>
          <label className="hidden h-11 w-[420px] items-center gap-2.5 rounded-full bg-paper px-4 text-muted ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep lg:flex">
            <Icon name="search" size={18} /><input placeholder={cfg.search} className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted" />
            <kbd className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-muted ring-1 ring-line">⌘K</kbd>
          </label>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-paper hover:bg-mist"><Icon name="bell" size={20} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tomato ring-2 ring-white" /></button>
            <span className={cx("flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold", d ? "bg-plum text-blush" : "bg-deep text-white")}>{cfg.initials}</span>
            <span className="hidden flex-col md:flex"><span className="text-[14px] font-semibold">{cfg.user}</span><span className="text-[12px] text-muted">{cfg.org}</span></span>
          </div>
        </header>
        <main className="flex flex-col gap-4 px-5 pb-12 pt-5 md:gap-6 md:px-8 md:pb-14 md:pt-8 lg:px-10">
          <div ref={tabs} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:hidden">
            {all.map(([, t, h]) => <Link key={t} href={h} data-on={t === active ? "" : undefined} className={cx("shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold", t === active ? "bg-deep text-white" : "bg-white text-deep")}>{t}</Link>)}
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1.5"><h1 className={cx(T.h2, "text-ink")}>{title}</h1>{sub && <p className="text-muted">{sub}</p>}</div>
            {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: EASE }} className="flex flex-col gap-4 md:gap-6">{children}</motion.div>
        </main>
      </div>
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-night/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.aside className={cx("fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col gap-6 overflow-y-auto px-4 py-5 lg:hidden", d ? "bg-night" : "bg-white")} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.35, ease: EASE }}>
              <div className="flex items-center justify-between px-2"><span className="relative block h-9 w-[104px]"><Image src={d ? "/brand/logo-cream.png" : "/brand/logo-green.png"} alt="Verdant" fill sizes="104px" className="object-contain object-left" /></span><button onClick={() => setSheet(false)} aria-label="Close menu" className={cx("flex h-10 w-10 items-center justify-center rounded-full", d ? "bg-forest text-white" : "bg-mist text-deep")}><Icon name="x" /></button></div>
              <Menu cfg={cfg} active={active} onNav={() => setSheet(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Portal building blocks ---------- */
export function Panel({ children, className, title, link, dark }: { children: ReactNode; className?: string; title?: string; link?: [string, string?]; dark?: boolean }) {
  return (
    <section className={cx("flex flex-col gap-4 rounded-[20px] p-4 md:p-6", dark ? "bg-night text-white" : "bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold">{title}</h2>
          {link && (link[1] ? <Link href={link[1]} className={cx("text-[14px] font-semibold", dark ? "text-lime" : "text-leaf hover:text-deep")}>{link[0]}</Link> : <span className="text-[14px] font-semibold text-leaf">{link[0]}</span>)}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ l, v, d, icon = "activity", tone = "success", spark, bg }: { l: string; v: string; d?: string; icon?: IconName; tone?: "success" | "warning" | "danger" | "muted" | "deep"; spark?: number[]; bg?: string }) {
  const tc = { success: "text-success", warning: "text-warning", danger: "text-danger", muted: "text-muted", deep: "text-deep" }[tone];
  return (
    <div className={cx("group/k flex flex-col gap-2.5 rounded-[20px] p-5 transition-transform duration-300 hover:-translate-y-0.5", bg ?? "bg-white")}>
      <div className="flex items-center gap-2"><span className={cx("flex h-8 w-8 items-center justify-center rounded-[10px]", bg ? "bg-white" : tone === "danger" ? "bg-danger-bg text-danger" : "bg-mist text-deep")}><Icon name={icon} size={16} /></span><span className="text-[14px] text-muted">{l}</span></div>
      <div className="flex items-end justify-between gap-2"><CountUp value={v} className="text-[24px] font-semibold tracking-[-0.01em] md:text-[28px]" />{spark && <Spark values={spark} />}</div>
      {d && <div className={cx("text-[13px]", tc)}>{d}</div>}
    </div>
  );
}
export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">{children}</div>;
}

/** Table on wide screens, cards on phones. */
export function DataTable({ cols, rows }: { cols: [string, string?][]; rows: ReactNode[][] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[14px]">
          <thead><tr className="bg-paper">{cols.map(([c, w], i) => <th key={c} style={{ width: w }} className={cx("px-4 py-2.5 text-[13px] font-medium text-muted", i === 0 && "rounded-l-xl", i === cols.length - 1 && "rounded-r-xl")}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.35 }} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                {r.map((c, j) => <td key={j} className={cx("px-4 py-3.5", j === 0 && "font-semibold")}>{c}</td>)}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-paper p-3.5">
            <div className="flex items-center justify-between gap-2 font-semibold">{r[0]}{typeof r[r.length - 1] !== "string" && r.length > 1 ? r[r.length - 1] : null}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {r.slice(1, typeof r[r.length - 1] !== "string" ? -1 : undefined).map((c, j) => <span key={j}>{cols[j + 1]?.[0]}: <span className="text-ink">{c}</span></span>)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Feed({ items }: { items: [IconName, string, string, string, ("danger" | "warning" | "success" | "info")?][] }) {
  const C = { danger: "bg-danger-bg text-danger", warning: "bg-warning-bg text-warning", success: "bg-success-bg text-success", info: "bg-mist text-deep" };
  return (
    <div className="flex flex-col">
      {items.map(([i, t, s, tm, tone], n) => (
        <motion.div key={t + n} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: n * 0.05 }} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
          <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", C[tone ?? "info"])}><Icon name={i} size={16} /></span>
          <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{t}</div><div className="truncate text-[13px] text-muted">{s}</div></div>
          <span className="shrink-0 text-[13px] text-muted">{tm}</span>
        </motion.div>
      ))}
    </div>
  );
}
