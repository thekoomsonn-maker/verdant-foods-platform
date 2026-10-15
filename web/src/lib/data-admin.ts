// Mock data for admin pages 25–33. Placeholder shapes for the UI only; the real API belongs to Verdant's backend team.
import { FARMS, PLACES, plotAround, type Proof } from "./data";

export type OrderStatus = "To pack" | "Packing" | "On the way" | "Delivered" | "Unpaid" | "Refund asked";
export type AdminOrder = {
  id: string; customer: string; type: "Shopper" | "Business"; items: number; total: number; status: OrderStatus;
  delivery: string; payment: string; lines: { name: string; qty: string; img: string; code: string; proof: Proof }[];
};

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "2041", customer: "Ama Owusu", type: "Shopper", items: 4, total: 197, status: "On the way", delivery: "Today 11:00 am · East Legon", payment: "Mobile money · paid",
    lines: [{ name: "Vine tomatoes", qty: "2 kg", img: "tomatoes", code: "VF-TOM-00048", proof: 3 }, { name: "Fresh okra", qty: "1 kg", img: "okra", code: "VF-OKR-00021", proof: 3 }, { name: "Kontomire", qty: "2 bunches", img: "kontomire", code: "VF-KON-00062", proof: 1 }] },
  { id: "2040", customer: "Osu Kitchen Group", type: "Business", items: 12, total: 6820, status: "Packing", delivery: "Today 6:00 am · Osu", payment: "Invoice · 30 days",
    lines: [{ name: "Tomatoes", qty: "120 kg", img: "tomatoes", code: "VF-TOM-00048", proof: 3 }, { name: "Red onions", qty: "80 kg", img: "onions", code: "VF-ONI-00117", proof: 3 }, { name: "Kontomire", qty: "40 bunches", img: "kontomire", code: "VF-KON-00062", proof: 3 }] },
  { id: "2039", customer: "Yaw Boateng", type: "Shopper", items: 3, total: 92, status: "Delivered", delivery: "Yesterday 4:20 pm · Dzorwulu", payment: "Card · paid",
    lines: [{ name: "Sugarloaf pineapple", qty: "2", img: "pineapple", code: "VF-PIN-00031", proof: 2 }, { name: "Solo pawpaw", qty: "1", img: "pawpaw", code: "VF-PAW-00019", proof: 2 }] },
  { id: "2038", customer: "Labadi Hotel Group", type: "Business", items: 9, total: 5800, status: "Unpaid", delivery: "Yesterday 6:00 am · Labadi", payment: "Invoice · due 20 Oct",
    lines: [{ name: "Puna yam", qty: "60 tubers", img: "yam", code: "VF-YAM-00107", proof: 2 }, { name: "Green cabbage", qty: "40", img: "cabbage", code: "VF-CAB-00044", proof: 2 }] },
  { id: "2037", customer: "Efua Ansah", type: "Shopper", items: 2, total: 64, status: "Refund asked", delivery: "12 Oct · Tema Comm. 25", payment: "Mobile money · paid",
    lines: [{ name: "Garden eggs", qty: "1 kg", img: "garden-eggs", code: "VF-GEG-00012", proof: 1 }, { name: "Scotch bonnet pepper", qty: "500 g", img: "pepper", code: "VF-PEP-00049", proof: 2 }] },
  { id: "2036", customer: "Kumasi Grand Hotel", type: "Business", items: 15, total: 8140, status: "Delivered", delivery: "12 Oct · Kumasi", payment: "Invoice · paid",
    lines: [{ name: "Vine tomatoes", qty: "150 kg", img: "tomatoes", code: "VF-TOM-00048", proof: 3 }, { name: "Red onions", qty: "100 kg", img: "onions", code: "VF-ONI-00117", proof: 3 }] },
  { id: "2035", customer: "Abena Mensah", type: "Shopper", items: 5, total: 148, status: "To pack", delivery: "Today 2:00 pm · Airport Res.", payment: "Mobile money · paid",
    lines: [{ name: "Family veg box", qty: "1", img: "box", code: "VF-BOX-00210", proof: 3 }] },
  { id: "2034", customer: "Melcom Foods", type: "Business", items: 7, total: 3260, status: "To pack", delivery: "Tomorrow 6:00 am · Spintex", payment: "Invoice · 14 days",
    lines: [{ name: "Fresh maize", qty: "200 cobs", img: "maize", code: "VF-MAI-00088", proof: 1 }, { name: "Cooking plantain", qty: "120 fingers", img: "plantain", code: "VF-PLA-00073", proof: 2 }] },
];

export const ORDER_TONE: Record<OrderStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "To pack": "warning", Packing: "warning", "On the way": "info", Delivered: "success", Unpaid: "neutral", "Refund asked": "danger",
};

export const SALES_14 = [11.2, 12.6, 11.4, 12.1, 13.8, 13.1, 14.2, 15.6, 14.8, 15.4, 16.9, 16.2, 17.1, 18.42];
export const SALES_14_LAST = [10.4, 11.1, 10.9, 11.6, 12.2, 12.0, 12.8, 13.4, 13.1, 13.7, 14.2, 14.0, 14.9, 16.4];

export const PROBLEMS_TO_FIX: { icon: string; title: string; sub: string; action: string; tone: "danger" | "warning" | "info"; href: "weights" | "products" | "farmers" | "checks" | "problems"; toast?: string }[] = [
  { icon: "scale", title: "Weight mismatch at Tamale packhouse", sub: "Batch VF-B-1190 · 520 kg out, 400 kg in", action: "Investigate", tone: "danger", href: "weights" },
  { icon: "spray-can", title: "Harvest too soon after spraying", sub: "Kumbungu Pepper Farm · 9 days, needs 14", action: "Block lot", tone: "danger", href: "products", toast: "Lot VF-PEP-00052 blocked until 18 Oct" },
  { icon: "map-pin", title: "4 farms have no mapped plot", sub: "Wa and Lawra districts", action: "Assign officer", tone: "warning", href: "farmers", toast: "Officer Yaw assigned to map 4 plots" },
  { icon: "badge-check", title: "7 farm checks overdue", sub: "Oldest: 3 days", action: "Review", tone: "warning", href: "checks" },
  { icon: "spray-can", title: "3 harvests missing spray records", sub: "Tolon Growers Group", action: "Ask farmer", tone: "info", href: "problems", toast: "Reminder sent to Fati Alhassan" },
];

export type Lot = { code: string; product: string; farm: string; kg: number; proof: Proof; gap: string; gapTone: "success" | "danger" | "warning"; blocked?: boolean };
export const LOTS: Lot[] = [
  { code: "VF-TOM-00048", product: "Vine tomatoes", farm: "Nyankpala Women Farmers", kg: 400, proof: 3, gap: "16 days · safe", gapTone: "success" },
  { code: "VF-PEP-00052", product: "Scotch bonnet", farm: "Kumbungu Pepper Farm", kg: 120, proof: 2, gap: "9 days · blocked", gapTone: "danger", blocked: true },
  { code: "VF-OKR-00021", product: "Fresh okra", farm: "Wa Green Growers", kg: 60, proof: 3, gap: "21 days · safe", gapTone: "success" },
  { code: "VF-GEG-00012", product: "Garden eggs", farm: "Tolon Growers Group", kg: 210, proof: 1, gap: "No record", gapTone: "warning" },
  { code: "VF-YAM-00107", product: "Puna yam", farm: "Lawra Yam Collective", kg: 300, proof: 2, gap: "No spray", gapTone: "success" },
  { code: "VF-ONI-00117", product: "Red onions", farm: "Savelugu Onion Growers", kg: 280, proof: 3, gap: "18 days · safe", gapTone: "success" },
];

export type Buyer = { name: string; init: string; type: "Restaurant" | "Hotel" | "Shop"; month: number; credit: string; status: "Active" | "Review" | "Over limit"; city: string; since: string; year: number; agreements: number; ontime: string; claims: string; spend: number[] };
export const BUYERS: Buyer[] = [
  { name: "Osu Kitchen Group", init: "OK", type: "Restaurant", month: 48620, credit: "24% used", status: "Active", city: "Accra", since: "Feb 2026", year: 312400, agreements: 3, ontime: "96%", claims: "1 this year", spend: [22, 26, 24, 23, 29, 31, 28, 27, 33, 36, 38, 41] },
  { name: "Labadi Hotel Group", init: "LH", type: "Hotel", month: 36200, credit: "61% used", status: "Active", city: "Accra", since: "Mar 2026", year: 248900, agreements: 2, ontime: "91%", claims: "None", spend: [18, 21, 25, 24, 22, 27, 29, 30, 28, 31, 34, 36] },
  { name: "Kumasi Grand Hotel", init: "KG", type: "Hotel", month: 29880, credit: "12% used", status: "Active", city: "Kumasi", since: "Jun 2026", year: 121300, agreements: 1, ontime: "100%", claims: "None", spend: [8, 10, 12, 15, 19, 21, 24, 26, 25, 28, 29, 30] },
  { name: "Melcom Foods", init: "MF", type: "Shop", month: 12400, credit: "—", status: "Review", city: "Accra", since: "Sep 2026", year: 24800, agreements: 0, ontime: "—", claims: "None", spend: [0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 11, 12] },
  { name: "Tema Foods Ltd", init: "TF", type: "Shop", month: 9100, credit: "88% used", status: "Over limit", city: "Tema", since: "Apr 2026", year: 82600, agreements: 1, ontime: "74%", claims: "2 this year", spend: [6, 7, 9, 8, 10, 9, 8, 11, 10, 9, 8, 9] },
];
export const SHOPPERS = [
  { name: "Ama Owusu", area: "East Legon", orders: 18, month: 820, last: "Today" },
  { name: "Yaw Boateng", area: "Dzorwulu", orders: 9, month: 410, last: "Yesterday" },
  { name: "Efua Ansah", area: "Tema Comm. 25", orders: 4, month: 164, last: "12 Oct" },
  { name: "Abena Mensah", area: "Airport Res.", orders: 22, month: 1140, last: "Today" },
  { name: "Kojo Asante", area: "Cantonments", orders: 6, month: 298, last: "9 Oct" },
];
export const WAITING_BUYERS = [
  { name: "Accra City Bistro", type: "Restaurant", asked: "Credit GH₵ 20,000", docs: "Business registration, TIN" },
  { name: "Takoradi Beach Resort", type: "Hotel", asked: "Credit GH₵ 45,000", docs: "Business registration" },
  { name: "Shoprite Junction Mall", type: "Shop", asked: "Pay on order", docs: "Business registration, TIN, bank letter" },
];

export type FarmRow = { slug: string; init: string; plots: number; status: string; tone: "success" | "danger" | "warning"; proof: Proof; mapped: boolean; plotTone: "ok" | "due" | "problem" };
export const FARM_ROWS: FarmRow[] = [
  { slug: "nyankpala-women-farmers", init: "NW", plots: 3, status: "Checked 6 Oct", tone: "success", proof: 3, mapped: true, plotTone: "ok" },
  { slug: "kumbungu-pepper-farm", init: "KP", plots: 1, status: "Spray issue", tone: "danger", proof: 2, mapped: true, plotTone: "problem" },
  { slug: "wa-green-growers", init: "WG", plots: 2, status: "Checked 2 Oct", tone: "success", proof: 3, mapped: true, plotTone: "ok" },
  { slug: "lawra-yam-collective", init: "LY", plots: 0, status: "Check due", tone: "warning", proof: 1, mapped: false, plotTone: "due" },
  { slug: "tolon-growers-group", init: "TG", plots: 4, status: "Check due", tone: "warning", proof: 2, mapped: true, plotTone: "due" },
  { slug: "savelugu-onion-growers", init: "SO", plots: 2, status: "Checked 9 Oct", tone: "success", proof: 3, mapped: true, plotTone: "ok" },
];
export const PLOT_COLOR = { ok: "#BBEA70", due: "#F7C33C", problem: "#E5412B" } as const;

/** Plots for every mapped farm, offset a little so several plots sit side by side. */
export function farmPlots() {
  return FARM_ROWS.filter((r) => r.mapped).flatMap((r) => {
    const f = FARMS.find((x) => x.slug === r.slug)!;
    return Array.from({ length: Math.max(1, r.plots) }, (_, i) => ({
      id: `${r.slug}-${i}`, name: f.name, color: PLOT_COLOR[r.plotTone],
      coords: plotAround(f.lat + (i % 2) * 0.016 - 0.004, f.lng + Math.floor(i / 2) * 0.017 + (i % 2) * 0.006, 0.0055, 0.0014),
    }));
  });
}

export const GROUPS = [
  { name: "Nkwanta Women VSLA", init: "NW", district: "Tolon", members: 24, savings: 18640, late: 1, meeting: "Meeting 14 · 19 present", synced: false },
  { name: "Tolon Savers", init: "TS", district: "Tolon", members: 28, savings: 21300, late: 0, meeting: "Meeting 22 · 24 present", synced: true },
  { name: "Wa Market Women", init: "WM", district: "Wa", members: 17, savings: 9880, late: 2, meeting: "Meeting 9 · 17 present", synced: true },
  { name: "Lawra Unity Group", init: "LU", district: "Lawra", members: 31, savings: 24150, late: 0, meeting: "Meeting 30 · 21 present", synced: false },
  { name: "Nyankpala Sisters", init: "NS", district: "Tolon", members: 22, savings: 16200, late: 0, meeting: "Meeting 18 · 20 present", synced: true },
  { name: "Savelugu Progress", init: "SP", district: "Savelugu", members: 26, savings: 19420, late: 1, meeting: "Meeting 12 · 23 present", synced: true },
];
export const WEEKLY_SAVINGS = [8.2, 8.9, 10.4, 9.8, 11.6, 12.1, 11.6, 13.1, 14.2, 13.1, 15.2, 15.9, 16.6, 18.4];

export type FarmCheck = {
  id: string; farm: string; plot: string; officer: string; due: string; overdue: number; kind: string;
  items: [string, boolean][]; note: string; photos: number; ha: number;
};
export const CHECKS: FarmCheck[] = [
  { id: "FC-3108", farm: "kumbungu-pepper-farm", plot: "Plot A · pepper", officer: "Officer Yaw Darko", due: "10 Oct", overdue: 3, kind: "Spray record check", ha: 1.4, photos: 6,
    items: [["Plot boundary matches the map", true], ["Spray log matches the store receipt", true], ["Safe gap before harvest kept", false], ["Water source is clean", true]],
    note: "Copper fungicide sprayed 26 Sep. Harvest started 5 Oct, 9 days later. The safe gap is 14 days." },
  { id: "FC-3107", farm: "tolon-growers-group", plot: "Plot C · garden eggs", officer: "Officer Adwoa Nyarko", due: "11 Oct", overdue: 2, kind: "Spray record check", ha: 2.1, photos: 4,
    items: [["Plot boundary matches the map", true], ["Spray log matches the store receipt", false], ["Safe gap before harvest kept", true], ["Water source is clean", true]],
    note: "Three harvests have no spray record. Farmer says the log book was left at home." },
  { id: "FC-3105", farm: "nyankpala-women-farmers", plot: "Plot A · tomatoes", officer: "Officer Yaw Darko", due: "12 Oct", overdue: 1, kind: "Routine 90-day check", ha: 3.2, photos: 9,
    items: [["Plot boundary matches the map", true], ["Spray log matches the store receipt", true], ["Safe gap before harvest kept", true], ["Water source is clean", true]],
    note: "All good. Drip lines replaced on the east side." },
  { id: "FC-3104", farm: "wa-green-growers", plot: "Plot B · okra", officer: "Officer Kwame Dery", due: "12 Oct", overdue: 1, kind: "New plot mapping", ha: 1.8, photos: 5,
    items: [["Plot boundary matches the map", true], ["Spray log matches the store receipt", true], ["Safe gap before harvest kept", true], ["Water source is clean", true]],
    note: "Second plot walked with GPS. 1.8 ha, slightly larger than the farmer said." },
  { id: "FC-3102", farm: "lawra-yam-collective", plot: "Not mapped yet", officer: "Officer Kwame Dery", due: "13 Oct", overdue: 0, kind: "New plot mapping", ha: 2.4, photos: 0,
    items: [["Plot boundary matches the map", false], ["Spray log matches the store receipt", true], ["Safe gap before harvest kept", true], ["Water source is clean", true]],
    note: "Visit planned for this afternoon." },
  { id: "FC-3101", farm: "savelugu-onion-growers", plot: "Plot A · onions", officer: "Officer Adwoa Nyarko", due: "13 Oct", overdue: 0, kind: "Routine 90-day check", ha: 2.6, photos: 7,
    items: [["Plot boundary matches the map", true], ["Spray log matches the store receipt", true], ["Safe gap before harvest kept", true], ["Water source is clean", true]],
    note: "Onions curing well. Stores are dry." },
];

export const TRACE_CODES: Record<string, { product: string; kg: number; scans: number; farm: string; steps: { icon: string; title: string; sub: string; kg: string }[]; buyers: [string, string][] }> = {
  "VF-TOM-00048": {
    product: "Vine tomatoes", kg: 400, scans: 214, farm: "nyankpala-women-farmers",
    steps: [
      { icon: "sprout", title: "Harvested · Plot A", sub: "Amina Seidu · 12 Oct 07:40", kg: "400 kg" },
      { icon: "scale", title: "Collected · Tolon point", sub: "Officer Yaw · 10:15", kg: "398 kg" },
      { icon: "git-merge", title: "Packed into batch VF-B-1182", sub: "Tamale packhouse · 16:30", kg: "396 kg" },
      { icon: "split", title: "Split into 6 orders", sub: "#2041, #2040, #2036 and 3 more", kg: "396 kg" },
    ],
    buyers: [["Osu Kitchen Group", "120 kg"], ["Kumasi Grand Hotel", "150 kg"], ["Ama Owusu", "2 kg"], ["3 more shoppers", "6 kg"]],
  },
  "VF-PEP-00052": {
    product: "Scotch bonnet", kg: 120, scans: 0, farm: "kumbungu-pepper-farm",
    steps: [
      { icon: "sprout", title: "Harvested · Plot A", sub: "Issah Mahama · 5 Oct 06:50", kg: "120 kg" },
      { icon: "scale", title: "Collected · Kumbungu point", sub: "Officer Yaw · 09:30", kg: "119 kg" },
      { icon: "siren", title: "Held at Tamale packhouse", sub: "Blocked by spray rule · until 18 Oct", kg: "119 kg" },
    ],
    buyers: [],
  },
};
export const TRACE_STOPS = (() => {
  const farm = FARMS[0];
  return {
    farm: { lat: farm.lat, lng: farm.lng },
    tolon: PLACES.tolon, tamale: PLACES.tamale,
    buyers: [{ ...PLACES.accra, label: "Osu Kitchen Group" }, { ...PLACES.kumasi, label: "Kumasi Grand Hotel" }],
  };
})();

export type Payout = { name: string; init: string; kind: "Farmer" | "Savings group" | "Driver"; amount: number; method: string; status: "Ready" | "Held" | "Paid" };
export const PAYOUTS: Payout[] = [
  { name: "Nyankpala Women Farmers", init: "NW", kind: "Farmer", amount: 14820, method: "MTN MoMo", status: "Ready" },
  { name: "Tolon Growers Group", init: "TG", kind: "Farmer", amount: 9640, method: "MTN MoMo", status: "Ready" },
  { name: "Savelugu Onion Growers", init: "SO", kind: "Farmer", amount: 7280, method: "Telecel Cash", status: "Ready" },
  { name: "Wa Green Growers", init: "WG", kind: "Farmer", amount: 4120, method: "MTN MoMo", status: "Ready" },
  { name: "Kumbungu Pepper Farm", init: "KP", kind: "Farmer", amount: 2160, method: "MTN MoMo", status: "Held" },
  { name: "Nkwanta Women VSLA", init: "NW", kind: "Savings group", amount: 3200, method: "Bank · GCB", status: "Ready" },
  { name: "Driver Kofi Mensah", init: "KM", kind: "Driver", amount: 1450, method: "AirtelTigo Money", status: "Paid" },
];
export const PAYMENTS_IN = [
  { who: "Osu Kitchen Group", ref: "INV-0412", amount: 6820, how: "Bank transfer", when: "Today 09:12", tone: "success" as const, status: "Received" },
  { who: "Ama Owusu", ref: "#2041", amount: 197, how: "MTN MoMo", when: "Today 08:40", tone: "success" as const, status: "Received" },
  { who: "Labadi Hotel Group", ref: "INV-0409", amount: 5800, how: "Invoice", when: "Due 20 Oct", tone: "warning" as const, status: "Waiting" },
  { who: "Tema Foods Ltd", ref: "INV-0398", amount: 4200, how: "Invoice", when: "8 days late", tone: "danger" as const, status: "Late" },
  { who: "Efua Ansah", ref: "#2037", amount: 64, how: "MTN MoMo", when: "Refund asked", tone: "neutral" as const, status: "Refund" },
];
