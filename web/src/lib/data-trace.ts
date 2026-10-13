// Mock data for the public trace pages (/t). Placeholder shapes only; the real API belongs to Verdant's backend team.
import { farmBySlug, JOURNEY, plotAround } from "./data";

/** Look up a trace code. Only the demo batch exists; any other code shows "code not found". */
export function getTrace(code: string) {
  const c = decodeURIComponent(code).trim().toUpperCase();
  return c === JOURNEY.code ? JOURNEY : null;
}
export const normaliseCode = (code: string) => decodeURIComponent(code).trim().toUpperCase();

export const TRACE_FARM = farmBySlug(JOURNEY.farm);

/** Freshness clock: hours spent at each stage, in journey order. */
export const FRESH_SEGMENTS: { label: string; hours: number; color: string }[] = [
  { label: "Farm", hours: 3, color: "#BBEA70" },
  { label: "Collection", hours: 6, color: "#5F9F0D" },
  { label: "Packhouse", hours: 10, color: "#F7C33C" },
  { label: "Road", hours: 12, color: "#FF7006" },
];

export const SUMMARY: [string, string, string][] = [
  ["calendar", "Harvested", "12 Oct · 07:40"],
  ["scale", "Weight checked", "3 of 3 handovers"],
  ["spray-can", "Last spray", "16 days before harvest"],
  ["shield-check", "Safety", "No alerts for this batch"],
];

/** Weight at each handover, and how much it may move (sorting, moisture). */
export const HANDOVER_LOSS = [null, "−2 kg, within the 1% allowed", "−2 kg after sorting, within the 1% allowed", null, "Your 2 kg came from this crate"];

const F = TRACE_FARM;
export const PLOTS = [
  { id: "A", name: "Plot A", crop: "Tomatoes", ha: 5, color: "#E5412B", lat: F.lat + 0.004, lng: F.lng - 0.006 },
  { id: "B", name: "Plot B", crop: "Okra and pepper", ha: 4, color: "#F7C33C", lat: F.lat + 0.003, lng: F.lng + 0.008 },
  { id: "C", name: "Plot C", crop: "Kontomire", ha: 3, color: "#5F9F0D", lat: F.lat - 0.007, lng: F.lng + 0.001 },
].map((p) => ({ ...p, coords: plotAround(p.lat, p.lng, 0.0042 + p.ha * 0.0002, 0.0009) }));

export const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
/** Growing calendar: [crop, colour, first month index, last month index]. */
export const SEASON: [string, string, number, number][] = [
  ["Tomatoes", "#E5412B", 7, 11],
  ["Okra", "#F7C33C", 4, 8],
  ["Pepper", "#FF7006", 5, 10],
  ["Kontomire", "#5F9F0D", 3, 9],
  ["Garden eggs", "#6C1144", 5, 9],
];

export const VISITS = [
  { date: "6 Oct", title: "Farm check passed", note: "Spray records match the store. Plot boundaries unchanged." },
  { date: "22 Sep", title: "Spray logged", note: "Copper fungicide on Plot A. Safe gap: 14 days." },
  { date: "8 Sep", title: "Farm check passed", note: "Compost and drip lines in good order." },
  { date: "25 Aug", title: "Training", note: "Safe use of sprays. 22 of 24 members attended." },
];

export const FARM_PRODUCTS = ["vine-tomatoes", "fresh-okra", "kontomire", "garden-eggs"];

/** Safe-gap bar: days from the last spray to picking. */
export const SAFE_GAP = { lastSpray: "26 Sep", safeOn: "10 Oct", picked: "12 Oct", needed: 14, actual: 16, span: 18 };
export const SPRAY_CHECKS = ["Only sprays approved in Ghana", "Safe gap met before picking", "Store matches the record"];
