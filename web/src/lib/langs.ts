/** Languages Verdant speaks across the website, farmer app and support lines. */
export const LANGS = ["English", "Twi (Asante)", "Akuapem Twi", "Fante", "Ga", "Ewe", "Dagbani", "Dagaare", "Waale", "Gonja"] as const;
export type Lang = (typeof LANGS)[number];
