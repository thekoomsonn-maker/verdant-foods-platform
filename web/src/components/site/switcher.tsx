"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PLATFORM } from "@/lib/platform";
import { LANG_CODE as CODE, LANG_FLAG, LANG_SOON, LANGS, type Lang } from "@/lib/langs";
import { Flag } from "./flag";
import { Icon } from "../icon";
import { cx } from "../tokens";

const EASE = [0.22, 1, 0.36, 1] as const;


function currentKey(path: string) {
  if (/^\/(shop|packs|bag|checkout|search|weekly-box|farms|delivery|account)(\/|$)/.test(path)) return "shop";
  if (/^\/(t|trace-your-food)(\/|$)/.test(path)) return "trace";
  if (/^\/(business|b2b)(\/|$)/.test(path)) return "b2b";
  if (/^\/farmers(\/|$)/.test(path)) return "farm";
  return "site";
}

/** Open/close with outside click and Escape. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down); window.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("keydown", key); };
  }, [open]);
  return { open, setOpen, ref };
}

const trigger = (solid: boolean, open: boolean) => cx(
  "flex h-11 items-center gap-2 rounded-full px-3 text-[14px] font-semibold transition-colors duration-150",
  solid ? "text-ink hover:bg-mist" : "text-white hover:bg-white/10",
  open && (solid ? "bg-mist" : "bg-white/15"),
);

/* ---------- Desktop: product switcher ---------- */
export function ProductSwitcher({ solid, onOpen }: { solid: boolean; onOpen?: () => void }) {
  const { open, setOpen, ref } = usePopover();
  const reduce = useReducedMotion();
  const here = currentKey(usePathname());
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen(!open); onOpen?.(); }} aria-expanded={open} aria-haspopup="true" aria-label="Verdant products" className={trigger(solid, open)}>
        <Icon name="layout-grid" size={20} />
        <span className="hidden min-[1400px]:inline">Products</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : -8, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: 0.25, ease: EASE }} style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+12px)] z-10 w-[min(640px,calc(100vw-40px))] rounded-[28px] bg-white/[0.94] backdrop-blur-2xl backdrop-saturate-150 p-2.5 text-ink shadow-[var(--shadow-3)]"
          >
            <div className="grid grid-cols-2 gap-1">
              {PLATFORM.map((p, i) => {
                const on = p.key === here;
                return (
                  <motion.div key={p.key} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.04, duration: 0.3, ease: EASE }}>
                    <Link href={p.href} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined}
                      className={cx("group/p relative flex items-start gap-3.5 rounded-[20px] p-3.5 transition-colors duration-200",
                        p.staff ? "bg-night text-white hover:bg-deep" : on ? "bg-mist" : "hover:bg-paper")}>
                      <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-[background-color,color,transform] duration-200 group-hover/p:scale-105",
                        p.staff ? "bg-forest text-lime" : on ? "bg-deep text-lime" : "bg-mist text-deep group-hover/p:bg-lime group-hover/p:text-night")}>
                        <Icon name={p.icon} size={20} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-4 pt-0.5">
                        <span className="flex items-center gap-2 text-[15px] font-semibold">
                          {p.name}
                          {on && <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden />}
                        </span>
                        <span className={cx("text-[13px] leading-snug", p.staff ? "text-white/65" : "text-muted")}>{p.line}</span>
                      </span>
                      <Icon name="arrow-up-right" size={16} className={cx("absolute right-3.5 top-4 opacity-0 transition-[opacity,transform] duration-200 group-hover/p:-translate-y-0.5 group-hover/p:translate-x-0.5 group-hover/p:opacity-100", p.staff ? "text-lime" : "text-leaf")} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <PanelLangs />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Language chips at the foot of the products panel, only on screens where the globe picker is hidden. */
function PanelLangs() {
  const [lang, setLang] = useLang();
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line px-2 pb-1 pt-3 xl:hidden">
      <Icon name="globe" size={16} className="mr-1 text-muted" />
      {LANGS.map((l) => (
        <button key={l} type="button" aria-pressed={l === lang} onClick={() => setLang(l)}
          className={cx("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors", l === lang ? "bg-deep text-white" : "bg-mist text-deep hover:bg-mint")}><Flag kind={LANG_FLAG(l)} className="h-[10px] w-[15px]" />{CODE[l]}</button>
      ))}
    </div>
  );
}

/* ---------- Mobile sheet: product grid (no sideways scroll, so it never fights the swipe-to-close) ---------- */
export function ProductGrid() {
  const here = currentKey(usePathname());
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {PLATFORM.map((p, i) => {
        const on = p.key === here;
        return (
          <motion.div key={p.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease: EASE }}>
            <Link href={p.href} aria-current={on ? "page" : undefined}
              className={cx("flex h-full flex-col gap-2.5 rounded-2xl p-3 transition-colors", on ? "bg-lime text-night" : p.staff ? "bg-forest text-white" : "bg-white/[0.08] text-white active:bg-white/15")}>
              <Icon name={p.icon} size={20} className={on ? "text-deep" : "text-lime"} />
              <span className="text-[13px] font-semibold leading-tight">{p.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------- Language ---------- */
export { useLang } from "../i18n/use-lang";
import { useLang } from "../i18n/use-lang";

export function LangPicker({ solid }: { solid: boolean }) {
  const { open, setOpen, ref } = usePopover();
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="listbox" aria-label={`Language: ${lang}`} className={cx(trigger(solid, open), "gap-2")}>
        <Flag kind={LANG_FLAG(lang)} />
        <span className="tabular text-[13px] font-semibold tracking-wide">{CODE[lang]}</span>
        <Icon name="chevron-down" size={14} className={cx("opacity-70 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul role="listbox" aria-label="Language"
            initial={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduce ? 0 : -4, scale: reduce ? 1 : 0.98 }} transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 top-[calc(100%+10px)] z-10 flex w-[188px] origin-top-right flex-col rounded-2xl bg-white/95 p-1.5 text-ink shadow-[var(--shadow-2)] backdrop-blur-2xl backdrop-saturate-150">
            {LANGS.map((l, i) => (
              <li key={l}>
                {i === 2 && <div className="mx-2.5 my-1 h-px bg-line" aria-hidden />}
                <button type="button" role="option" aria-selected={l === lang} onClick={() => { setLang(l); setOpen(false); }}
                  className={cx("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] transition-colors", l === lang ? "bg-mist font-semibold text-deep" : "text-ink/85 hover:bg-paper hover:text-ink")}>
                  <Flag kind={LANG_FLAG(l)} className="h-[12px] w-[17px]" />
                  <span className="flex-1 truncate">{l}</span>
                  {l === lang ? <Icon name="check" size={14} className="text-leaf" /> : LANG_SOON.has(l) && <span data-i18n-skip className="rounded-full bg-mist px-1.5 py-px text-[10px] font-semibold text-muted">Soon</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mobile sheet: every language as a tappable chip. */
export function LangList() {
  const [lang, setLang] = useLang();
  return (
    <div role="listbox" aria-label="Language" className="flex flex-wrap gap-2">
      {LANGS.map((l) => (
        <button key={l} type="button" role="option" aria-selected={l === lang} onClick={() => setLang(l)}
          className={cx("inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-colors", l === lang ? "bg-lime text-night" : "bg-white/10 text-white hover:bg-white/20")}>
          <Flag kind={LANG_FLAG(l)} className="h-[11px] w-[16px]" />{l}
        </button>
      ))}
    </div>
  );
}
