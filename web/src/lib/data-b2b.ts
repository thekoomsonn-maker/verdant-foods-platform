// Mock data for the business (B2B) portal. Placeholder shapes only; the real API belongs to Verdant's backend team.
import { FARMS, PLACES, type Proof } from "./data";

export type Crop = "Tomatoes" | "Red onions" | "Okra" | "Kontomire" | "Pepper" | "Garden eggs" | "Cabbage" | "Yam";
export const CROP_IMG: Record<Crop, string> = {
  Tomatoes: "tomatoes", "Red onions": "onions", Okra: "okra", Kontomire: "kontomire", Pepper: "pepper", "Garden eggs": "garden-eggs", Cabbage: "cabbage", Yam: "yam",
};
export const CROP_COLOR: Record<string, string> = { Tomatoes: "#E5412B", "Red onions": "#6C1144", Kontomire: "#5F9F0D", Okra: "#F7C33C" };

/** The kitchen this business account delivers to. */
export const KITCHEN = { name: "Osu Kitchen", lat: 5.5571, lng: -0.1818 };
const farm = (slug: string) => FARMS.find((f) => f.slug === slug)!;

/* ---------- 20 Source produce ---------- */
export type Lot = { id: string; crop: Crop; farm: string; slug?: string; plot: string; district: string; region: "Northern" | "Upper West"; pickedDays: number; kg: number; grade: "A" | "B"; price: number; proof: Proof; lat: number; lng: number };
export const LOTS: Lot[] = [
  { id: "L-1", crop: "Tomatoes", farm: "Nyankpala Women Farmers", slug: "nyankpala-women-farmers", plot: "Plot A", district: "Tolon", region: "Northern", pickedDays: 0, kg: 1400, grade: "A", price: 9.5, proof: 3, lat: 9.4021, lng: -0.9876 },
  { id: "L-2", crop: "Tomatoes", farm: "Kumbungu Tomato Collective", plot: "Plot C", district: "Kumbungu", region: "Northern", pickedDays: 1, kg: 1200, grade: "A", price: 9.2, proof: 2, lat: 9.5583, lng: -0.9502 },
  { id: "L-3", crop: "Tomatoes", farm: "Tolon Growers Group", slug: "tolon-growers-group", plot: "Plot B", district: "Tolon", region: "Northern", pickedDays: 2, kg: 600, grade: "B", price: 7.8, proof: 3, lat: 9.4319, lng: -1.0632 },
  { id: "L-4", crop: "Red onions", farm: "Savelugu Onion Growers", slug: "savelugu-onion-growers", plot: "Plot A", district: "Savelugu", region: "Northern", pickedDays: 3, kg: 2200, grade: "A", price: 7.4, proof: 3, lat: 9.6244, lng: -0.8253 },
  { id: "L-5", crop: "Okra", farm: "Wa Green Growers", slug: "wa-green-growers", plot: "Plot D", district: "Wa", region: "Upper West", pickedDays: 0, kg: 480, grade: "A", price: 11, proof: 2, lat: 10.0601, lng: -2.5099 },
  { id: "L-6", crop: "Kontomire", farm: "Nadowli Women’s Group", slug: "nadowli-womens-group", plot: "Plot B", district: "Nadowli", region: "Upper West", pickedDays: 0, kg: 300, grade: "A", price: 6, proof: 1, lat: 10.3686, lng: -2.6667 },
  { id: "L-7", crop: "Pepper", farm: "Kumbungu Pepper Farm", slug: "kumbungu-pepper-farm", plot: "Plot A", district: "Kumbungu", region: "Northern", pickedDays: 2, kg: 350, grade: "A", price: 19, proof: 2, lat: 9.5321, lng: -0.9817 },
  { id: "L-8", crop: "Yam", farm: "Lawra Yam Collective", slug: "lawra-yam-collective", plot: "Plot C", district: "Lawra", region: "Upper West", pickedDays: 5, kg: 900, grade: "A", price: 6.5, proof: 3, lat: 10.6467, lng: -2.8992 },
];

/* ---------- 21 Bids ---------- */
export type BidStatus = "Waiting" | "Countered" | "Accepted" | "Closed";
export type Bid = { id: string; crop: Crop; kg: number; farm: string; yours: number; counter?: number; status: BidStatus; dueH: number; whose: "theirs" | "yours" };
export const BIDS: Bid[] = [
  { id: "BD-311", crop: "Tomatoes", kg: 2000, farm: "Kumbungu Tomato Collective", yours: 8.9, status: "Waiting", dueH: 6, whose: "theirs" },
  { id: "BD-309", crop: "Red onions", kg: 1000, farm: "Savelugu Onion Growers", yours: 7.2, counter: 7.6, status: "Countered", dueH: 20, whose: "yours" },
  { id: "BD-306", crop: "Pepper", kg: 300, farm: "Kumbungu Pepper Farm", yours: 19, status: "Waiting", dueH: 41, whose: "theirs" },
  { id: "BD-298", crop: "Okra", kg: 480, farm: "Wa Green Growers", yours: 10.8, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-291", crop: "Tomatoes", kg: 1500, farm: "Nyankpala Women Farmers", yours: 9.1, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-287", crop: "Kontomire", kg: 200, farm: "Nadowli Women’s Group", yours: 5.8, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-280", crop: "Garden eggs", kg: 400, farm: "Tolon Growers Group", yours: 6.2, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-274", crop: "Red onions", kg: 800, farm: "Savelugu Onion Growers", yours: 7, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-266", crop: "Yam", kg: 600, farm: "Lawra Yam Collective", yours: 6.4, status: "Accepted", dueH: 0, whose: "theirs" },
  { id: "BD-251", crop: "Cabbage", kg: 300, farm: "Wa Green Growers", yours: 3.2, status: "Closed", dueH: 0, whose: "theirs" },
];
export const MARKET: Partial<Record<Crop, [number, number]>> = { Tomatoes: [9.8, 10.4], "Red onions": [7.9, 8.4], Okra: [11.5, 12.2], Kontomire: [6.2, 6.8], Pepper: [20, 22], "Garden eggs": [6.5, 7], Cabbage: [3.4, 3.8], Yam: [6.8, 7.4] };

/* ---------- 22 Supply agreements ---------- */
export type Agreement = { crop: Crop; kgWeek: number; farm: string; slug: string; price: number; done: number; total: number; next: string; bar: string };
export const AGREEMENTS: Agreement[] = [
  { crop: "Tomatoes", kgWeek: 480, farm: "Nyankpala Women Farmers", slug: "nyankpala-women-farmers", price: 9.2, done: 1580, total: 1920, next: "Thursday 6 am", bar: "bg-leaf" },
  { crop: "Red onions", kgWeek: 300, farm: "Savelugu Onion Growers", slug: "savelugu-onion-growers", price: 7.4, done: 770, total: 1200, next: "Friday 6 am", bar: "bg-sun" },
  { crop: "Okra", kgWeek: 120, farm: "Wa Green Growers", slug: "wa-green-growers", price: 11, done: 456, total: 480, next: "Thursday 6 am", bar: "bg-leaf" },
];

/* ---------- 23 Orders and deliveries ---------- */
export type OrderStatus = "On the way" | "Packed" | "Delivered" | "Claim open";
export type Order = { id: string; produce: string; img: string; due: string; status: OrderStatus; driver: string; van: string; temp: string; weights: string; fresh: string; arriving: string; farm: string };
export const ORDERS: Order[] = [
  { id: "B-884", produce: "Tomatoes 120 kg, onions 80 kg", img: "tomatoes", due: "Today", status: "On the way", driver: "Kwame", van: "GT 4471-22", temp: "4 °C · steady", weights: "3 of 3 handovers", fresh: "about 26 hours", arriving: "arriving 6:00 am", farm: "nyankpala-women-farmers" },
  { id: "B-882", produce: "Pepper 60 kg, garden eggs 40 kg", img: "pepper", due: "Today", status: "On the way", driver: "Yaw", van: "GT 2290-23", temp: "5 °C · steady", weights: "2 of 3 handovers", fresh: "about 30 hours", arriving: "arriving 11:00 am", farm: "kumbungu-pepper-farm" },
  { id: "B-879", produce: "Kontomire 40 bunches", img: "kontomire", due: "Thu", status: "Packed", driver: "Kojo", van: "GT 5512-21", temp: "6 °C · cooling", weights: "2 of 2 handovers", fresh: "packed today", arriving: "leaves Wed 8 pm", farm: "nadowli-womens-group" },
  { id: "B-871", produce: "Okra 120 kg", img: "okra", due: "Thu", status: "Packed", driver: "Kojo", van: "GT 5512-21", temp: "6 °C · cooling", weights: "2 of 2 handovers", fresh: "packed today", arriving: "leaves Wed 8 pm", farm: "wa-green-growers" },
  { id: "B-866", produce: "Tomatoes 480 kg", img: "tomatoes", due: "Mon", status: "Delivered", driver: "Kwame", van: "GT 4471-22", temp: "4 °C · steady", weights: "3 of 3 handovers", fresh: "about 25 hours", arriving: "delivered Mon 6:04 am", farm: "nyankpala-women-farmers" },
  { id: "B-860", produce: "Pepper 60 kg", img: "pepper", due: "12 Oct", status: "Claim open", driver: "Yaw", van: "GT 2290-23", temp: "4 to 11 °C", weights: "3 of 3 handovers", fresh: "about 29 hours", arriving: "delivered 12 Oct", farm: "kumbungu-pepper-farm" },
];
/** Road from the Tamale packhouse to Osu, roughly along the N10 and N6. [lng, lat] */
export const ROAD: [number, number][] = [
  [PLACES.tamale.lng, PLACES.tamale.lat], [-1.0, 8.95], [-1.08, 8.25], [-1.36, 7.6], [PLACES.kumasi.lng, PLACES.kumasi.lat], [-1.25, 6.35], [-0.75, 5.95], [-0.35, 5.68], [KITCHEN.lng, KITCHEN.lat],
];
export const farmRoad = (slug: string): [number, number][] => { const f = farm(slug); return [[f.lng, f.lat], ...ROAD]; };

/* ---------- 24 Invoices ---------- */
export type Invoice = { id: string; week: string; amount: number; due: string; status: "To pay" | "Due today" | "Paid" };
export const INVOICES: Invoice[] = [
  { id: "INV-2209", week: "Week of 6 Oct", amount: 8920, due: "20 Oct", status: "To pay" },
  { id: "INV-2201", week: "Week of 29 Sep", amount: 5360, due: "13 Oct", status: "Due today" },
  { id: "INV-2188", week: "Week of 22 Sep", amount: 9140, due: "6 Oct", status: "Paid" },
  { id: "INV-2174", week: "Week of 15 Sep", amount: 7880, due: "29 Sep", status: "Paid" },
];

/* ---------- 55 Team and roles ---------- */
export type Role = "Owner" | "Buyer" | "Receiver" | "Finance";
export type Person = { initials: string; name: string; role: Role; limit: string; last: string; status: "Active" | "Pending"; tint: string };
export const TEAM: Person[] = [
  { initials: "KO", name: "Kwesi Owusu", role: "Owner", limit: "No limit", last: "Now", status: "Active", tint: "bg-lime text-night" },
  { initials: "AB", name: "Akua Badu", role: "Buyer", limit: "GH₵ 20,000", last: "2 h ago", status: "Active", tint: "bg-sun text-night" },
  { initials: "JN", name: "Joe Nartey", role: "Receiver", limit: "None", last: "Today", status: "Active", tint: "bg-orange-soft text-ink" },
  { initials: "EM", name: "Efua Mensah", role: "Finance", limit: "None", last: "Yesterday", status: "Active", tint: "bg-tomato-soft text-ink" },
  { initials: "YA", name: "Yaa Asante", role: "Receiver", limit: "None", last: "3 days ago", status: "Active", tint: "bg-mint text-deep" },
  { initials: "SA", name: "Sam Addo", role: "Buyer", limit: "GH₵ 5,000", last: "Invited", status: "Pending", tint: "bg-mist text-deep" },
];
export const ROLES: [Role, string, string[]][] = [
  ["Owner", "bg-lime-soft", ["Everything", "Credit and payment terms", "Add and remove people"]],
  ["Buyer", "bg-sun-soft", ["Order and bid", "Agreements up to their limit", "See trace reports"]],
  ["Receiver", "bg-mint", ["Confirm deliveries", "Weigh on arrival", "Raise quality claims"]],
  ["Finance", "bg-orange-soft", ["Invoices and payments", "Statements", "Download reports"]],
];

/* ---------- 56 Quality claims ---------- */
export type ClaimStatus = "Open" | "With farm" | "Credited" | "Replaced";
export type Step = { icon: string; title: string; time: string; tag: string; bad?: boolean };
export type Claim = { id: string; crop: Crop; short: string; delivery: string; status: ClaimStatus; detail: string; credit: number; dueH?: number; note: string; noteTone: "warning" | "info" | "success"; steps: Step[] };
export const CLAIMS: Claim[] = [
  { id: "CL-0142", crop: "Tomatoes", short: "18 kg soft", delivery: "Delivery 12 Oct", status: "Open", detail: "18 of 120 kg soft on arrival · reported by Joe Nartey", credit: 162, dueH: 6, note: "Cold van ran warm for 90 minutes. Likely cause: transport, not the farm.", noteTone: "warning",
    steps: [{ icon: "sprout", title: "Harvested · Nyankpala", time: "12 Oct 07:40", tag: "400 kg" }, { icon: "warehouse", title: "Packed · Tamale", time: "12 Oct 16:30", tag: "396 kg" }, { icon: "thermometer", title: "Cold van · 4 °C to 11 °C", time: "13 Oct 02:10 to 03:40", tag: "Temp. rise", bad: true }, { icon: "building-2", title: "Received · Osu Kitchen", time: "13 Oct 06:05", tag: "120 kg" }] },
  { id: "CL-0141", crop: "Red onions", short: "6 kg short", delivery: "Delivery 10 Oct", status: "With farm", detail: "294 of 300 kg on the kitchen scale · reported by Joe Nartey", credit: 44, note: "The farm weight matched at collection. Savelugu Onion Growers are checking the packhouse scale.", noteTone: "info",
    steps: [{ icon: "sprout", title: "Harvested · Savelugu", time: "9 Oct 06:50", tag: "310 kg" }, { icon: "scale", title: "Collected · Savelugu point", time: "9 Oct 09:30", tag: "308 kg" }, { icon: "warehouse", title: "Packed · Tamale", time: "9 Oct 15:10", tag: "300 kg" }, { icon: "building-2", title: "Received · Osu Kitchen", time: "10 Oct 06:12", tag: "294 kg", bad: true }] },
  { id: "CL-0139", crop: "Kontomire", short: "wilted", delivery: "Delivery 6 Oct", status: "Credited", detail: "12 of 40 bunches wilted · reported by Yaa Asante", credit: 72, note: "GH₵ 72 credited to invoice INV-2201.", noteTone: "success",
    steps: [{ icon: "sprout", title: "Harvested · Nadowli", time: "5 Oct 06:10", tag: "40 bunches" }, { icon: "warehouse", title: "Packed · Wa point", time: "5 Oct 11:40", tag: "40 bunches" }, { icon: "truck", title: "Cold van · 5 °C", time: "5 Oct 20:00 to 6 Oct 05:30", tag: "Steady" }, { icon: "building-2", title: "Received · Osu Kitchen", time: "6 Oct 06:20", tag: "28 good", bad: true }] },
  { id: "CL-0137", crop: "Okra", short: "wrong grade", delivery: "Delivery 2 Oct", status: "Replaced", detail: "Grade B sent instead of grade A · reported by Joe Nartey", credit: 0, note: "Replaced with grade A on 4 Oct at no cost.", noteTone: "success",
    steps: [{ icon: "sprout", title: "Harvested · Wa", time: "1 Oct 06:30", tag: "120 kg" }, { icon: "warehouse", title: "Graded · Wa point", time: "1 Oct 10:00", tag: "Grade B", bad: true }, { icon: "truck", title: "Cold van · 5 °C", time: "1 Oct 19:00 to 2 Oct 05:40", tag: "Steady" }, { icon: "building-2", title: "Received · Osu Kitchen", time: "2 Oct 06:00", tag: "120 kg" }] },
];

/* ---------- 57 Supply calendar ---------- */
export type Drop = { crop: Crop; qty: string; time: string };
/** Deliveries for a date, by weekday pattern from the active agreements. */
export function dropsFor(d: Date): Drop[] {
  const wd = d.getDay(); // 0 Sun
  const out: Drop[] = [];
  if (wd === 2 || wd === 4 || wd === 6) { out.push({ crop: "Tomatoes", qty: "120 kg", time: "6:00 am" }, { crop: "Red onions", qty: "80 kg", time: "6:00 am" }); }
  if (wd === 2 && d.getDate() >= 13 && d.getDate() <= 20) out.push({ crop: "Kontomire", qty: "20 bunches", time: "11:00 am" });
  if (wd === 5) out.push({ crop: "Kontomire", qty: "20 bunches", time: "6:00 am" }, { crop: "Okra", qty: "40 kg", time: "6:00 am" });
  return out;
}
export const OUTLOOK = { weeks: ["W43", "W44", "W45", "W46", "W47", "W48"], kg: [1650, 1800, 2050, 2600, 3100, 2500], peak: 4 };

/* ---------- 58 Trace reports ---------- */
export type Batch = { batch: string; product: Crop; farm: string; slug: string; kg: string; proof: Proof; code: string };
export type Report = { id: string; title: string; range: string; deliveries: number; kg: string; fresh: string; spray: string; batches: Batch[] };
export const REPORTS: Report[] = [
  { id: "TR-41", title: "Week of 6 Oct", range: "6 to 12 Oct · 4 deliveries", deliveries: 4, kg: "1,240 kg", fresh: "26 h", spray: "All past safe gap",
    batches: [{ batch: "VF-B-1182", product: "Tomatoes", farm: "Nyankpala Women Farmers", slug: "nyankpala-women-farmers", kg: "480 kg", proof: 3, code: "VF-TOM-00048" }, { batch: "VF-B-1176", product: "Red onions", farm: "Savelugu Onion Growers", slug: "savelugu-onion-growers", kg: "300 kg", proof: 3, code: "VF-ONI-00031" }, { batch: "VF-B-1171", product: "Okra", farm: "Wa Green Growers", slug: "wa-green-growers", kg: "120 kg", proof: 2, code: "VF-OKR-00019" }, { batch: "VF-B-1169", product: "Kontomire", farm: "Nadowli Women’s Group", slug: "nadowli-womens-group", kg: "40 bunches", proof: 1, code: "VF-KON-00012" }] },
  { id: "TR-40", title: "Week of 29 Sep", range: "29 Sep to 5 Oct · 3 deliveries", deliveries: 3, kg: "980 kg", fresh: "28 h", spray: "All past safe gap",
    batches: [{ batch: "VF-B-1150", product: "Tomatoes", farm: "Tolon Growers Group", slug: "tolon-growers-group", kg: "480 kg", proof: 3, code: "VF-TOM-00041" }, { batch: "VF-B-1144", product: "Red onions", farm: "Savelugu Onion Growers", slug: "savelugu-onion-growers", kg: "300 kg", proof: 2, code: "VF-ONI-00027" }, { batch: "VF-B-1139", product: "Pepper", farm: "Kumbungu Pepper Farm", slug: "kumbungu-pepper-farm", kg: "60 kg", proof: 2, code: "VF-PEP-00014" }] },
  { id: "TR-39", title: "Week of 22 Sep", range: "22 to 28 Sep · 3 deliveries", deliveries: 3, kg: "1,020 kg", fresh: "27 h", spray: "All past safe gap",
    batches: [{ batch: "VF-B-1121", product: "Tomatoes", farm: "Nyankpala Women Farmers", slug: "nyankpala-women-farmers", kg: "480 kg", proof: 3, code: "VF-TOM-00036" }, { batch: "VF-B-1117", product: "Yam", farm: "Lawra Yam Collective", slug: "lawra-yam-collective", kg: "300 kg", proof: 3, code: "VF-YAM-00009" }, { batch: "VF-B-1112", product: "Okra", farm: "Wa Green Growers", slug: "wa-green-growers", kg: "120 kg", proof: 2, code: "VF-OKR-00015" }] },
  { id: "TR-B884", title: "Order #B-884", range: "13 Oct · single delivery", deliveries: 1, kg: "200 kg", fresh: "26 h", spray: "All past safe gap",
    batches: [{ batch: "VF-B-1190", product: "Tomatoes", farm: "Nyankpala Women Farmers", slug: "nyankpala-women-farmers", kg: "120 kg", proof: 3, code: "VF-TOM-00052" }, { batch: "VF-B-1188", product: "Red onions", farm: "Savelugu Onion Growers", slug: "savelugu-onion-growers", kg: "80 kg", proof: 3, code: "VF-ONI-00034" }] },
];

/* ---------- 54 Request a quote ---------- */
export type QuoteProduct = { crop: Crop; name: string; unit: string; price: number; farms: string[] };
export const QUOTE_PRODUCTS: QuoteProduct[] = [
  { crop: "Tomatoes", name: "Vine tomatoes", unit: "kg", price: 9.2, farms: ["nyankpala-women-farmers", "tolon-growers-group", "kumbungu-fruit-farmers"] },
  { crop: "Red onions", name: "Red onions", unit: "kg", price: 7.4, farms: ["savelugu-onion-growers", "tolon-growers-group"] },
  { crop: "Kontomire", name: "Kontomire", unit: "bunches", price: 6, farms: ["nadowli-womens-group", "wa-green-growers"] },
  { crop: "Okra", name: "Fresh okra", unit: "kg", price: 11, farms: ["wa-green-growers", "nadowli-womens-group"] },
  { crop: "Pepper", name: "Scotch bonnet pepper", unit: "kg", price: 19, farms: ["kumbungu-pepper-farm"] },
  { crop: "Yam", name: "Puna yam", unit: "kg", price: 6.5, farms: ["lawra-yam-collective"] },
  { crop: "Garden eggs", name: "Garden eggs", unit: "kg", price: 6.2, farms: ["tolon-growers-group"] },
];
export const FREQ: [string, number][] = [["Every week", 1], ["Twice a week", 2], ["Every two weeks", 0.5]];
