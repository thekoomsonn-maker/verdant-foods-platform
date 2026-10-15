"use client";
import { useCallback, useEffect, useState } from "react";
import { LANGS, type Lang } from "@/lib/langs";

export const LANG_KEY = "vf-lang";
const EVT = "vf-lang";

/** The visitor's chosen language, remembered in this browser only. */
export function useLang() {
  const [lang, setLangState] = useState<Lang>("English");
  useEffect(() => {
    const read = () => { try { const v = localStorage.getItem(LANG_KEY); setLangState(v && (LANGS as readonly string[]).includes(v) ? (v as Lang) : "English"); } catch {} };
    read(); window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
    window.dispatchEvent(new Event(EVT));
  }, []);
  return [lang, setLang] as const;
}
