/** Languages Verdant speaks across the website, farmer app and support lines. */
export const LANGS = ["English", "Français", "Twi (Asante)", "Akuapem Twi", "Fante", "Ga", "Ewe", "Dagbani", "Gonja"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_CODE: Record<Lang, string> = { English: "EN", "Français": "FR", "Twi (Asante)": "TW", "Akuapem Twi": "AK", Fante: "FA", Ga: "GA", Ewe: "EE", Dagbani: "DA", Gonja: "GJ" };
/** File id of each dictionary in src/lib/i18n/dicts, and the value for <html lang>. */
export const LANG_ID: Record<Lang, string> = { English: "en", "Français": "fr", "Twi (Asante)": "tw", "Akuapem Twi": "ak", Fante: "fat", Ga: "gaa", Ewe: "ee", Dagbani: "dag", Gonja: "gjn" };
export type FlagKind = "gb" | "fr" | "gh";
export const LANG_FLAG = (l: Lang): FlagKind => (l === "English" ? "gb" : l === "Français" ? "fr" : "gh");

/** Languages whose translation is still being written with native speakers: shown in the menu with a "Soon" tag. */
export const LANG_SOON: ReadonlySet<Lang> = new Set<Lang>(["Dagbani", "Gonja"]);
