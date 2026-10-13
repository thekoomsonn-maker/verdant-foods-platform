// Mock data only. The real API belongs to Verdant's backend team; these shapes are placeholders for the UI.
export type Cat = "vegetables" | "leafy-greens" | "roots-and-tubers" | "fruits" | "onions" | "grains" | "packs";
export type Proof = 1 | 2 | 3;

export const CATEGORIES: { slug: Cat | "all"; label: string; tint: string; accent: string }[] = [
  { slug: "all", label: "All produce", tint: "bg-mist", accent: "text-deep" },
  { slug: "vegetables", label: "Vegetables", tint: "bg-tomato-soft", accent: "text-tomato" },
  { slug: "leafy-greens", label: "Leafy greens", tint: "bg-lime-soft", accent: "text-leaf" },
  { slug: "roots-and-tubers", label: "Roots and tubers", tint: "bg-sun-soft", accent: "text-warning" },
  { slug: "fruits", label: "Fruits", tint: "bg-orange-soft", accent: "text-orange" },
  { slug: "onions", label: "Onions", tint: "bg-plum-soft", accent: "text-plum" },
  { slug: "grains", label: "Grains", tint: "bg-sun-soft", accent: "text-warning" },
  { slug: "packs", label: "Stock-up packs", tint: "bg-mint", accent: "text-deep" },
];

export type Farm = { slug: string; name: string; district: string; region: string; members: number; ha: number; since: number; lat: number; lng: number; leader: string; photo: string };
export const FARMS: Farm[] = [
  { slug: "nyankpala-women-farmers", name: "Nyankpala Women Farmers", district: "Tolon", region: "Northern", members: 24, ha: 12, since: 2019, lat: 9.4021, lng: -0.9876, leader: "Amina Seidu", photo: "/img/farmer-amina.jpg" },
  { slug: "tolon-growers-group", name: "Tolon Growers Group", district: "Tolon", region: "Northern", members: 31, ha: 18, since: 2020, lat: 9.4319, lng: -1.0632, leader: "Fati Alhassan", photo: "/img/weighing-collection.jpg" },
  { slug: "kumbungu-pepper-farm", name: "Kumbungu Pepper Farm", district: "Kumbungu", region: "Northern", members: 9, ha: 6, since: 2021, lat: 9.5583, lng: -0.9502, leader: "Issah Mahama", photo: "/img/pepper-harvest.jpg" },
  { slug: "savelugu-onion-growers", name: "Savelugu Onion Growers", district: "Savelugu", region: "Northern", members: 16, ha: 10, since: 2020, lat: 9.6244, lng: -0.8253, leader: "Abdul Rashid", photo: "/img/onion-harvest.jpg" },
  { slug: "wa-green-growers", name: "Wa Green Growers", district: "Wa", region: "Upper West", members: 18, ha: 9, since: 2022, lat: 10.0601, lng: -2.5099, leader: "Ama Mahama", photo: "/img/okra-harvest.jpg" },
  { slug: "nadowli-womens-group", name: "Nadowli Women’s Group", district: "Nadowli", region: "Upper West", members: 22, ha: 8, since: 2021, lat: 10.3686, lng: -2.6667, leader: "Gifty Dery", photo: "/img/elder-woman-farmer.jpg" },
  { slug: "lawra-yam-collective", name: "Lawra Yam Collective", district: "Lawra", region: "Upper West", members: 14, ha: 11, since: 2022, lat: 10.6467, lng: -2.8992, leader: "Paul Kuuire", photo: "/img/yam-farmer.jpg" },
  { slug: "kumbungu-fruit-farmers", name: "Kumbungu Fruit Farmers", district: "Kumbungu", region: "Northern", members: 12, ha: 7, since: 2023, lat: 9.5321, lng: -0.9817, leader: "Salamatu Iddrisu", photo: "/img/officer-training.jpg" },
  { slug: "verdant-farm-somanya", name: "Verdant Farm", district: "Yilo Krobo", region: "Eastern", members: 38, ha: 40, since: 2018, lat: 6.1043, lng: -0.0151, leader: "Kwame Ofori", photo: "/img/eastern-farm-aerial.jpg" },
  { slug: "dawhenya-vegetable-growers", name: "Dawhenya Vegetable Growers", district: "Ningo-Prampram", region: "Greater Accra", members: 20, ha: 12, since: 2023, lat: 5.7856, lng: 0.0505, leader: "Naa Adjeley Tetteh", photo: "/img/solar-pump.jpg" },
  { slug: "ekumfi-pineapple-growers", name: "Ekumfi Pineapple Growers", district: "Ekumfi", region: "Central", members: 17, ha: 15, since: 2022, lat: 5.2817, lng: -0.9003, leader: "Kojo Essel", photo: "/img/pineapple-farm.jpg" },
  { slug: "wassa-plantain-farmers", name: "Wassa Plantain Farmers", district: "Wassa Amenfi East", region: "Western", members: 26, ha: 22, since: 2022, lat: 5.7858, lng: -2.0611, leader: "Kwesi Arthur", photo: "/img/plantain-farm.jpg" },
  { slug: "sefwi-cocoyam-growers", name: "Sefwi Cocoyam Growers", district: "Sefwi Wiawso", region: "Western North", members: 19, ha: 9, since: 2023, lat: 6.2058, lng: -2.4859, leader: "Akosua Boateng", photo: "/img/momo-farmer.jpg" },
  { slug: "ejura-maize-farmers", name: "Ejura Maize Farmers", district: "Ejura-Sekyedumase", region: "Ashanti", members: 34, ha: 30, since: 2021, lat: 7.3847, lng: -1.3581, leader: "Yaw Owusu", photo: "/img/maize-field.jpg" },
  { slug: "wenchi-tomato-growers", name: "Wenchi Tomato Growers", district: "Wenchi", region: "Bono", members: 23, ha: 14, since: 2022, lat: 7.7392, lng: -2.1046, leader: "Kofi Adomako", photo: "/img/young-farmer-app.jpg" },
  { slug: "techiman-market-gardeners", name: "Techiman Market Gardeners", district: "Techiman", region: "Bono East", members: 21, ha: 10, since: 2023, lat: 7.5864, lng: -1.9387, leader: "Abena Serwaa", photo: "/img/cabbage-field.jpg" },
  { slug: "goaso-plantain-collective", name: "Goaso Plantain Collective", district: "Asunafo North", region: "Ahafo", members: 15, ha: 13, since: 2024, lat: 6.8036, lng: -2.5172, leader: "Kwabena Sarpong", photo: "/img/soil-testing.jpg" },
  { slug: "anloga-shallot-farmers", name: "Anloga Shallot Farmers", district: "Anloga", region: "Volta", members: 28, ha: 11, since: 2021, lat: 5.7947, lng: 0.8973, leader: "Edem Agbeko", photo: "/img/volta-shallots.jpg" },
  { slug: "nkwanta-yam-growers", name: "Nkwanta Yam Growers", district: "Nkwanta South", region: "Oti", members: 18, ha: 16, since: 2024, lat: 8.2616, lng: 0.5191, leader: "Bawa Kwaku", photo: "/img/aerial-plots.jpg" },
  { slug: "damongo-grain-farmers", name: "Damongo Grain Farmers", district: "West Gonja", region: "Savannah", members: 22, ha: 25, since: 2023, lat: 9.0833, lng: -1.8181, leader: "Jakpa Mahama", photo: "/img/hero-aerial.jpg" },
  { slug: "walewale-onion-growers", name: "Walewale Onion Growers", district: "West Mamprusi", region: "North East", members: 16, ha: 9, since: 2023, lat: 10.3519, lng: -0.7998, leader: "Asana Seidu", photo: "/img/farm-store.jpg" },
  { slug: "vea-tomato-irrigators", name: "Vea Tomato Irrigators", district: "Bongo", region: "Upper East", members: 30, ha: 14, since: 2022, lat: 10.8617, lng: -0.8569, leader: "Atanga Akolgo", photo: "/img/vea-irrigation.jpg" },
];
/** Ghana's 16 regions and where Verdant works in each. */
export const REGIONS_GH = ["Greater Accra", "Eastern", "Central", "Western", "Western North", "Ashanti", "Bono", "Bono East", "Ahafo", "Volta", "Oti", "Northern", "Savannah", "North East", "Upper East", "Upper West"] as const;
export const farmBySlug = (s: string) => FARMS.find((f) => f.slug === s) ?? FARMS[0];

export type Product = { slug: string; name: string; farm: string; price: number; unit: string; img: string; cat: Cat; fresh: string; proof: Proof; was?: number };
export const PRODUCTS: Product[] = [
  { slug: "vine-tomatoes", name: "Vine tomatoes", farm: "nyankpala-women-farmers", price: 45, was: 53, unit: "2 kg", img: "tomatoes", cat: "vegetables", fresh: "Picked today", proof: 3 },
  { slug: "garden-eggs", name: "Garden eggs", farm: "verdant-farm-somanya", price: 28, unit: "1 kg", img: "garden-eggs", cat: "vegetables", fresh: "Picked yesterday", proof: 3 },
  { slug: "fresh-okra", name: "Fresh okra", farm: "wa-green-growers", price: 22, unit: "1 kg", img: "okra", cat: "vegetables", fresh: "Picked today", proof: 2 },
  { slug: "scotch-bonnet", name: "Scotch bonnet pepper", farm: "kumbungu-pepper-farm", price: 18, unit: "500 g", img: "pepper", cat: "vegetables", fresh: "Picked 2 days ago", proof: 2 },
  { slug: "red-onions", name: "Red onions", farm: "savelugu-onion-growers", price: 24, unit: "2 kg", img: "onions", cat: "onions", fresh: "Picked 3 days ago", proof: 3 },
  { slug: "green-cabbage", name: "Green cabbage", farm: "techiman-market-gardeners", price: 15, unit: "each", img: "cabbage", cat: "leafy-greens", fresh: "Picked yesterday", proof: 2 },
  { slug: "kontomire", name: "Kontomire", farm: "sefwi-cocoyam-growers", price: 12, unit: "bunch", img: "kontomire", cat: "leafy-greens", fresh: "Picked today", proof: 1 },
  { slug: "cooking-plantain", name: "Cooking plantain", farm: "wassa-plantain-farmers", price: 30, unit: "4 fingers", img: "plantain", cat: "fruits", fresh: "Picked 2 days ago", proof: 2 },
  { slug: "puna-yam", name: "Puna yam", farm: "lawra-yam-collective", price: 26, unit: "tuber", img: "yam", cat: "roots-and-tubers", fresh: "Picked 3 days ago", proof: 3 },
  { slug: "sugarloaf-pineapple", name: "Sugarloaf pineapple", farm: "ekumfi-pineapple-growers", price: 20, unit: "each", img: "pineapple", cat: "fruits", fresh: "Picked today", proof: 2 },
  { slug: "solo-pawpaw", name: "Solo pawpaw", farm: "tolon-growers-group", price: 16, unit: "each", img: "pawpaw", cat: "fruits", fresh: "Picked yesterday", proof: 2 },
  { slug: "fresh-maize", name: "Fresh maize", farm: "ejura-maize-farmers", price: 14, unit: "4 cobs", img: "maize", cat: "grains", fresh: "Picked today", proof: 1 },
  { slug: "family-box", name: "Family veg box", farm: "nyankpala-women-farmers", price: 180, unit: "box", img: "box", cat: "packs", fresh: "Packed to order", proof: 3 },
];
export const productBySlug = (s: string) => PRODUCTS.find((p) => p.slug === s) ?? PRODUCTS[0];
export const productImg = (p: Product) => `/products/${p.img}.jpg`;
export const TINT: Record<string, string> = { tomatoes: "#FDE4DF", pepper: "#FDE4DF", "garden-eggs": "#F3E3EC", onions: "#F3E3EC", okra: "#EEF8DE", kontomire: "#EEF8DE", cabbage: "#EEF8DE", plantain: "#FDF2D4", yam: "#FDF2D4", maize: "#FDF2D4", pineapple: "#FFE8D6", pawpaw: "#FFE8D6", box: "#E4EFE8" };

export const PROOF: Record<Proof, { label: string; tone: "success" | "info" | "neutral" }> = {
  3: { label: "Weighed and photographed", tone: "success" },
  2: { label: "Checked by officer", tone: "info" },
  1: { label: "Logged by farmer", tone: "neutral" },
};

// A traced batch, step by step, with real coordinates.
export const JOURNEY = {
  code: "VF-TOM-00048", batch: "VF-B-1182", product: "Vine tomatoes", farm: "nyankpala-women-farmers", farmer: "Amina Seidu",
  hoursSincePick: 31,
  steps: [
    { icon: "sprout", title: "Harvested", place: "Plot A · Amina Seidu", time: "12 Oct · 07:40", kg: "400 kg", note: "Weighed and photographed", lat: 9.4021, lng: -0.9876 },
    { icon: "scale", title: "Collected", place: "Tolon point · Officer Yaw", time: "12 Oct · 10:15", kg: "398 kg", note: "Weighed with the farmer", lat: 9.4319, lng: -1.0632 },
    { icon: "warehouse", title: "Sorted and packed", place: "Tamale packhouse · VF-B-1182", time: "12 Oct · 16:30", kg: "396 kg", note: "Grade A", lat: 9.4008, lng: -0.8393 },
    { icon: "truck", title: "On the road", place: "Cold van GT 4471-22 · 4 °C", time: "13 Oct · 04:00", kg: "", note: "", lat: 7.95, lng: -1.03 },
    { icon: "house", title: "Delivered to you", place: "Osu, Accra", time: "13 Oct · 10:15", kg: "2 kg", note: "Your share", lat: 5.5571, lng: -0.1818 },
  ],
  sprays: [
    { date: "20 Sep", input: "Neem spray", type: "Organic", gap: "7 days" },
    { date: "24 Sep", input: "Compost, 2 bags", type: "Fertiliser", gap: "None" },
    { date: "26 Sep", input: "Copper fungicide", type: "Approved spray", gap: "14 days" },
    { date: "3 Oct", input: "Drip water only", type: "Water", gap: "None" },
  ],
};

// Small square-ish plot around a point (approx. hectares -> degrees).
export function plotAround(lat: number, lng: number, size = 0.006, skew = 0.0015): [number, number][] {
  return [
    [lng - size, lat + size - skew], [lng + size + skew, lat + size], [lng + size, lat - size + skew], [lng - size - skew, lat - size], [lng - size, lat + size - skew],
  ];
}

export const PLACES = {
  tamale: { name: "Tamale packhouse", lat: 9.4008, lng: -0.8393 },
  tolon: { name: "Tolon point", lat: 9.4319, lng: -1.0632 },
  accra: { name: "Accra", lat: 5.6037, lng: -0.187 },
  hq: { name: "Verdant head office, Accra", lat: 5.6052, lng: -0.1718 },
  somanya: { name: "Verdant Farm and packhouse, Somanya", lat: 6.1043, lng: -0.0151 },
  kumasi: { name: "Kumasi", lat: 6.6885, lng: -1.6244 },
  wa: { name: "Wa point", lat: 10.0601, lng: -2.5099 },
};

export const STORIES = [
  { slug: "amina-doubled-her-tomato-plot", img: "/img/farmer-amina.jpg", tag: "Farmers", title: "Amina doubled her tomato plot", meta: "12 Oct · 3 min" },
  { slug: "every-plot-is-now-on-the-map", img: "/img/officer-tablet.jpg", tag: "News", title: "Every plot is now on the map", meta: "8 Oct · 2 min" },
  { slug: "how-osu-kitchen-plans-its-week", img: "/img/restaurant-plating.jpg", tag: "Business", title: "How Osu Kitchen plans its week", meta: "2 Oct · 4 min" },
  { slug: "savings-that-pay-for-irrigation", img: "/img/solar-pump.jpg", tag: "Farmers", title: "Savings that pay for irrigation", meta: "28 Sep · 5 min" },
  { slug: "inside-this-weeks-box", img: "/img/box-flatlay.jpg", tag: "Food", title: "Inside this week’s box", meta: "25 Sep · 2 min" },
  { slug: "cold-vans-now-reach-kumasi", img: "/img/van-highway.jpg", tag: "News", title: "Cold vans now reach Kumasi", meta: "19 Sep · 2 min" },
];

export const cedi = (n: number) => `GH₵ ${n.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;
