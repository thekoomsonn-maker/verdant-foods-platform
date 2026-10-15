"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { LANG_ID, type Lang } from "@/lib/langs";
import { translate } from "@/lib/i18n/norm";
import { useLang } from "./use-lang";

type Dict = Record<string, string>;
const Ctx = createContext<{ lang: Lang; t: (s: string) => string }>({ lang: "English", t: (s) => s });
/** Translate a string inside a component (used where text is split into words for animation). */
export const useT = () => useContext(Ctx).t;
export const useI18n = () => useContext(Ctx);

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG", "svg"]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

async function load(lang: Lang): Promise<Dict | null> {
  if (lang === "English") return null;
  try { return (await import(`@/lib/i18n/dicts/${LANG_ID[lang]}.json`)).default as Dict; } catch { return null; }
}

/** Translates every piece of text on the page after it renders, and keeps doing so as React updates it.
 *  The English original is remembered per text node, so switching languages (or back to English) is instant.
 *  Anything without a translation stays in English. Mark a subtree with data-i18n-skip to leave it alone. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang] = useLang();
  const [dict, setDict] = useState<Dict | null>(null);
  const orig = useRef(new WeakMap<Node, string>());
  const wrote = useRef(new WeakMap<Node, string>());
  const attrOrig = useRef(new WeakMap<Element, Record<string, string>>());
  const attrWrote = useRef(new WeakMap<Element, Record<string, string>>());

  useEffect(() => {
    let live = true;
    load(lang).then((d) => { if (live) setDict(d); });
    document.documentElement.lang = LANG_ID[lang];
    return () => { live = false; };
  }, [lang]);

  const t = useCallback((s: string) => translate(dict, s), [dict]);

  useEffect(() => {
    const skipped = (el: Element | null) => !!el?.closest?.("[data-i18n-skip],[contenteditable=true]");
    const doText = (n: Text) => {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName) || skipped(p)) return;
      const cur = n.data;
      if (wrote.current.get(n) !== cur) orig.current.set(n, cur); // React (or someone) changed it: new English source
      const src = orig.current.get(n) ?? cur;
      const out = translate(dict, src);
      if (out !== cur) { n.data = out; }
      wrote.current.set(n, n.data);
    };
    const doAttrs = (el: Element) => {
      if (skipped(el)) return;
      for (const a of ATTRS) {
        const cur = el.getAttribute(a);
        if (cur == null) continue;
        const o = attrOrig.current.get(el) ?? {}; const w = attrWrote.current.get(el) ?? {};
        if (w[a] !== cur) o[a] = cur;
        const out = translate(dict, o[a] ?? cur);
        if (out !== cur) el.setAttribute(a, out);
        w[a] = out; attrOrig.current.set(el, o); attrWrote.current.set(el, w);
      }
    };
    const walk = (root: Node) => {
      if (root.nodeType === 3) return doText(root as Text);
      if (root.nodeType !== 1) return;
      const el = root as Element;
      if (SKIP.has(el.tagName) || skipped(el)) return;
      doAttrs(el);
      el.querySelectorAll("[placeholder],[aria-label],[title],[alt]").forEach(doAttrs);
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) doText(n as Text);
    };
    walk(document.body);
    const title = document.querySelector("title"); if (title) walk(title);
    document.documentElement.classList.remove("i18n-loading");

    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "characterData") { const n = m.target as Text; if (wrote.current.get(n) !== n.data) doText(n); }
        else if (m.type === "attributes") { const el = m.target as Element; const w = attrWrote.current.get(el); if (!w || w[m.attributeName!] !== el.getAttribute(m.attributeName!)) doAttrs(el); }
        else m.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
    if (title) mo.observe(title, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  }, [dict]);

  return <Ctx.Provider value={{ lang, t }}>{children}</Ctx.Provider>;
}

/** Runs before paint: if a non-English language is saved, hide the page until the dictionary has been applied (max 1.2 s). */
export const I18N_BOOT = `try{var l=localStorage.getItem("vf-lang");if(l&&l!=="English")document.documentElement.classList.add("i18n-loading")}catch(e){}`;
