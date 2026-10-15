/** Languages Verdant speaks across the website, farmer app and support lines. */
export const LANGS = ["English", "Français", "Twi (Asante)", "Akuapem Twi", "Fante", "Ga", "Ewe", "Dagbani", "Dagaare", "Waale", "Gonja"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_CODE: Record<Lang, string> = { English: "EN", "Français": "FR", "Twi (Asante)": "TW", "Akuapem Twi": "AK", Fante: "FA", Ga: "GA", Ewe: "EE", Dagbani: "DA", Dagaare: "DG", Waale: "WA", Gonja: "GJ" };
export type FlagKind = "gb" | "fr" | "gh";
export const LANG_FLAG = (l: Lang): FlagKind => (l === "English" ? "gb" : l === "Français" ? "fr" : "gh");
