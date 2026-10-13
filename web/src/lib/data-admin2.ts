// Mock data for admin pages 59–69. The real API belongs to Verdant's backend team; these shapes are placeholders for the UI.
import { FARMS, PLACES, STORIES } from "./data";

type LngLat = [number, number];

/* ---------- Real road paths (lng, lat) ---------- */
const TAMALE: LngLat = [PLACES.tamale.lng, PLACES.tamale.lat];
const KUMASI: LngLat = [PLACES.kumasi.lng, PLACES.kumasi.lat];
const ACCRA: LngLat = [PLACES.accra.lng, PLACES.accra.lat];
const WA: LngLat = [PLACES.wa.lng, PLACES.wa.lat];

/** Tamale to Kumasi on the N10 (Buipe, Kintampo, Techiman). */
export const ROAD_TAMALE_KUMASI: LngLat[] = [TAMALE, [-1.02, 9.25], [-1.47, 8.78], [-1.63, 8.36], [-1.731, 8.056], [-1.938, 7.586], [-1.79, 7.12], KUMASI];
/** Kumasi to Accra on the N6 (Konongo, Nkawkaw, Nsawam). */
export const ROAD_KUMASI_ACCRA: LngLat[] = [KUMASI, [-1.21, 6.62], [-0.77, 6.55], [-0.56, 6.2], [-0.35, 5.81], ACCRA];
export const ROAD_TAMALE_ACCRA: LngLat[] = [...ROAD_TAMALE_KUMASI, ...ROAD_KUMASI_ACCRA.slice(1)];
/** Wa to Kumasi (Sawla, Bole, Wenchi, Techiman). */
export const ROAD_WA_KUMASI: LngLat[] = [WA, [-2.42, 9.28], [-2.48, 9.03], [-2.2, 8.4], [-2.1, 7.74], [-1.938, 7.586], [-1.79, 7.12], KUMASI];

const farm = (slug: string) => FARMS.find((f) => f.slug === slug)!;
const ll = (slug: string): LngLat => [farm(slug).lng, farm(slug).lat];

/* ---------- 59 Live supply map ---------- */
export const COLLECTION_POINTS = [
  { id: "cp-tolon", name: "Tolon point", sub: "Officer Yaw", lat: PLACES.tolon.lat, lng: PLACES.tolon.lng, today: "640 kg in", crates: 31 },
  { id: "cp-kumbungu", name: "Kumbungu point", sub: "Officer Issah", lat: 9.5512, lng: -0.9655, today: "520 kg in", crates: 24 },
  { id: "cp-savelugu", name: "Savelugu point", sub: "Officer Rashid", lat: 9.6181, lng: -0.84, today: "310 kg in", crates: 15 },
  { id: "cp-wa", name: "Wa point", sub: "Officer Ama", lat: PLACES.wa.lat, lng: PLACES.wa.lng + 0.03, today: "420 kg in", crates: 22 },
];

export const MAP_PROBLEMS = [
  { id: "pr-weight", name: "Weight alert", sub: "VF-B-1190 · -23%", lat: 9.49, lng: -1.01, detail: "520 kg left Kumbungu, 400 kg arrived at Tolon point.", action: "Investigate", href: "weights" as const },
  { id: "pr-spray", name: "Spray gap", sub: "Kumbungu Pepper Farm", lat: 9.575, lng: -0.925, detail: "Harvested 9 days after a copper spray. The label needs 14.", action: "Open recall", href: "recalls" as const },
  { id: "pr-check", name: "Farm check overdue", sub: "Lawra Yam Collective", lat: 10.62, lng: -2.87, detail: "Last officer visit was 33 days ago. Due every 30.", action: "See problems", href: "problems" as const },
];

export const MAP_VANS = [
  { id: "GT 4471-22", driver: "Kofi Asare", route: ROAD_TAMALE_ACCRA, to: "Accra", stops: "3 of 14", temp: 4, status: "On time", speed: 0.012, offset: 0.12 },
  { id: "GT 2209-23", driver: "Musah Ibrahim", route: ROAD_TAMALE_KUMASI, to: "Kumasi", stops: "7 of 11", temp: 6, status: "On time", speed: 0.016, offset: 0.55 },
  { id: "AS 118-24", driver: "Esi Boateng", route: ROAD_WA_KUMASI, to: "Kumasi", stops: "0 of 9", temp: 9, status: "Too warm", speed: 0.014, offset: 0.3 },
  { id: "NR 77-25", driver: "Yakubu Salifu", route: [ll("savelugu-onion-growers"), [-0.84, 9.6181], [-0.86, 9.52], TAMALE] as LngLat[], to: "Tamale packhouse", stops: "2 of 4", temp: 7, status: "Collecting", speed: 0.05, offset: 0 },
  { id: "UW 12-25", driver: "Paul Kuuire", route: [ll("lawra-yam-collective"), [-2.75, 10.5], ll("nadowli-womens-group"), WA] as LngLat[], to: "Wa point", stops: "1 of 3", temp: 8, status: "Collecting", speed: 0.04, offset: 0.2 },
];

export const MAP_ROUTES = [
  { id: "r-accra", coords: ROAD_TAMALE_ACCRA, color: "#FFFFFF" },
  { id: "r-wa", coords: ROAD_WA_KUMASI, color: "#FFFFFF" },
  { id: "r-sav", coords: MAP_VANS[3].route, color: "#BBEA70" },
  { id: "r-lawra", coords: MAP_VANS[4].route, color: "#BBEA70" },
  { id: "r-tolon", coords: [ll("nyankpala-women-farmers"), [PLACES.tolon.lng, PLACES.tolon.lat], TAMALE] as LngLat[], color: "#BBEA70" },
];

export type LiveEvent = { icon: "triangle-alert" | "scan-line" | "truck" | "camera" | "scale" | "badge-check" | "thermometer" | "package"; title: string; sub: string; tone?: "danger" | "warning" | "success" | "info"; pin?: string };
export const EVENTS_START: (LiveEvent & { ago: number })[] = [
  { icon: "triangle-alert", title: "Weight mismatch · VF-B-1190", sub: "520 kg left Kumbungu, 400 kg arrived at Tolon", tone: "danger", ago: 120, pin: "pr-weight" },
  { icon: "scan-line", title: "Handover scanned · VF-B-1188", sub: "Nadowli to Tamale packhouse · 20 bunches", ago: 360, pin: "cp-wa" },
  { icon: "truck", title: "Van GT 4471 left Tamale", sub: "14 stops in Accra · 4 °C", tone: "success", ago: 660, pin: "packhouse" },
  { icon: "camera", title: "Harvest photographed", sub: "Amina Seidu · tomatoes · 400 kg", ago: 1080, pin: "nyankpala-women-farmers" },
];
/** New events that arrive every few seconds while the feed is live. */
export const EVENTS_POOL: LiveEvent[] = [
  { icon: "scale", title: "Crates weighed · Tolon point", sub: "Fati Alhassan · garden eggs · 86 kg", tone: "success", pin: "cp-tolon" },
  { icon: "camera", title: "Harvest photographed", sub: "Gifty Dery · kontomire · 40 bunches", pin: "nadowli-womens-group" },
  { icon: "thermometer", title: "Van AS 118 at 9 °C", sub: "Cold chain limit is 8 °C · driver told", tone: "warning", pin: "van:AS 118-24" },
  { icon: "badge-check", title: "Farm check approved", sub: "Officer Issah · Kumbungu Fruit Farmers", tone: "success", pin: "kumbungu-fruit-farmers" },
  { icon: "scan-line", title: "Handover scanned · VF-B-1193", sub: "Savelugu to Tamale packhouse · 310 kg", pin: "cp-savelugu" },
  { icon: "package", title: "Batch packed · VF-B-1192", sub: "Tamale packhouse · 46 crates · grade A", tone: "success", pin: "packhouse" },
  { icon: "camera", title: "Harvest photographed", sub: "Issah Mahama · pepper · 120 kg", pin: "kumbungu-pepper-farm" },
  { icon: "scale", title: "Crates weighed · Wa point", sub: "Ama Mahama · okra · 140 kg", tone: "success", pin: "cp-wa" },
];

/* ---------- 60 Batches and handovers ---------- */
export type Stage = "Packed" | "In transit" | "Held" | "At point";
export type FlowNode = { id: string; t: string; s: string };
export type Batch = {
  id: string; crop: string; from: string; io: string; stage: Stage;
  inputs: FlowNode[]; mode: "Merged" | "Single" | "Held"; centre: string; outputs: (FlowNode & { tone: "sun" | "orange" | "tomato" | "mist" })[];
  steps: { icon: "sprout" | "scale" | "git-merge" | "split" | "truck" | "triangle-alert" | "warehouse"; t: string; s: string; time: string; warn?: boolean }[];
};
export const BATCHES: Batch[] = [
  {
    id: "VF-B-1182", crop: "Tomatoes", from: "Merged · 2 farms", io: "400 / 396 kg", stage: "Packed", mode: "Merged", centre: "400 kg in · 396 kg out",
    inputs: [{ id: "VF-B-1180", t: "VF-B-1180", s: "Amina Seidu · 240 kg" }, { id: "VF-B-1181", t: "VF-B-1181", s: "Fati Alhassan · 160 kg" }],
    outputs: [{ id: "o1", t: "Osu Kitchen Group", s: "120 kg · trace report sent", tone: "sun" }, { id: "o2", t: "Shop orders · 138", s: "276 kg · QR on every bag", tone: "orange" }],
    steps: [
      { icon: "sprout", t: "Harvest · Amina Seidu", s: "Plot A · 240 kg · photo", time: "07:40" },
      { icon: "scale", t: "Collection · Officer Yaw", s: "Weighed with farmer · 239 kg", time: "10:15" },
      { icon: "git-merge", t: "Merged at Tamale packhouse", s: "VF-B-1180 + VF-B-1181 · 400 kg", time: "14:05" },
      { icon: "split", t: "Split for delivery", s: "120 kg business · 276 kg shoppers", time: "16:30" },
    ],
  },
  {
    id: "VF-B-1188", crop: "Kontomire", from: "Nadowli", io: "60 / 60 bn", stage: "In transit", mode: "Single", centre: "60 bunches · no loss",
    inputs: [{ id: "VF-B-1188a", t: "VF-B-1188", s: "Gifty Dery · 60 bunches" }],
    outputs: [{ id: "o1", t: "Shop orders · 40", s: "60 bunches · QR on every bunch", tone: "orange" }],
    steps: [
      { icon: "sprout", t: "Harvest · Gifty Dery", s: "Nadowli · 60 bunches · photo", time: "06:50" },
      { icon: "scale", t: "Collection · Officer Ama", s: "Counted with farmer · 60 bunches", time: "09:30" },
      { icon: "truck", t: "Left Wa point", s: "Van UW 12 · 7 °C", time: "11:10" },
    ],
  },
  {
    id: "VF-B-1190", crop: "Pepper", from: "Kumbungu", io: "520 / 400 kg", stage: "Held", mode: "Held", centre: "520 kg out · 400 kg in",
    inputs: [{ id: "VF-B-1190a", t: "VF-B-1190", s: "Issah Mahama · 520 kg" }],
    outputs: [{ id: "o1", t: "Held at Tolon point", s: "120 kg missing · officer called", tone: "tomato" }],
    steps: [
      { icon: "sprout", t: "Harvest · Issah Mahama", s: "Kumbungu · 520 kg · photo", time: "07:05" },
      { icon: "triangle-alert", t: "Weight check failed at Tolon", s: "400 kg arrived · -23%", time: "10:40", warn: true },
      { icon: "warehouse", t: "Held for investigation", s: "Sales stopped automatically", time: "10:41", warn: true },
    ],
  },
  {
    id: "VF-B-1191", crop: "Okra", from: "Wa", io: "140 / 138 kg", stage: "At point", mode: "Single", centre: "140 kg in · 138 kg out",
    inputs: [{ id: "VF-B-1191a", t: "VF-B-1191", s: "Ama Mahama · 140 kg" }],
    outputs: [{ id: "o1", t: "Waiting for van", s: "138 kg · Wa point", tone: "mist" }],
    steps: [
      { icon: "sprout", t: "Harvest · Wa Green Growers", s: "Plot C · 140 kg · photo", time: "06:30" },
      { icon: "scale", t: "Collection · Officer Ama", s: "Weighed with farmer · 138 kg", time: "08:55" },
    ],
  },
];

/* ---------- 61 Weight checks ---------- */
export const MISMATCHES = [
  { id: "VF-B-1190", crop: "Pepper", route: "Kumbungu to Tolon point", out: 520, inn: 400, officer: "Officer Yaw" },
  { id: "VF-B-1176", crop: "Onions", route: "Savelugu to Tamale", out: 310, inn: 288, officer: "Officer Rashid" },
];
export const CHECKS: [string, string, string, string, "Pass" | "Held"][] = [
  ["VF-B-1191", "Wa point", "140 kg", "138 kg", "Pass"],
  ["VF-B-1188", "Tamale", "60 bn", "60 bn", "Pass"],
  ["VF-B-1190", "Tolon", "520 kg", "400 kg", "Held"],
  ["VF-B-1182", "Tamale", "400 kg", "396 kg", "Pass"],
  ["VF-B-1186", "Kumbungu point", "220 kg", "218 kg", "Pass"],
  ["VF-B-1176", "Tamale", "310 kg", "288 kg", "Held"],
  ["VF-B-1185", "Savelugu point", "180 kg", "179 kg", "Pass"],
  ["VF-B-1184", "Tolon", "96 kg", "95 kg", "Pass"],
];

/* ---------- 62 Recalls ---------- */
const PEPPER = ll("kumbungu-pepper-farm");
export const RECALL_SOURCE = { lat: PEPPER[1], lng: PEPPER[0] };
export const RECALL_BUYERS: { id: string; name: string; kind: "buyer" | "home"; lat: number; lng: number }[] = [
  { id: "b-osu", name: "Osu Kitchen Group", kind: "buyer", lat: 5.556, lng: -0.182 },
  { id: "b-labadi", name: "Labadi Beach Hotel", kind: "buyer", lat: 5.561, lng: -0.149 },
  { id: "b-kumasi", name: "Adum Fresh Market", kind: "buyer", lat: 6.693, lng: -1.627 },
  { id: "h-1", name: "Shopper · East Legon", kind: "home", lat: 5.635, lng: -0.157 },
  { id: "h-2", name: "Shopper · Tema", kind: "home", lat: 5.669, lng: -0.017 },
  { id: "h-3", name: "Shopper · Kasoa", kind: "home", lat: 5.534, lng: -0.42 },
  { id: "h-4", name: "Shopper · Madina", kind: "home", lat: 5.683, lng: -0.166 },
  { id: "h-5", name: "Shopper · Dansoman", kind: "home", lat: 5.548, lng: -0.264 },
  { id: "h-6", name: "Shopper · Kumasi Asokwa", kind: "home", lat: 6.67, lng: -1.6 },
  { id: "h-7", name: "Shopper · Tamale Lamashegu", kind: "home", lat: 9.39, lng: -0.81 },
  { id: "h-8", name: "Shopper · Techiman", kind: "home", lat: 7.586, lng: -1.938 },
  { id: "h-9", name: "Shopper · Adenta", kind: "home", lat: 5.706, lng: -0.169 },
];
/** Path from the source farm, through Tamale, along the road toward each buyer. */
export function recallPath(b: { lat: number; lng: number }): LngLat[] {
  const head: LngLat[] = [PEPPER, TAMALE];
  if (b.lat > 9) return [...head, [b.lng, b.lat]];
  const road = b.lat > 7.3 ? ROAD_TAMALE_KUMASI.slice(1, 6) : b.lat > 6.3 ? ROAD_TAMALE_KUMASI.slice(1) : ROAD_TAMALE_ACCRA.slice(1, -1);
  return [...head, ...road, [b.lng, b.lat]];
}
export const RECALL_STEPS = [
  { t: "Stop sales", s: "Batch held in all stock", done: true },
  { t: "Tell every buyer", s: "44 of 44 sent by SMS and email", done: true },
  { t: "Collect it back", s: "120 of 212 kg", done: false, part: 120 / 212 },
  { t: "Report to Ghana FDA", s: "Due tomorrow", done: false },
  { t: "Fix the cause", s: "Retrain farm on spray gaps", done: false },
];
export const BUYERS_TOLD: [string, string, string, "success" | "info", string, "success" | "warning" | "danger"][] = [
  ["Osu Kitchen Group", "80 kg", "Read", "success", "80 kg", "success"],
  ["Labadi Beach Hotel", "60 kg", "Read", "success", "40 kg", "warning"],
  ["Shoppers · 41", "72 kg", "41 sent", "info", "0 kg", "danger"],
];

/* ---------- 63 Deliveries ---------- */
const DEPOT: LngLat = [-0.187, 5.6037];
export const DELIVERY_DEPOT = { lat: DEPOT[1], lng: DEPOT[0] };
export const DELIVERY_VANS = [
  { id: "GT 4471-22", driver: "Kofi A.", temp: 4, done: 9, total: 14, color: "#5F9F0D", route: [DEPOT, [-0.182, 5.556], [-0.149, 5.561], [-0.106, 5.583], [-0.077, 5.601]] as LngLat[], speed: 0.03, offset: 0.55 },
  { id: "GT 2209-23", driver: "Musah I.", temp: 6, done: 4, total: 11, color: "#024639", route: [DEPOT, [-0.2275, 5.6145], [-0.235, 5.65], [-0.166, 5.683], [-0.169, 5.706]] as LngLat[], speed: 0.025, offset: 0.35 },
  { id: "AS 118-24", driver: "Esi B.", temp: 9, done: 1, total: 9, color: "#E5412B", route: [DEPOT, [-0.235, 5.566], [-0.264, 5.548], [-0.285, 5.568], [-0.335, 5.555]] as LngLat[], speed: 0.02, offset: 0.1 },
  { id: "GT 5521-24", driver: "Yakubu S.", temp: 5, done: 11, total: 12, color: "#5F9F0D", route: [DEPOT, [-0.171, 5.605], [-0.11, 5.633], [-0.06, 5.62], [-0.017, 5.669]] as LngLat[], speed: 0.028, offset: 0.8 },
];

/* ---------- 64 Pricing ---------- */
export const PRICE_SERIES: Record<string, { ours: number[]; market: number[]; split: [string, number, string][]; now: number }> = {
  Tomatoes: { now: 22.5, ours: [20.5, 21, 21.6, 22, 22.4, 23.6, 23.2, 22.6, 22.1, 21.6, 22.1, 22.5], market: [22, 22.6, 23.4, 24.2, 24.8, 25.6, 25.4, 25, 24.4, 24.2, 24.6, 25], split: [["Farmer", 14, "bg-lime"], ["Transport", 3.2, "bg-sun"], ["Packing", 2.6, "bg-orange"], ["Verdant", 2.7, "bg-leaf"]] },
  "Red onions": { now: 12, ours: [11, 11.2, 11.6, 12.2, 12.6, 12.4, 12.1, 11.8, 11.9, 12.2, 12.1, 12], market: [12.4, 12.8, 13.2, 13.9, 14.2, 14, 13.8, 13.6, 13.5, 13.7, 13.6, 13.5], split: [["Farmer", 7.5, "bg-lime"], ["Transport", 2, "bg-sun"], ["Packing", 1.2, "bg-orange"], ["Verdant", 1.3, "bg-leaf"]] },
  "Garden eggs": { now: 28, ours: [24, 24.6, 25, 25.8, 26.4, 27, 27.6, 28.4, 28.1, 27.8, 27.9, 28], market: [26, 26.8, 27.4, 28, 28.6, 29.4, 30, 30.6, 30.2, 30, 30.1, 30], split: [["Farmer", 16, "bg-lime"], ["Transport", 4.6, "bg-sun"], ["Packing", 3.4, "bg-orange"], ["Verdant", 4, "bg-leaf"]] },
};
export const PRICE_LIST: [string, number, number, number, number][] = [
  ["Vine tomatoes · kg", 14, 22.5, 25, 4],
  ["Red onions · kg", 7.5, 12, 13.5, -2],
  ["Garden eggs · kg", 16, 28, 30, 12],
  ["Kontomire · bunch", 6, 12, 12, 0],
  ["Puna yam · tuber", 15, 26, 28, 11],
  ["Fresh okra · kg", 13, 22, 24, 3],
];

/* ---------- 65 Website content ---------- */
export const BANNERS = [
  { t: "Tomato season", s: "Shop · ends Sunday", c: "bg-plum", status: "Live" },
  { t: "Free delivery over GH₵ 200", s: "Shop · always", c: "bg-sun", status: "Live" },
  { t: "Weekly box launch", s: "Home · from 20 Oct", c: "bg-orange", status: "Scheduled" },
];
export const CONTENT_STORIES = [0, 1, 5, 2, 3, 4].map((i) => ({ ...STORIES[i], status: i === 5 || i === 4 ? "Draft" : "Published" }));
export const HERO_BACKGROUNDS = [
  { file: "hero-video.mp4", img: "/img/hero-aerial.jpg" },
  { file: "aerial-plots.jpg", img: "/img/aerial-plots.jpg" },
  { file: "packhouse.jpg", img: "/img/packhouse.jpg" },
];

/* ---------- 66 Users and roles ---------- */
export const PEOPLE: { n: string; i: string; c: string; role: string; area: string; last: string; status: "Active" | "Pending" }[] = [
  { n: "Akosua Darko", i: "AD", c: "bg-plum-soft text-plum", role: "Admin", area: "All", last: "Now", status: "Active" },
  { n: "Yaw Appiah", i: "YA", c: "bg-lime text-night", role: "Field officer", area: "Tolon", last: "10 min", status: "Active" },
  { n: "Ama Mahama", i: "AM", c: "bg-sun-soft text-warning", role: "Field officer", area: "Wa", last: "1 h", status: "Active" },
  { n: "Kofi Asare", i: "KA", c: "bg-orange-soft text-orange", role: "Driver", area: "Accra", last: "On shift", status: "Active" },
  { n: "Fuseini Bawa", i: "FB", c: "bg-mist text-deep", role: "Packhouse", area: "Tamale", last: "Invited", status: "Pending" },
  { n: "Efua Mensah", i: "EM", c: "bg-mint text-deep", role: "Operations", area: "Accra", last: "25 min", status: "Active" },
];
export const ROLES = ["Admin", "Operations", "Field officer", "Packhouse", "Driver"];
export const PERMS: [string, boolean[]][] = [
  ["Change prices", [true, true, false, false, false]],
  ["Approve farm checks", [true, true, true, false, false]],
  ["Record weights", [true, true, true, true, true]],
  ["Start a recall", [true, true, false, false, false]],
  ["Pay farmers", [true, false, false, false, false]],
];

/* ---------- 67 Reports ---------- */
export const REPORTS = [
  { t: "Sales", s: "By channel, product and city", icon: "chart-line", bg: "bg-lime-soft", href: "adminOrders" },
  { t: "Farmer payouts", s: "Paid, pending and failed", icon: "hand-coins", bg: "bg-sun-soft", href: "adminPayments" },
  { t: "Traceability", s: "Scans, handovers, proof levels", icon: "qr-code", bg: "bg-mint", href: "adminCodes" },
  { t: "Food safety", s: "Spray gaps, recalls, claims", icon: "shield-check", bg: "bg-tomato-soft", href: "adminRecalls" },
  { t: "Impact", s: "Income, women, mapped plots", icon: "sprout", bg: "bg-orange-soft", href: "impact" },
  { t: "Savings groups", s: "Savings and loans", icon: "users", bg: "bg-plum-soft", href: "adminGroups" },
] as const;
export const SALES_30 = [11.2, 11.8, 12.4, 12, 11.6, 12.2, 12.9, 13.4, 13.6, 13.2, 12.8, 13.5, 14.1, 14.6, 14.4, 14.9, 15.2, 15, 14.7, 15.4, 16.1, 16.6, 16.8, 16.4, 16.1, 16.7, 17.3, 17.8, 18.1, 18.42];
export const SALES_PREV = [10.4, 10.8, 11, 11.2, 11.1, 11.4, 11.8, 12, 12.1, 12, 11.9, 12.3, 12.6, 12.8, 12.7, 13, 13.2, 13.1, 13, 13.3, 13.6, 13.8, 13.9, 13.8, 13.7, 14, 14.3, 14.5, 14.7, 14.9];
export const AUTO_REPORTS = [
  { t: "Weekly sales", s: "Mondays · to 4 people", on: true },
  { t: "Farmer payouts", s: "Fridays · to finance", on: true },
  { t: "Food safety", s: "Monthly · to Ghana FDA contact", on: true },
  { t: "Impact", s: "Quarterly · to partners", on: true },
];

/* ---------- 68 Settings ---------- */
export const RULES = [
  { k: "loss", t: "Allowed weight loss", s: "Flag a handover above this", v: "2", unit: "%" },
  { k: "gap", t: "Default safe spray gap", s: "Unless the label says longer", v: "14", unit: " days" },
  { k: "fresh", t: "Freshness limit", s: "Hide from shop after", v: "72", unit: " h" },
];
export const RULE_TOGGLES = [
  { k: "photo", t: "Photo at harvest", s: "Required for top proof level", on: true },
  { k: "block", t: "Block sale if gap not met", s: "Sale stops automatically", on: true },
];
export const DELIVERY_RULES = [
  { k: "cutoff", t: "Order cut-off", s: "For next-day delivery", v: "8", unit: " pm", pre: "" },
  { k: "free", t: "Free delivery from", s: "Accra and Kumasi", v: "200", unit: "", pre: "GH₵ " },
  { k: "temp", t: "Van temperature alert", s: "Notify ops above", v: "8", unit: " °C", pre: "" },
];
export const PROVIDERS = [
  { t: "MTN MoMo", s: "Shoppers and farmer payouts", c: "bg-sun", on: true },
  { t: "Telecel Cash", s: "Shoppers and farmer payouts", c: "bg-tomato", on: true },
  { t: "AT Money", s: "Shoppers", c: "bg-info", on: true },
  { t: "Cards", s: "Visa and Mastercard", c: "bg-deep", on: true },
  { t: "Bank transfer", s: "Business invoices only", c: "bg-muted", on: false },
];

/* ---------- 69 Problems ---------- */
export type ProblemType = "Weight" | "Farm checks" | "Spray records" | "Unmapped plots";
export type Problem = { id: string; type: ProblemType; t: string; s: string; who: string | null; urgent: boolean; week: boolean; action: string; tone: "danger" | "warning" | "mist" };
export const PROBLEMS: Problem[] = [
  { id: "p1", type: "Weight", t: "Weight mismatch, -23%", s: "VF-B-1190 · Kumbungu to Tolon", who: null, urgent: true, week: true, action: "Investigate", tone: "danger" },
  { id: "p2", type: "Spray records", t: "Harvest too soon after spray", s: "Kumbungu Pepper Farm · 9 of 14 days", who: "Akosua D.", urgent: true, week: true, action: "Block lot", tone: "danger" },
  { id: "p3", type: "Farm checks", t: "Farm check overdue", s: "Lawra Yam Collective · 3 days", who: "Officer Yaw", urgent: false, week: true, action: "Remind", tone: "warning" },
  { id: "p4", type: "Farm checks", t: "Farm check overdue", s: "Wa Green Growers · 1 day", who: "Officer Ama", urgent: false, week: true, action: "Remind", tone: "warning" },
  { id: "p5", type: "Unmapped plots", t: "Plot not mapped", s: "2 farms in Wa", who: null, urgent: false, week: false, action: "Assign", tone: "mist" },
  { id: "p6", type: "Spray records", t: "Spray record missing", s: "Tolon Growers · 3 harvests", who: "Officer Yaw", urgent: false, week: false, action: "Ask farmer", tone: "warning" },
  { id: "p7", type: "Weight", t: "Weight mismatch, -7%", s: "VF-B-1176 · Savelugu to Tamale", who: "Akosua D.", urgent: false, week: false, action: "Investigate", tone: "danger" },
  { id: "p8", type: "Farm checks", t: "Farm check overdue", s: "Nadowli Women’s Group · 5 days", who: "Akosua D.", urgent: false, week: false, action: "Remind", tone: "warning" },
  { id: "p9", type: "Unmapped plots", t: "Plot not mapped", s: "Kumbungu Fruit Farmers · plot D", who: null, urgent: false, week: false, action: "Assign", tone: "mist" },
];
export const PROBLEM_COLORS: Record<ProblemType, string> = { Weight: "#E5412B", "Farm checks": "#F7C33C", "Spray records": "#6C1144", "Unmapped plots": "#1D5FA8" };
export const ASSIGNEES = ["Akosua D.", "Officer Yaw", "Officer Ama", "Officer Issah", "Efua M."];
