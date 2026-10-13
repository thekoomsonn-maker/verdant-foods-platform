// Mock data for the shopper account pages. Placeholder shapes only; the real API belongs to Verdant's backend team.
import { PRODUCTS, productBySlug, type Product } from "./data";

export const USER = {
  first: "Ama", name: "Ama Owusu", initials: "AO", since: "March 2026", area: "Osu, Accra",
  phone: "+233 24 555 0182", email: "ama.owusu@example.com",
};

export type OrderStatus = "On the way" | "Delivered" | "Refunded";
export type OrderLine = { slug: string; qty: number; trace?: string };
export type Order = {
  id: string; date: string; when: string; status: OrderStatus; total: number; lines: OrderLine[];
  eta?: string; batch?: string; picked?: string; hoursFromHarvest?: number;
};

export const ORDERS: Order[] = [
  { id: "VF-20418", date: "13 Oct", when: "Today, 11:40 am", status: "On the way", total: 131, eta: "11:40 am", batch: "VF-B-1182", picked: "12 Oct · 07:40",
    lines: [{ slug: "vine-tomatoes", qty: 1, trace: "VF-TOM-00048" }, { slug: "scotch-bonnet", qty: 1, trace: "VF-PEP-00031" }, { slug: "fresh-okra", qty: 1, trace: "VF-OKR-00021" }, { slug: "puna-yam", qty: 2, trace: "VF-YAM-00107" }] },
  { id: "VF-20384", date: "6 Oct", when: "6 Oct, 10:05 am", status: "Delivered", total: 149, batch: "VF-B-1164", picked: "5 Oct · 06:50", hoursFromHarvest: 29,
    lines: [{ slug: "vine-tomatoes", qty: 1, trace: "VF-TOM-00048" }, { slug: "kontomire", qty: 1 }, { slug: "fresh-okra", qty: 1 }, { slug: "garden-eggs", qty: 1 }, { slug: "scotch-bonnet", qty: 1 }] },
  { id: "VF-20312", date: "29 Sep", when: "29 Sep, 9:20 am", status: "Delivered", total: 59, batch: "VF-B-1131", picked: "28 Sep · 07:10", hoursFromHarvest: 34,
    lines: [{ slug: "fresh-okra", qty: 1 }, { slug: "green-cabbage", qty: 1 }, { slug: "solo-pawpaw", qty: 1 }] },
  { id: "VF-20255", date: "22 Sep", when: "22 Sep, 11:00 am", status: "Delivered", total: 152, batch: "VF-B-1102", picked: "21 Sep · 08:00", hoursFromHarvest: 31,
    lines: [{ slug: "puna-yam", qty: 2 }, { slug: "cooking-plantain", qty: 1 }, { slug: "red-onions", qty: 1 }, { slug: "fresh-maize", qty: 1 }, { slug: "sugarloaf-pineapple", qty: 1 }, { slug: "kontomire", qty: 1 }] },
  { id: "VF-20197", date: "15 Sep", when: "15 Sep, 10:30 am", status: "Delivered", total: 162, batch: "VF-B-1077", picked: "14 Sep · 07:30", hoursFromHarvest: 27,
    lines: [{ slug: "family-box", qty: 1 }] },
  { id: "VF-20140", date: "8 Sep", when: "8 Sep", status: "Refunded", total: 28, lines: [{ slug: "garden-eggs", qty: 1 }] },
];
export const orderById = (id: string) => ORDERS.find((o) => o.id.toLowerCase() === id.toLowerCase());
export const orderProducts = (o: Order): (Product & { qty: number; trace?: string })[] => o.lines.map((l) => ({ ...productBySlug(l.slug), qty: l.qty, trace: l.trace }));
export const itemCount = (o: Order) => o.lines.reduce((a, l) => a + l.qty, 0);
export const farmCount = (o: Order) => new Set(o.lines.map((l) => productBySlug(l.slug).farm)).size;
export const STATUS_TONE: Record<OrderStatus, "info" | "success" | "warning"> = { "On the way": "info", Delivered: "success", Refunded: "warning" };

// Delivery tracking: Accra hub (Spintex Road) to the door in Osu. [lng, lat]
export const DELIVERY = {
  hub: { name: "Accra hub, Spintex Road", lat: 5.6365, lng: -0.1102 },
  door: { name: "Home, Osu", lat: 5.5571, lng: -0.1818 },
  route: [[-0.1102, 5.6365], [-0.1255, 5.6301], [-0.1418, 5.6196], [-0.1531, 5.6052], [-0.1622, 5.5905], [-0.1705, 5.5752], [-0.1771, 5.5638], [-0.1818, 5.5571]] as [number, number][],
  driver: { name: "Kwame Asante", initials: "KA", van: "Cold van GT 4471-22", phone: "+233 20 000 4471", away: "12 km away" },
  steps: [
    { icon: "package", title: "Packed for you", place: "Tamale packhouse", time: "12 Oct · 18:10", done: true },
    { icon: "truck", title: "Left the packhouse", place: "Cold van, 4 °C", time: "13 Oct · 01:30", done: true },
    { icon: "warehouse", title: "Reached Accra", place: "Accra hub, Spintex Road", time: "13 Oct · 08:55", done: true },
    { icon: "navigation", title: "Out for delivery", place: "Kojo is 3 stops away", time: "13 Oct · 10:20", done: true },
    { icon: "house", title: "At your door", place: "Osu, Accra", time: "Expected 11:40", done: false },
  ],
};

export type Address = { id: string; label: string; line: string; area: string; note?: string; icon: string };
export const ADDRESSES: Address[] = [
  { id: "home", label: "Home", line: "House 14, Osu Badu Street", area: "Osu, Accra", note: "Gate code 2204", icon: "house" },
  { id: "work", label: "Work", line: "Spintex Road office", area: "Spintex, Accra", note: "Ask for reception", icon: "building-2" },
];
export type PayMethod = { id: string; label: string; sub: string; badge: string; badgeCls: string };
export const PAYMENTS: PayMethod[] = [
  { id: "mtn", label: "MTN Mobile Money", sub: "024 ••• 0182", badge: "MTN", badgeCls: "bg-sun text-night" },
  { id: "visa", label: "Visa ending 4421", sub: "Expires 08/28", badge: "Visa", badgeCls: "bg-deep text-white" },
  { id: "telecel", label: "Telecel Cash", sub: "020 ••• 3317", badge: "T", badgeCls: "bg-tomato text-white" },
];

export const SAVED = ["vine-tomatoes", "kontomire", "garden-eggs", "puna-yam", "sugarloaf-pineapple", "fresh-okra", "red-onions", "solo-pawpaw"].map((slug) => {
  const p = productBySlug(slug);
  return { ...p, inStock: !["red-onions", "solo-pawpaw"].includes(slug), dropped: slug === "vine-tomatoes" || slug === "puna-yam" };
});
export const FOLLOWED_FARMS = [
  { slug: "nyankpala-women-farmers", initials: "NW", news: "New harvest today", grows: "Tomatoes, pepper", orders: 9, tint: "bg-tomato-soft" },
  { slug: "tolon-growers-group", initials: "TG", news: "Garden eggs back", grows: "Garden eggs, plantain", orders: 5, tint: "bg-plum-soft" },
  { slug: "wa-green-growers", initials: "WG", news: "Okra ready Friday", grows: "Okra, cabbage", orders: 6, tint: "bg-lime-soft" },
];

export const BUY_FROM = [
  { slug: "nyankpala-women-farmers", grows: "Tomatoes, pepper", orders: 9, tint: "bg-tomato-soft" },
  { slug: "wa-green-growers", grows: "Okra, cabbage", orders: 6, tint: "bg-lime-soft" },
  { slug: "lawra-yam-collective", grows: "Yam", orders: 4, tint: "bg-sun-soft" },
];

export const BOX = {
  name: "Home essentials", day: "Wednesday", window: "9 to 11 am", size: "Medium", saved: 186, swaps: 3, editUntil: "Sun 8 pm",
  sizes: [{ id: "Small", items: 8, price: 120 }, { id: "Medium", items: 12, price: 180 }, { id: "Large", items: 16, price: 250 }],
  items: [
    { slug: "vine-tomatoes", amount: "1 kg" }, { slug: "kontomire", amount: "1 bunch" }, { slug: "garden-eggs", amount: "500 g" },
    { slug: "fresh-okra", amount: "500 g" }, { slug: "red-onions", amount: "1 kg" }, { slug: "cooking-plantain", amount: "4 fingers" },
  ],
  swapFor: ["green-cabbage", "scotch-bonnet", "puna-yam", "solo-pawpaw", "fresh-maize", "sugarloaf-pineapple"],
  upcoming: [
    { date: "Wed 15 Oct", long: "Wednesday 15 October", size: "Medium", skipped: false },
    { date: "Wed 22 Oct", long: "Wednesday 22 October", size: "Medium", skipped: true },
    { date: "Wed 29 Oct", long: "Wednesday 29 October", size: "Large", skipped: false },
    { date: "Wed 5 Nov", long: "Wednesday 5 November", size: "Medium", skipped: false },
  ],
};

export const PROBLEMS = ["Damaged", "Not fresh", "Missing", "Wrong item", "Other"];
export const ALL_PRODUCTS = PRODUCTS;
