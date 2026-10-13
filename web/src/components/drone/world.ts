/* World layout and terrain maths for the drone farm. Pure TypeScript: no three.js, safe to import anywhere. */

export type CropKind = "tomato" | "okra" | "cabbage" | "maize" | "pepper" | "plantain" | "pineapple" | "gardenegg";

export type Field = {
  id: number;
  name: string;
  crop: CropKind;
  cropLabel: string;
  cx: number; cz: number; hw: number; hd: number;
  /** spacing between plants (m) along x and z */
  sx: number; sz: number;
};

/** 8 fields in a 4 x 2 grid, separated by laterite tracks. 1 unit = 1 metre. */
export const FIELDS: Field[] = [
  { id: 0, name: "Field 1", crop: "tomato", cropLabel: "Vine tomatoes", cx: -60, cz: -19, hw: 16, hd: 13, sx: 1.9, sz: 2.4 },
  { id: 1, name: "Field 2", crop: "maize", cropLabel: "Fresh maize", cx: -20, cz: -19, hw: 16, hd: 13, sx: 1.6, sz: 2.2 },
  { id: 2, name: "Field 3", crop: "okra", cropLabel: "Fresh okra", cx: 20, cz: -19, hw: 16, hd: 13, sx: 1.8, sz: 2.3 },
  { id: 3, name: "Field 4", crop: "plantain", cropLabel: "Cooking plantain", cx: 60, cz: -19, hw: 16, hd: 13, sx: 4.4, sz: 4.4 },
  { id: 4, name: "Field 5", crop: "cabbage", cropLabel: "Green cabbage", cx: -60, cz: 19, hw: 16, hd: 13, sx: 1.4, sz: 1.7 },
  { id: 5, name: "Field 6", crop: "pepper", cropLabel: "Scotch bonnet pepper", cx: -20, cz: 19, hw: 16, hd: 13, sx: 1.5, sz: 1.9 },
  { id: 6, name: "Field 7", crop: "pineapple", cropLabel: "Sugarloaf pineapple", cx: 20, cz: 19, hw: 16, hd: 13, sx: 1.4, sz: 1.8 },
  { id: 7, name: "Field 8", crop: "gardenegg", cropLabel: "Garden eggs", cx: 60, cz: 19, hw: 16, hd: 13, sx: 1.6, sz: 2.0 },
];

export type HotspotId = "greenhouse" | "packhouse" | "solar" | "collection";
export type Hotspot = { id: HotspotId; title: string; text: string; x: number; z: number; y: number };

export const HOTSPOTS: Hotspot[] = [
  { id: "greenhouse", title: "Greenhouses", x: -28, z: -56, y: 7.5,
    text: "Our two polytunnels shelter seedlings from heavy rain and harsh sun, so every field starts with strong young plants." },
  { id: "packhouse", title: "Packhouse", x: -26, z: 58, y: 10,
    text: "Every harvest is washed, sorted, weighed and photographed here, and each crate gets the trace code you can scan at home." },
  { id: "solar", title: "Solar pump", x: 106, z: 18, y: 6.5,
    text: "Sunlight powers the pump that lifts borehole water into the reservoir, so we irrigate the whole farm without diesel." },
  { id: "collection", title: "Collection point", x: 24, z: 54, y: 7,
    text: "Partner farmers bring their crates here, where each one is weighed, logged to their phone and paid by mobile money." },
];

/** Reservoir (refill the spray tank here). Axis-aligned rectangle. */
export const RESERVOIR = { cx: 104, cz: -8, hw: 11, hd: 8 };
/** Solar array (recharge the battery here). */
export const SOLAR = { cx: 106, cz: 18 };

/** Roads as segments [ax, az, bx, bz, width]. Used by the terrain shader and to keep trees off them. */
export const ROADS: [number, number, number, number, number][] = [
  [-170, 0, 140, 0, 6],
  [0, -40, 0, 42, 5.5],
  [0, 42, -14, 150, 6],
  [-14, 150, -60, 290, 6.5],
  [-40, -34, -40, 34, 3.6],
  [40, -34, 40, 34, 3.6],
  [-82, -38, 82, -38, 4],
  [-82, 38, 82, 38, 4],
  [-82, -38, -82, 38, 3.6],
  [82, -38, 82, 38, 3.6],
  [140, 0, 240, -60, 5],
];

/** Bare-earth yards around buildings [x, z, radius]. */
export const YARDS: [number, number, number][] = [
  [-26, 56, 17], [24, 54, 13], [-28, -56, 15], [106, 4, 22],
];

/** Building footprints that the drone must clear: [cx, cz, hw, hd, roofHeight]. */
export const OBSTACLES: [number, number, number, number, number][] = [
  [-26, 58, 11, 7, 8.5],
  [24, 54, 6, 5, 5.2],
  [-34, -56, 4.5, 11.5, 4.6],
  [-22, -56, 4.5, 11.5, 4.6],
  [106, 18, 7, 4, 3.6],
  [92, -22, 2.5, 2.5, 9],
];

export const START = { x: 0, z: 50, alt: 7 };
/** Soft flight bounds (ellipse half-axes). */
export const BOUNDS = { rx: 165, rz: 130 };

/* ---------------- Noise ---------------- */
function hash(ix: number, iz: number) {
  let h = ix * 374761393 + iz * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h & 0xffff) / 0xffff;
}
function vnoise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz) * 2 - 1;
}
export function fbm(x: number, z: number, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += vnoise(x * f, z * f) * a; f *= 2.03; a *= 0.5; }
  return s;
}
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** 0 inside the farm, 1 out in the hills. */
export function farmMask(x: number, z: number) {
  const dx = x / 150, dz = (z - 6) / 104;
  return smoothstep(0.92, 1.75, Math.sqrt(dx * dx + dz * dz));
}

function sdBox(x: number, z: number, cx: number, cz: number, hw: number, hd: number) {
  const dx = Math.abs(x - cx) - hw, dz = Math.abs(z - cz) - hd;
  const ox = Math.max(dx, 0), oz = Math.max(dz, 0);
  return Math.sqrt(ox * ox + oz * oz) + Math.min(Math.max(dx, dz), 0);
}

/** Terrain height in metres. */
export function heightAt(x: number, z: number) {
  const n1 = fbm(x * 0.0042 + 3.1, z * 0.0042 - 1.7, 5);
  const n2 = fbm(x * 0.021 + 11.3, z * 0.021 + 4.2, 2);
  const r = Math.sqrt(x * x + z * z);
  const hills = (n1 * 0.5 + 0.5) * 30 + n2 * 2.2;
  const amp = 0.55 + Math.min(r / 240, 2.2);
  // Akwapim ridge rising to the north and north-east.
  const k = -(z + x * 0.45);
  const ridge = smoothstep(260, 620, k) * (95 + n1 * 40);
  const outer = hills * amp + ridge;
  const farm = 1.5 + x * 0.008 - z * 0.012 + n2 * 0.22;
  let h = lerp(farm, outer, farmMask(x, z));
  // Reservoir basin.
  const d = sdBox(x, z, RESERVOIR.cx, RESERVOIR.cz, RESERVOIR.hw, RESERVOIR.hd);
  h -= (1 - smoothstep(-1.5, 3.5, d)) * 2.6;
  return h;
}

export const WATER_LEVEL = () => heightAt(RESERVOIR.cx, RESERVOIR.cz) + 1.75;

export function fieldAt(x: number, z: number, margin = 0): number {
  for (const f of FIELDS) {
    if (Math.abs(x - f.cx) <= f.hw + margin && Math.abs(z - f.cz) <= f.hd + margin) return f.id;
  }
  return -1;
}

export function distToRoads(x: number, z: number) {
  let best = 1e9;
  for (const [ax, az, bx, bz, w] of ROADS) {
    const px = x - ax, pz = z - az, vx = bx - ax, vz = bz - az;
    const t = clamp((px * vx + pz * vz) / (vx * vx + vz * vz), 0, 1);
    const dx = px - vx * t, dz = pz - vz * t;
    best = Math.min(best, Math.sqrt(dx * dx + dz * dz) - w / 2);
  }
  return best;
}

/** Minimum flight altitude (absolute y) at a point: ground or roof plus clearance. */
const CROP_H: Record<CropKind, number> = { tomato: 1.8, okra: 2, cabbage: 0.6, maize: 2.8, pepper: 0.8, plantain: 3.8, pineapple: 0.9, gardenegg: 0.8 };

export function floorAt(x: number, z: number) {
  const f = fieldAt(x, z, 1);
  let y = heightAt(x, z) + 1.6 + (f >= 0 ? CROP_H[FIELDS[f].crop] : 0);
  for (const [cx, cz, hw, hd, top] of OBSTACLES) {
    if (Math.abs(x - cx) < hw + 1.5 && Math.abs(z - cz) < hd + 1.5) y = Math.max(y, heightAt(cx, cz) + top + 1.6);
  }
  return y;
}

/** Deterministic PRNG for scattering. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
