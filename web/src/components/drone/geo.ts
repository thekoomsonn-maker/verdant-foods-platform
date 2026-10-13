/* Procedural low-poly geometry with baked vertex colours, merged so each plant / tree type is one draw call. */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rng, type CropKind } from "./world";

type V3 = [number, number, number];
type Part = { g: THREE.BufferGeometry; c: string | THREE.Color; p?: V3; r?: V3; s?: V3; ao?: number };

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

function place(part: Part) {
  // Polyhedra are non-indexed, the other primitives are indexed: normalise so they can merge.
  const g = part.g.index ? part.g.toNonIndexed() : part.g;
  g.deleteAttribute("uv");
  tmpE.set(...(part.r ?? [0, 0, 0]), "YXZ");
  tmpQ.setFromEuler(tmpE);
  tmpM.compose(new THREE.Vector3(...(part.p ?? [0, 0, 0])), tmpQ, new THREE.Vector3(...(part.s ?? [1, 1, 1])));
  g.applyMatrix4(tmpM);
  const col = part.c instanceof THREE.Color ? part.c : new THREE.Color(part.c);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  // Subtle vertical gradient: darker at the base, gives depth without textures.
  const pos = g.attributes.position;
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) { const y = pos.getY(i); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  for (let i = 0; i < n; i++) {
    const t = maxY > minY ? (pos.getY(i) - minY) / (maxY - minY) : 1;
    const ao = part.ao ?? 0.18;
    const k = 1 - ao + ao * t;
    arr[i * 3] = col.r * k; arr[i * 3 + 1] = col.g * k; arr[i * 3 + 2] = col.b * k;
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

export function merge(parts: Part[]) {
  const gs = parts.map(place);
  const out = mergeGeometries(gs, false)!;
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

/** Icosahedron with soft radial normals (and optional organic jitter), so blobs shade smoothly instead of faceted. */
const ico = (r: number, d = 0, jitter = 0) => {
  const g = new THREE.IcosahedronGeometry(r, d);
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const l = Math.hypot(x, y, z) || 1;
    if (jitter) {
      const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
      const k = 1 + jitter * ((h - Math.floor(h)) - 0.5);
      p.setXYZ(i, x * k, y * k, z * k);
    }
    n.setXYZ(i, x / l, y / l, z / l);
  }
  return g;
};
const cyl = (rt: number, rb: number, h: number, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s, 1);
const cone = (r: number, h: number, s = 5) => new THREE.ConeGeometry(r, h, s, 1);
const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

const shade = (hex: string, r: () => number, amt = 0.12) => {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h + (r() - 0.5) * 0.03, hsl.s, Math.min(1, Math.max(0, hsl.l + (r() - 0.5) * amt)));
  return c;
};

/** A leaf blade: flattened ellipsoid pointing along +z, tilted by `pitch` (down is positive). */
function blade(len: number, wid: number, yaw: number, pitch: number, y: number, color: THREE.Color, thick = 0.025, segs: [number, number] = [5, 3]): Part {
  const off = len * 0.5;
  return {
    g: sph(0.5, segs[0], segs[1]), c: color,
    s: [wid, thick, len],
    r: [pitch, yaw, 0],
    p: [Math.sin(yaw) * off * Math.cos(pitch), y - Math.sin(pitch) * off, Math.cos(yaw) * off * Math.cos(pitch)],
  };
}

export function cropGeometry(kind: CropKind): { geo: THREE.BufferGeometry; height: number } {
  const r = rng(kind.length * 977 + kind.charCodeAt(0));
  const P: Part[] = [];
  const leaf = "#3f7f27", leafDark = "#2f6a22";
  switch (kind) {
    case "tomato": {
      P.push({ g: box(0.045, 1.6, 0.045), c: "#8a6a45", p: [0.05, 0.8, 0] });
      for (let i = 0; i < 7; i++) {
        const a = r() * 6.28, y = 0.3 + i * 0.16;
        P.push({ g: ico(0.2 + r() * 0.08), c: shade(i % 2 ? leaf : leafDark, r), p: [Math.cos(a) * 0.14, y, Math.sin(a) * 0.14], s: [1.15, 0.8, 1.15] });
      }
      for (let i = 0; i < 7; i++) {
        const a = r() * 6.28, y = 0.35 + r() * 0.7;
        P.push({ g: ico(0.075, 0), c: shade(i % 3 === 0 ? "#f08a2a" : "#d9381f", r, 0.08), p: [Math.cos(a) * 0.26, y, Math.sin(a) * 0.26] });
      }
      return { geo: merge(P), height: 1.6 };
    }
    case "okra": {
      P.push({ g: cyl(0.025, 0.04, 1.7), c: "#5d7f2c", p: [0, 0.85, 0] });
      for (let i = 0; i < 7; i++) {
        const y = 0.35 + i * 0.2, yaw = i * 2.4 + r();
        P.push(blade(0.55 - i * 0.03, 0.42 - i * 0.025, yaw, 0.35 + r() * 0.3, y, shade("#4a8a2c", r), 0.03));
      }
      for (let i = 0; i < 5; i++) {
        const a = r() * 6.28, y = 0.8 + r() * 0.7;
        P.push({ g: cone(0.03, 0.22, 5), c: shade("#78ab3a", r), p: [Math.cos(a) * 0.08, y, Math.sin(a) * 0.08], r: [0.2, a, 0] });
      }
      P.push({ g: sph(0.05, 5, 4), c: "#f4d65a", p: [0.07, 1.62, 0] });
      return { geo: merge(P), height: 1.75 };
    }
    case "cabbage": {
      P.push({ g: ico(0.24, 1), c: "#a9cf72", p: [0, 0.22, 0], s: [1, 0.86, 1] });
      for (let i = 0; i < 8; i++) {
        const yaw = (i / 8) * 6.28 + r() * 0.3;
        P.push(blade(0.42, 0.36, yaw, -0.25 + r() * 0.25, 0.14 + (i % 2) * 0.05, shade(i % 2 ? "#5f9a52" : "#6fa05a", r), 0.035));
      }
      return { geo: merge(P), height: 0.5 };
    }
    case "maize": {
      P.push({ g: cyl(0.025, 0.045, 2.3), c: "#78a03c", p: [0, 1.15, 0] });
      for (let i = 0; i < 11; i++) {
        const y = 0.25 + i * 0.17, yaw = i * 2.4 + r() * 0.4;
        // long arching blades: an upward segment and a drooping tip
        const L = 0.75 - i * 0.03, c = shade(i % 2 ? "#5f962e" : "#6aa236", r);
        P.push(blade(L, 0.24, yaw, -0.6 + r() * 0.15, y, c, 0.016));
        const ex = Math.sin(yaw) * L * Math.cos(-0.6), ey = y + Math.sin(0.6) * L, ez = Math.cos(yaw) * L * Math.cos(-0.6);
        const tip = blade(L * 0.8, 0.2, yaw, 0.35 + r() * 0.2, ey, c, 0.014);
        tip.p = [tip.p![0] + ex, tip.p![1], tip.p![2] + ez];
        P.push(tip);
      }
      for (let i = 0; i < 5; i++) P.push({ g: cone(0.012, 0.32, 3), c: "#cdb36a", p: [0, 2.42, 0], r: [0.35, i * 1.25, 0] });
      P.push({ g: cyl(0.045, 0.06, 0.32, 6), c: "#9bbf5a", p: [0.07, 1.25, 0], r: [0, 0, -0.35] });
      P.push({ g: cone(0.03, 0.08, 4), c: "#c9a45a", p: [0.13, 1.43, 0], r: [0, 0, -0.35] });
      return { geo: merge(P), height: 2.5 };
    }
    case "pepper": {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 6.28;
        P.push({ g: ico(0.2 + r() * 0.05), c: shade(i % 2 ? "#2f6d27" : "#3a7a2b", r), p: [Math.cos(a) * 0.13, 0.3 + r() * 0.15, Math.sin(a) * 0.13], s: [1.1, 0.85, 1.1] });
      }
      P.push({ g: ico(0.2), c: "#367428", p: [0, 0.5, 0] });
      for (let i = 0; i < 10; i++) {
        const a = r() * 6.28, y = 0.25 + r() * 0.35;
        const col = i % 3 === 0 ? "#f39a1e" : i % 3 === 1 ? "#e3361c" : "#f5c22c";
        P.push({ g: ico(0.06, 0), c: shade(col, r, 0.06), p: [Math.cos(a) * 0.3, y, Math.sin(a) * 0.3], s: [1, 0.8, 1] });
      }
      return { geo: merge(P), height: 0.7 };
    }
    case "plantain": {
      for (let s = 0; s < 3; s++) {
        const a = s * 2.1 + r(), off = s === 0 ? 0 : 0.45;
        const h = s === 0 ? 2.7 : 1.8 + r() * 0.5;
        const x = Math.cos(a) * off, z = Math.sin(a) * off;
        P.push({ g: cyl(0.1, 0.15, h, 7), c: shade("#7a8f43", r), p: [x, h / 2, z] });
        const nl = s === 0 ? 7 : 5;
        for (let i = 0; i < nl; i++) {
          const yaw = (i / nl) * 6.28 + r() * 0.5;
          const pitch = -0.55 + i * 0.12 + r() * 0.25;
          const L = s === 0 ? 2.2 : 1.6;
          const b = blade(L, 0.55, yaw, pitch, h - 0.05, shade(i % 2 ? "#4f9530" : "#5fa23a", r), 0.03);
          b.p = [b.p![0] + x, b.p![1], b.p![2] + z];
          P.push(b);
        }
      }
      P.push({ g: cyl(0.16, 0.12, 0.5, 7), c: "#7ea33e", p: [0.25, 1.9, 0.1], r: [0, 0, 0.4] });
      P.push({ g: cone(0.1, 0.3, 6), c: "#6c1f3a", p: [0.4, 1.55, 0.1], r: [Math.PI, 0, 0.4] });
      return { geo: merge(P), height: 3.2 };
    }
    case "pineapple": {
      for (let i = 0; i < 20; i++) {
        const yaw = (i / 20) * 6.28 * 2.3 + r() * 0.3;
        const tilt = 0.5 + (i % 3) * 0.28 + r() * 0.15; // from vertical
        const L = 0.62 - (i % 3) * 0.08;
        P.push({ g: cone(0.045, L, 3), c: shade(i % 2 ? "#4e7d4f" : "#5e8a52", r), s: [1, 1, 0.35],
          r: [tilt, yaw, 0], p: [Math.sin(yaw) * Math.sin(tilt) * L * 0.5, 0.1 + Math.cos(tilt) * L * 0.5, Math.cos(yaw) * Math.sin(tilt) * L * 0.5] });
      }
      P.push({ g: sph(0.12, 8, 7), c: "#d49a2a", p: [0, 0.42, 0], s: [1, 1.5, 1] });
      for (let i = 0; i < 6; i++) P.push({ g: cone(0.025, 0.16, 3), c: "#5d8a4a", p: [0, 0.66, 0], r: [0.35, i * 1.05, 0] });
      return { geo: merge(P), height: 0.8 };
    }
    case "gardenegg": {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 6.28 + 0.3;
        P.push({ g: ico(0.22 + r() * 0.05), c: shade(i % 2 ? "#3c7a2d" : "#467f30", r), p: [Math.cos(a) * 0.15, 0.32 + r() * 0.12, Math.sin(a) * 0.15], s: [1.1, 0.8, 1.1] });
      }
      for (let i = 0; i < 7; i++) {
        const a = r() * 6.28, y = 0.2 + r() * 0.3;
        P.push({ g: sph(0.07, 6, 4), c: shade(i % 3 === 0 ? "#e9e2c4" : "#f3eedb", r, 0.05), p: [Math.cos(a) * 0.3, y, Math.sin(a) * 0.3], s: [1, 1.25, 1] });
      }
      return { geo: merge(P), height: 0.7 };
    }
  }
}

/* ---------------- Trees ---------------- */
export function palmGeometry() {
  const r = rng(77);
  const P: Part[] = [];
  const H = 10;
  // Trunk in 3 slightly offset segments for a gentle lean.
  for (let i = 0; i < 4; i++) P.push({ g: cyl(0.32 - i * 0.02, 0.36 - i * 0.02, H / 4 + 0.1, 7), c: shade("#6a5a43", r, 0.1), p: [i * 0.08, H / 8 + (i * H) / 4, 0] });
  P.push({ g: ico(0.65, 0), c: "#4a5a2a", p: [0.32, H, 0] });
  for (let i = 0; i < 18; i++) {
    const yaw = (i / 18) * 6.28 * 1.618 + r() * 0.2;
    const up = i < 6;
    const pitch = up ? -0.75 : -0.2 + r() * 0.25;
    const c = shade(i % 2 ? "#4c7f2e" : "#5b8f34", r);
    const L1 = 2.8, L2 = 2.6;
    const b1 = blade(L1, 0.7, yaw, pitch, H, c, 0.05, [4, 3]);
    b1.p = [b1.p![0] + 0.32, b1.p![1], b1.p![2]];
    P.push(b1);
    const ex = 0.32 + Math.sin(yaw) * L1 * Math.cos(pitch), ey = H - Math.sin(pitch) * L1, ez = Math.cos(yaw) * L1 * Math.cos(pitch);
    const b2 = blade(L2, 0.55, yaw, pitch + 0.75, ey, c, 0.04, [4, 3]);
    b2.p = [b2.p![0] + ex, b2.p![1], b2.p![2] + ez];
    P.push(b2);
  }
  return merge(P);
}

export function mangoGeometry(detail = 1) {
  const r = rng(13);
  const P: Part[] = [];
  P.push({ g: cyl(0.25, 0.4, 2.8, 7), c: "#4c3b2b", p: [0, 1.4, 0] });
  P.push({ g: cyl(0.12, 0.2, 1.8, 5), c: "#4c3b2b", p: [0.5, 2.8, 0], r: [0, 0, -0.6] });
  P.push({ g: cyl(0.12, 0.2, 1.8, 5), c: "#4c3b2b", p: [-0.4, 2.9, 0.3], r: [0.4, 0, 0.5] });
  const blobs: [number, number, number, number][] = [[0, 4.6, 0, 2.6], [1.6, 4.0, 0.6, 1.9], [-1.5, 4.1, -0.4, 2.0], [0.4, 3.8, -1.6, 1.8], [-0.5, 3.9, 1.6, 1.9], [0.2, 5.6, 0.2, 1.7]];
  for (const [x, y, z, s] of blobs) P.push({ g: ico(s, detail, 0.22), c: shade("#3f7230", r, 0.1), p: [x, y, z], s: [1, 0.82, 1], ao: 0.5 });
  return merge(P);
}

export function baobabGeometry() {
  const r = rng(5);
  const P: Part[] = [];
  P.push({ g: cyl(1.0, 1.5, 7, 9), c: "#8b7b67", p: [0, 3.5, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 6.28 + r() * 0.3;
    P.push({ g: cyl(0.12, 0.35, 4, 5), c: "#857461", p: [Math.cos(a) * 1.4, 8.2, Math.sin(a) * 1.4], r: [Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7] });
    P.push({ g: ico(1.1, 1, 0.3), c: shade("#6a8a3a", r), p: [Math.cos(a) * 2.9, 9.8, Math.sin(a) * 2.9], s: [1.3, 0.6, 1.3], ao: 0.4 });
  }
  return merge(P);
}

export function bushGeometry() {
  const r = rng(29);
  const P: Part[] = [];
  P.push({ g: cyl(0.2, 0.3, 1.4, 4), c: "#4a3a2a", p: [0, 0.7, 0] });
  P.push({ g: ico(2.4, 0, 0.25), c: shade("#467a30", r), p: [0, 2.7, 0], s: [1.1, 0.8, 1.1], ao: 0.55 });
  P.push({ g: ico(1.7, 0, 0.2), c: shade("#52843a", r), p: [1.4, 2.2, 0.5], ao: 0.55 });
  P.push({ g: ico(1.6, 0, 0.2), c: shade("#3d6d2b", r), p: [-1.3, 2.3, -0.6], ao: 0.55 });
  return merge(P);
}

export function tuftGeometry() {
  const r = rng(3);
  const P: Part[] = [];
  for (let i = 0; i < 7; i++) {
    const yaw = (i / 7) * 6.28 + r(), tilt = 0.25 + r() * 0.5, L = 0.45 + r() * 0.35;
    P.push({ g: cone(0.05, L, 3), c: shade(i % 2 ? "#9aab4a" : "#86a240", r), s: [1, 1, 0.3],
      r: [tilt, yaw, 0], p: [Math.sin(yaw) * Math.sin(tilt) * L * 0.5, Math.cos(tilt) * L * 0.5, Math.cos(yaw) * Math.sin(tilt) * L * 0.5] });
  }
  return merge(P);
}

/** A small leaf shape for celebration confetti. */
export function leafShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.quadraticCurveTo(0.42, -0.1, 0, 0.5);
  s.quadraticCurveTo(-0.42, -0.1, 0, -0.5);
  return new THREE.ShapeGeometry(s, 4);
}
