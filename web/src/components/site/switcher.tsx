"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PLATFORM } from "@/lib/platform";
import { LANGS, type Lang } from "@/lib/langs";
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
          className={cx("h-8 rounded-full px-3 text-[13px] font-medium transition-colors", l === lang ? "bg-deep text-white" : "bg-mist text-deep hover:bg-mint")}>{l}</button>
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
const KEY = "vf-lang";
const EVT = "vf-lang";
const CODE: Record<Lang, string> = { English: "EN", "Twi (Asante)": "TW", "Akuapem Twi": "AK", Fante: "FA", Ga: "GA", Ewe: "EE", Dagbani: "DA", Dagaare: "DG", Waale: "WA", Gonja: "GJ" };

/** The visitor's chosen language, remembered in this browser only. */
export function useLang() {
  const [lang, setLangState] = useState<Lang>("English");
  useEffect(() => {
    const read = () => { try { const v = localStorage.getItem(KEY); if (v && (LANGS as readonly string[]).includes(v)) setLangState(v as Lang); } catch {} };
    read(); window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
    window.dispatchEvent(new Event(EVT));
  }, []);
  return [lang, setLang] as const;
}

export function LangPicker({ solid }: { solid: boolean }) {
  const { open, setOpen, ref } = usePopover();
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="listbox" aria-label={`Language: ${lang}`} className={cx(trigger(solid, open), "gap-1.5")}>
        <Icon name="globe" size={19} />
        <span className="tabular text-[13px] tracking-wide">{CODE[lang]}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul role="listbox" aria-label="Language"
            initial={{ opacity: 0, y: reduce ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -6 }} transition={{ duration: 0.22, ease: EASE }}
            className="absolute right-0 top-[calc(100%+12px)] z-10 flex w-[232px] bg-white/[0.94] backdrop-blur-2xl backdrop-saturate-150 flex-col rounded-3xl p-2 text-ink shadow-[var(--shadow-3)]">
            {LANGS.map((l, i) => (
              <motion.li key={l} initial={{ opacity: 0, x: reduce ? 0 : 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 8) * 0.025, duration: 0.2 }}>
                <button type="button" role="option" aria-selected={l === lang} onClick={() => { setLang(l); setOpen(false); }}
                  className={cx("flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[15px] transition-colors", l === lang ? "bg-mist font-semibold text-deep" : "hover:bg-paper")}>
                  {l}
                  {l === lang ? <Icon name="check" size={16} className="text-leaf" /> : <span className="text-[12px] text-muted">{CODE[l]}</span>}
                </button>
              </motion.li>
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
          className={cx("h-9 rounded-full px-3.5 text-[14px] font-medium transition-colors", l === lang ? "bg-lime text-night" : "bg-white/10 text-white hover:bg-white/20")}>
          {l}
        </button>
      ))}
    </div>
  );
}
