// Marketplace mock data (pages 07–13, 42–46). Mock only; the real API belongs to Verdant's backend team.
import { CATEGORIES, FARMS, farmBySlug, JOURNEY, PLACES, PRODUCTS, type Cat, type Farm, type Product } from "./data";

/* ---------- Catalogue: the shared PRODUCTS plus a few market-only lines ---------- */
export const EXTRA_PRODUCTS: Product[] = [
  { slug: "plum-tomatoes", name: "Plum tomatoes", farm: "tolon-growers-group", price: 38, unit: "2 kg", img: "tomatoes", cat: "vegetables", fresh: "Picked yesterday", proof: 2 },
  { slug: "vine-tomatoes-5kg", name: "Vine tomatoes, 5 kg", farm: "nyankpala-women-farmers", price: 105, unit: "5 kg", img: "tomatoes", cat: "vegetables", fresh: "Picked today", proof: 3 },
  { slug: "tomato-pepper-pack", name: "Tomato and pepper pack", farm: "nyankpala-women-farmers", price: 60, unit: "pack", img: "box", cat: "packs", fresh: "Packed to order", proof: 3 },
  { slug: "pineapple-3-pack", name: "Pineapple, 3 pack", farm: "kumbungu-fruit-farmers", price: 54, unit: "3 pieces", img: "pineapple", cat: "fruits", fresh: "Picked today", proof: 2 },
  { slug: "family-pawpaw", name: "Family pawpaw", farm: "wa-green-growers", price: 22, unit: "each", img: "pawpaw", cat: "fruits", fresh: "Picked today", proof: 2 },
  { slug: "fruit-box", name: "Fruit box", farm: "kumbungu-fruit-farmers", price: 95, unit: "box", img: "box", cat: "fruits", fresh: "Packed to order", proof: 3 },
  { slug: "pawpaw-2-pack", name: "Pawpaw, 2 pack", farm: "tolon-growers-group", price: 30, unit: "2 pieces", img: "pawpaw", cat: "fruits", fresh: "Picked yesterday", proof: 2 },
  { slug: "ripe-plantain", name: "Ripe plantain", farm: "tolon-growers-group", price: 30, unit: "4 fingers", img: "plantain", cat: "fruits", fresh: "Picked 2 days ago", proof: 2 },
  { slug: "white-onions", name: "White onions", farm: "savelugu-onion-growers", price: 20, unit: "2 kg", img: "onions", cat: "onions", fresh: "Picked 2 days ago", proof: 2 },
  { slug: "shallots", name: "Shallots", farm: "savelugu-onion-growers", price: 16, unit: "500 g", img: "onions", cat: "onions", fresh: "Picked yesterday", proof: 1 },
  { slug: "puna-yam-3", name: "Puna yam, 3 tubers", farm: "lawra-yam-collective", price: 70, unit: "3 tubers", img: "yam", cat: "roots-and-tubers", fresh: "Picked 3 days ago", proof: 3 },
  { slug: "dried-maize", name: "Dried maize", farm: "savelugu-onion-growers", price: 40, unit: "5 kg", img: "maize", cat: "grains", fresh: "Picked 3 days ago", proof: 2 },
  { slug: "baby-cabbage", name: "Baby cabbage", farm: "nadowli-womens-group", price: 10, unit: "each", img: "cabbage", cat: "leafy-greens", fresh: "Picked today", proof: 1 },
];
export const CATALOG: Product[] = [...PRODUCTS, ...EXTRA_PRODUCTS];
export const findProduct = (slug: string) => CATALOG.find((p) => p.slug === slug);

/** Days since pick, from the freshness label. */
export function freshDays(p: Product) {
  const f = p.fresh.toLowerCase();
  if (f.includes("today") || f.includes("to order")) return 0;
  if (f.includes("yesterday")) return 1;
  const m = f.match(/(\d+)\s+days?/);
  return m ? Number(m[1]) : 7;
}
export const regionOf = (p: Product) => farmBySlug(p.farm).region;

export type Practice = "soil" | "low-chem" | "no-spray";
export const PRACTICE_LABEL: Record<Practice, string> = { soil: "Soil care practices", "low-chem": "Low chemical use", "no-spray": "No spray in last 14 days" };
export function practicesOf(p: Product): Practice[] {
  const n = CATALOG.findIndex((x) => x.slug === p.slug);
  const out: Practice[] = ["soil"];
  if (n % 3 !== 1) out.push("low-chem");
  if (p.proof === 3 || n % 4 === 0) out.push("no-spray");
  return out;
}

/* ---------- Category pages ---------- */
export type CatMeta = { title: string; sub: string; bg: string; fg: "light" | "dark"; ring: string; hero: string; chips: string[]; farmsLine: string };
export const CAT_META: Record<Exclude<Cat, "packs">, CatMeta> = {
  vegetables: { title: "Vegetables", sub: "Tomatoes, peppers, okra and garden eggs, picked this week.", bg: "bg-tomato", fg: "light", ring: "bg-tomato-soft", hero: "tomatoes", chips: ["Tomato", "Pepper", "Okra", "Garden egg"], farmsLine: "The farms behind your vegetables" },
  "leafy-greens": { title: "Leafy greens", sub: "Kontomire and cabbage, cut the morning they ship.", bg: "bg-lime", fg: "dark", ring: "bg-lime-soft", hero: "kontomire", chips: ["Kontomire", "Cabbage"], farmsLine: "The farms behind your greens" },
  "roots-and-tubers": { title: "Roots and tubers", sub: "Puna yam from Lawra, stored cool and dry.", bg: "bg-sun", fg: "dark", ring: "bg-sun-soft", hero: "yam", chips: ["Yam"], farmsLine: "The farms behind your yam" },
  fruits: { title: "Fruits", sub: "Sweet, ripe and picked this week.", bg: "bg-orange", fg: "light", ring: "bg-orange-soft", hero: "pineapple", chips: ["Pineapple", "Pawpaw", "Plantain"], farmsLine: "The farms behind your fruit" },
  onions: { title: "Onions", sub: "Red and white onions and shallots from Savelugu.", bg: "bg-plum", fg: "light", ring: "bg-plum-soft", hero: "onions", chips: ["Red", "White", "Shallots"], farmsLine: "The farms behind your onions" },
  grains: { title: "Grains", sub: "Fresh and dried maize from the Northern Region.", bg: "bg-sun", fg: "dark", ring: "bg-sun-soft", hero: "maize", chips: ["Fresh", "Dried"], farmsLine: "The farms behind your grains" },
};
export const SHOP_CATS = CATEGORIES.filter((c) => c.slug !== "all" && c.slug !== "packs").map((c) => c.slug as Exclude<Cat, "packs">);

/* ---------- Stock-up packs ---------- */
export type Pack = { slug: string; name: string; desc: string; price: number; people: string; photo: string; img: string; tint: string; popular?: boolean };
export const PACKS: Pack[] = [
  { slug: "home-essentials", name: "Home essentials", desc: "Tomatoes, onions, pepper, garden eggs, yam", price: 180, people: "2 to 3 people", photo: "/products/box.jpg", img: "box", tint: "bg-lime-soft" },
  { slug: "family-weekly", name: "Family weekly", desc: "14 items for a family of five", price: 320, people: "4 to 5 people", photo: "/img/box-flatlay.jpg", img: "box", tint: "bg-sun-soft", popular: true },
  { slug: "soup-and-stew", name: "Soup and stew", desc: "Everything for light soup and stew", price: 145, people: "Serves 6", photo: "/products/tomatoes.jpg", img: "tomatoes", tint: "bg-tomato-soft" },
  { slug: "fruit-basket", name: "Fruit basket", desc: "Pawpaw, pineapple, oranges, bananas", price: 125, people: "2 to 3 people", photo: "/products/pawpaw.jpg", img: "pawpaw", tint: "bg-orange-soft" },
  { slug: "jollof-night", name: "Jollof night", desc: "Tomatoes, pepper, onions, spices", price: 110, people: "Serves 8", photo: "/products/pepper.jpg", img: "pepper", tint: "bg-blush/40" },
  { slug: "office-pantry", name: "Office pantry", desc: "Fruit and snacks for teams", price: 260, people: "10 people", photo: "/products/pineapple.jpg", img: "pineapple", tint: "bg-plum-soft" },
];
export const packProduct = (k: Pack): Product => ({ slug: `pack-${k.slug}`, name: k.name, farm: "nyankpala-women-farmers", price: k.price, unit: "pack", img: k.img, cat: "packs", fresh: "Packed to order", proof: 3 });

/* ---------- Product detail ---------- */
export const SIZES: Record<string, { label: string; mult: number }[]> = {
  default: [{ label: "1 kg", mult: 0.5 }, { label: "2 kg", mult: 1 }, { label: "Crate · 25 kg", mult: 11 }],
};
export function galleryOf(p: Product) {
  const f = farmBySlug(p.farm);
  return [`/products/${p.img}.jpg`, f.photo === "/img/farmer-amina.jpg" ? "/img/hands-tomato.jpg" : f.photo, f.lat < 8 ? "/img/sorting-hands.jpg" : "/img/packhouse.jpg", "/img/qr-scan-crate.jpg"];
}
/** A traced route for any product: farm, collection point, the nearest packhouse (Tamale or Somanya), Accra. */
export function journeyOf(p: Product) {
  const f = farmBySlug(p.farm);
  if (p.slug === "vine-tomatoes") return JOURNEY.steps.map((s) => ({ title: s.title, lat: s.lat, lng: s.lng }));
  const south = f.lat < 8;
  const point = f.region === "Upper West" ? PLACES.wa : south ? { lat: f.lat + 0.03, lng: f.lng + 0.03 } : PLACES.tolon;
  const pack = south ? PLACES.somanya : PLACES.tamale;
  return [
    { title: "Harvested", lat: f.lat, lng: f.lng },
    { title: "Collected", lat: point.lat, lng: point.lng },
    { title: "Sorted and packed", lat: pack.lat, lng: pack.lng },
    { title: "Delivered to you", lat: PLACES.accra.lat, lng: PLACES.accra.lng },
  ];
}
export const traceCodeOf = (p: Product) => (p.slug === "vine-tomatoes" ? JOURNEY.code : `VF-${p.img.slice(0, 3).toUpperCase()}-${String(100 + CATALOG.findIndex((x) => x.slug === p.slug) * 7).padStart(5, "0")}`);

/* ---------- Farm profile ---------- */
export type FarmPlot = { id: string; name: string; crop: string; product: string; ha: number; status: "Ready" | "Growing"; when: string; color: string; dLat: number; dLng: number };
export function plotsOf(f: Farm): FarmPlot[] {
  const own = CATALOG.filter((p) => p.farm === f.slug && p.cat !== "packs");
  const crops = own.length >= 3 ? own.slice(0, 3) : [...own, ...PRODUCTS.filter((p) => p.cat !== "packs" && p.farm !== f.slug)].slice(0, 3);
  const colors = ["#BBEA70", "#F7C33C", "#E5412B"];
  const offs: [number, number][] = [[0.012, -0.014], [0.004, 0.016], [-0.014, -0.002]];
  return crops.map((p, i) => ({
    id: String.fromCharCode(65 + i), name: `Plot ${String.fromCharCode(65 + i)}`, crop: p.name.split(",")[0], product: p.slug,
    ha: [5, 4, 3][i], status: i === 1 ? "Growing" : "Ready", when: i === 1 ? "2 weeks" : "harvest now", color: colors[i], dLat: offs[i][0], dLng: offs[i][1],
  }));
}
export const farmStats = (f: Farm): [string, string][] => [[`${f.ha} ha`, "Farmland"], [String(f.members), f.leader.includes("Amina") || f.name.includes("Women") ? "Women members" : "Members"], [String(f.members * 9 - 2), "Harvests traced"], ["99%", "On-time handovers"]];

/* ---------- Reviews ---------- */
export type Review = { id: string; name: string; initials: string; place: string; when: string; stars: number; text: string; photos: string[]; reply?: string; fresh?: boolean; age: number };
export const RATING = { avg: 4.8, count: 312, bars: [[5, 82], [4, 12], [3, 4], [2, 1], [1, 1]] as [number, number][] };
export const REVIEWS: Review[] = [
  { id: "r1", name: "Ama Owusu", initials: "AO", place: "Osu, Accra", when: "2 days ago", age: 2, stars: 5, text: "Still firm after five days in the fridge. I scanned the bag and saw they were picked the day before.", photos: ["tomatoes"], reply: "Thank you, Ama. We picked these on Sunday morning.", fresh: true },
  { id: "r2", name: "Kwame Boateng", initials: "KB", place: "Kumasi", when: "1 week ago", age: 7, stars: 5, text: "Best tomatoes I have bought in Kumasi. Good size, no bruises.", photos: [] },
  { id: "r3", name: "Yaw Mensah", initials: "YM", place: "Tamale", when: "3 weeks ago", age: 21, stars: 5, text: "I like seeing the spray record. My kids eat these raw.", photos: [] },
  { id: "r4", name: "Efua Asante", initials: "EA", place: "East Legon, Accra", when: "2 weeks ago", age: 14, stars: 4, text: "Very fresh. One or two were soft, but support replaced them the same day.", photos: ["tomatoes", "pepper"], fresh: true },
  { id: "r5", name: "Abena Darko", initials: "AD", place: "Tema", when: "3 weeks ago", age: 22, stars: 5, text: "Arrived the morning after harvest, exactly as the code said. Great for stew.", photos: ["tomatoes"], fresh: true },
  { id: "r6", name: "Kofi Adjei", initials: "KA", place: "Cantonments, Accra", when: "1 month ago", age: 30, stars: 4, text: "Good tomatoes. The two-hour slot was on time.", photos: [] },
  { id: "r7", name: "Mariam Issah", initials: "MI", place: "Tamale", when: "1 month ago", age: 34, stars: 5, text: "Nice to buy from women farmers near home. Ripe and sweet.", photos: [], reply: "We are glad you liked them, Mariam." },
];

/* ---------- Checkout and order ---------- */
export const PAY_OPTIONS = [
  { id: "mtn", name: "MTN Mobile Money", sub: "Approve on your phone", badge: "MTN", cls: "bg-sun text-night", momo: true },
  { id: "telecel", name: "Telecel Cash", sub: "Approve on your phone", badge: "T", cls: "bg-tomato text-white", momo: true },
  { id: "at", name: "AT Money", sub: "Approve on your phone", badge: "AT", cls: "bg-info text-white", momo: true },
  { id: "card", name: "Card", sub: "Visa or Mastercard", badge: "Card", cls: "bg-deep text-white", momo: false },
  { id: "bank", name: "Bank transfer", sub: "Pay to Verdant Foods, reference VF-2041", badge: "Bank", cls: "bg-muted text-white", momo: false },
] as const;
export const ORDER = {
  id: "2041", buyer: "Ama Owusu", phone: "024 555 0182", email: "ama.owusu@mail.com", address: "House 14, Osu Badu Street, Accra", slot: "Thursday 16 Oct, 9 am to 1 pm",
  next: [["circle-check", "Order confirmed", "Today, 14:32"], ["sprout", "Farms harvest your food", "Wednesday evening"], ["warehouse", "Packed and weighed", "Thursday, 6 am"], ["truck", "Out for delivery", "Thursday, 9 am"]] as [string, string, string][],
  farms: [
    { farm: "nyankpala-women-farmers", items: "Vine tomatoes, pepper", code: "VF-TOM-00048", tint: "bg-tomato-soft", photo: "/img/farmer-amina.jpg" },
    { farm: "wa-green-growers", items: "Fresh okra", code: "VF-OKR-00021", tint: "bg-lime-soft", photo: "/img/okra-harvest.jpg" },
    { farm: "lawra-yam-collective", items: "Puna yam", code: "VF-YAM-00107", tint: "bg-sun-soft", photo: "/img/yam-farmer.jpg" },
  ],
};
export const FREE_DELIVERY_AT = 200;
export const DELIVERY_FEE = 15;

/* ---------- Weekly box ---------- */
export const BOX_SIZES = [
  { id: "small", name: "Small", people: "For 1 to 2 people", price: 120, items: 8, tint: "bg-lime-soft" },
  { id: "medium", name: "Medium", people: "For 3 to 4 people", price: 180, items: 12, tint: "bg-lime-soft", popular: true },
  { id: "large", name: "Large", people: "For 5 or more", price: 250, items: 16, tint: "bg-sun-soft" },
] as const;
export const BOX_ITEMS: [string, string, string][] = [
  ["tomatoes", "Vine tomatoes", "1 kg"], ["kontomire", "Kontomire", "1 bunch"], ["garden-eggs", "Garden eggs", "500 g"], ["okra", "Okra", "500 g"],
  ["onions", "Red onions", "1 kg"], ["plantain", "Plantain", "4 fingers"], ["pepper", "Scotch bonnet", "250 g"], ["yam", "Puna yam", "1 tuber"],
  ["cabbage", "Cabbage", "1 head"], ["pawpaw", "Pawpaw", "1"], ["pineapple", "Pineapple", "1"], ["maize", "Fresh maize", "4 cobs"],
  ["tomatoes", "Plum tomatoes", "1 kg"], ["onions", "Shallots", "500 g"], ["okra", "Extra okra", "500 g"], ["pawpaw", "Family pawpaw", "1"],
];

/* ---------- Delivery ---------- */
export const ZONES = [
  { id: "accra", name: "Accra", days: "Mon to Sat", areas: "Osu, East Legon, Cantonments, Airport, Tema and 22 more", fee: "GH₵ 15, free over GH₵ 200", tint: "bg-lime-soft", lat: PLACES.accra.lat, lng: PLACES.accra.lng, size: 0.16 },
  { id: "kumasi", name: "Kumasi", days: "Tue, Thu, Sat", areas: "Adum, Asokwa, Nhyiaeso, Ahodwo and 9 more", fee: "GH₵ 15, free over GH₵ 200", tint: "bg-sun-soft", lat: PLACES.kumasi.lat, lng: PLACES.kumasi.lng, size: 0.13 },
  { id: "tamale", name: "Tamale", days: "Every day", areas: "All of Tamale Metro and Sagnarigu", fee: "GH₵ 10, free over GH₵ 150", tint: "bg-tomato-soft", lat: 9.4075, lng: -0.8533, size: 0.12 },
];
export const SLOTS: [string, ("Open" | "Few left" | "Full")[]][] = [
  ["7 to 9 am", ["Open", "Open", "Open"]], ["9 to 11 am", ["Few left", "Open", "Open"]], ["12 to 2 pm", ["Open", "Full", "Open"]], ["4 to 6 pm", ["Open", "Open", "Few left"]],
];
export const AREA_LOOKUP: Record<string, string> = {
  osu: "accra", "east legon": "accra", cantonments: "accra", airport: "accra", tema: "accra", accra: "accra", spintex: "accra", labone: "accra",
  adum: "kumasi", asokwa: "kumasi", nhyiaeso: "kumasi", ahodwo: "kumasi", kumasi: "kumasi", tamale: "tamale", sagnarigu: "tamale",
};

export const farmsFor = (items: Product[]) => FARMS.filter((f) => items.some((p) => p.farm === f.slug));
