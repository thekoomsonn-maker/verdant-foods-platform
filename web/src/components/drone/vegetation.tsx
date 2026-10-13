"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FIELDS, HOTSPOTS, OBSTACLES, RESERVOIR, distToRoads, farmMask, fieldAt, heightAt, rng, type Field } from "./world";
import { baobabGeometry, bushGeometry, cropGeometry, mangoGeometry, palmGeometry, tuftGeometry } from "./geo";
import type { Game } from "./store";

/** Shared time uniform for wind. */
export const windTime = { value: 0 };

/**
 * Vertex-coloured standard material with wind sway and a growth/dryness uniform.
 * grow = 0: small, drooping, straw-coloured. grow = 1: full size and lush green.
 */
function plantMaterial(height: number, sway: number, grow?: { value: number }) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  const uGrow = grow ?? { value: 1 };
  m.onBeforeCompile = (s) => {
    s.uniforms.uGrow = uGrow;
    s.uniforms.uTime = windTime;
    s.uniforms.uH = { value: height };
    s.uniforms.uSway = { value: sway };
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uGrow; uniform float uTime; uniform float uH; uniform float uSway;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
{
  float hN = clamp(transformed.y / uH, 0., 1.);
  float g = uGrow;
  vec3 ip = vec3(0.);
  #ifdef USE_INSTANCING
  ip = instanceMatrix[3].xyz;
  #endif
  float ph = ip.x*0.37 + ip.z*0.23;
  transformed.xz *= mix(0.62, 1.0, g);
  transformed.y *= mix(0.55, 1.0, g);
  float bend = (1.-g) * hN * hN;
  transformed.x += bend * 0.32 * uH;
  transformed.y -= bend * 0.16 * uH;
  float w = sin(uTime*1.7 + ph) * 0.6 + sin(uTime*2.9 + ph*1.9) * 0.3;
  transformed.x += w * hN * hN * uSway * uH;
  transformed.z += cos(uTime*1.3 + ph) * hN * hN * uSway * 0.6 * uH;
}`);
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uGrow;")
      .replace("#include <color_fragment>", `#include <color_fragment>
{
  vec3 c = diffuseColor.rgb;
  float leafy = smoothstep(0.0, 0.05, c.g - max(c.r, c.b) * 0.92);
  float l = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 dry = vec3(l * 1.55, l * 1.25, l * 0.6) + vec3(0.05, 0.03, 0.0);
  c = mix(c, dry, leafy * (1. - uGrow) * 0.9);
  c = mix(c, c * vec3(0.92, 1.12, 0.86), leafy * uGrow * 0.55);
  diffuseColor.rgb = c;
}`);
  };
  m.customProgramCacheKey = () => "verdant-plant";
  return m;
}

function plantsFor(f: Field, density: number) {
  const r = rng(f.id * 131 + 7);
  const k = 1 / Math.sqrt(density);
  const sx = f.sx * k, sz = f.sz;
  const nx = Math.floor((f.hw * 2 - 1) / sx), nz = Math.floor((f.hd * 2 - 1) / sz);
  const out: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = f.cx - (nx * sx) / 2 + i * sx + (r() - 0.5) * sx * 0.25;
    const z = f.cz - (nz * sz) / 2 + j * sz + (r() - 0.5) * 0.15;
    e.set(0, r() * Math.PI * 2, 0);
    q.setFromEuler(e);
    const sc = 0.85 + r() * 0.3;
    v.set(x, heightAt(x, z) - 0.02, z);
    s.set(sc, sc * (0.9 + r() * 0.2), sc);
    out.push(new THREE.Matrix4().compose(v, q, s));
  }
  return out;
}

function FieldCrops({ field, game, density, shadows }: { field: Field; game: Game; density: number; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, height } = useMemo(() => cropGeometry(field.crop), [field.crop]);
  const grow = useMemo(() => ({ value: 0 }), []);
  const sway = field.crop === "maize" || field.crop === "plantain" ? 0.04 : 0.03;
  const mat = useMemo(() => plantMaterial(height, sway, grow), [height, sway, grow]);
  const mats = useMemo(() => plantsFor(field, density), [field, density]);
  useLayoutEffect(() => {
    const m = ref.current!;
    mats.forEach((mm, i) => m.setMatrixAt(i, mm));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [mats]);
  useFrame(() => { grow.value = game.visual[field.id]; });
  return <instancedMesh ref={ref} args={[geo, mat, mats.length]} castShadow={shadows} receiveShadow frustumCulled />;
}

export function Crops({ game, density, shadows }: { game: Game; density: number; shadows: boolean }) {
  useFrame((_, dt) => { windTime.value += Math.min(dt, 0.05); });
  return <>{FIELDS.map((f) => <FieldCrops key={f.id} field={f} game={game} density={density} shadows={shadows} />)}</>;
}

/* ---------------- Trees ---------------- */
type Inst = { x: number; z: number; s: number; ry: number };

function nearObstacle(x: number, z: number, pad: number) {
  for (const [cx, cz, hw, hd] of OBSTACLES) if (Math.abs(x - cx) < hw + pad && Math.abs(z - cz) < hd + pad) return true;
  if (Math.abs(x - RESERVOIR.cx) < RESERVOIR.hw + pad && Math.abs(z - RESERVOIR.cz) < RESERVOIR.hd + pad) return true;
  for (const h of HOTSPOTS) if (Math.hypot(x - h.x, z - h.z) < pad + 4) return true;
  return false;
}

function useTreeLayout(density: number) {
  return useMemo(() => {
    const r = rng(2024);
    const palms: Inst[] = [], mangos: Inst[] = [], baobabs: Inst[] = [], bush: Inst[] = [], tufts: Inst[] = [];
    // Oil palms lining the entry road and the main road, plus a grove to the north-west.
    for (let t = 0; t < 14; t++) {
      const z = 70 + t * 14;
      const x = z < 150 ? (-14 * (z - 42)) / 108 : -14 - (46 * (z - 150)) / 140;
      for (const side of [-1, 1]) {
        const px = x + side * (8 + r() * 2), pz = z + r() * 4;
        if (!nearObstacle(px, pz, 2)) palms.push({ x: px, z: pz, s: 0.85 + r() * 0.35, ry: r() * 6.28 });
      }
    }
    for (let i = 0; i < 9; i++) {
      for (const zz of [-8, 8]) palms.push({ x: -100 - i * 12 + r() * 3, z: zz + r() * 2, s: 0.8 + r() * 0.4, ry: r() * 6.28 });
    }
    for (let i = 0; i < 26; i++) {
      const x = -125 + r() * 45, z = -95 + r() * 45;
      palms.push({ x, z, s: 0.75 + r() * 0.45, ry: r() * 6.28 });
    }
    // Mango trees for shade near the buildings and scattered on the farm edge.
    const mangoSpots: [number, number][] = [[-46, 62], [-10, 74], [40, 64], [14, 72], [-50, -70], [-6, -68], [122, 30], [88, 34], [-96, 30], [96, -38], [-100, -30], [60, 58], [70, -60], [-70, 58]];
    for (const [x, z] of mangoSpots) mangos.push({ x: x + r() * 3, z: z + r() * 3, s: 0.9 + r() * 0.35, ry: r() * 6.28 });
    // Baobabs as landmarks.
    baobabs.push({ x: -108, z: 62, s: 1.1, ry: 0.4 }, { x: 140, z: 66, s: 0.95, ry: 2 }, { x: 66, z: -88, s: 1.2, ry: 1 });
    // Bush and forest on the hills.
    const nb = Math.floor(1700 * density);
    for (let i = 0, tries = 0; i < nb && tries < nb * 6; tries++) {
      const a = r() * Math.PI * 2, d = 110 + Math.pow(r(), 0.7) * 620;
      const x = Math.cos(a) * d * 1.15, z = Math.sin(a) * d;
      const m = farmMask(x, z);
      if (m < 0.15 || distToRoads(x, z) < 5) continue;
      if (fieldAt(x, z, 8) >= 0 || nearObstacle(x, z, 6)) continue;
      const clump = vnoiseish(x, z);
      if (r() > 0.15 + clump * clump * 0.85) continue;
      bush.push({ x, z, s: 0.8 + r() * 0.9 + m * 0.6, ry: r() * 6.28 });
      i++;
    }
    // Grass tufts along field edges and tracks.
    const nt = Math.floor(700 * density);
    for (let i = 0, tries = 0; i < nt && tries < nt * 8; tries++) {
      const x = -150 + r() * 300, z = -90 + r() * 190;
      if (fieldAt(x, z, 0.5) >= 0) continue;
      const edge = fieldAt(x, z, 3.5) >= 0 || distToRoads(x, z) < 4;
      if (!edge && r() > 0.15) continue;
      if (distToRoads(x, z) < 0.6 || nearObstacle(x, z, 1)) continue;
      if (Math.abs(x - RESERVOIR.cx) < RESERVOIR.hw + 4 && Math.abs(z - RESERVOIR.cz) < RESERVOIR.hd + 4) continue;
      tufts.push({ x, z, s: 0.7 + r() * 0.8, ry: r() * 6.28 });
      i++;
    }
    return { palms, mangos, baobabs, bush, tufts };
  }, [density]);
}

function vnoiseish(x: number, z: number) {
  return 0.5 + 0.5 * Math.sin(x * 0.021 + Math.sin(z * 0.017) * 2.0) * Math.cos(z * 0.019 + Math.sin(x * 0.013) * 1.7);
}

function Instanced({ geo, mat, items, shadows }: { geo: THREE.BufferGeometry; mat: THREE.Material; items: Inst[]; shadows?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    const q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
    items.forEach((it, i) => {
      e.set(0, it.ry, 0); q.setFromEuler(e);
      v.set(it.x, heightAt(it.x, it.z) - 0.15, it.z);
      s.setScalar(it.s);
      m.setMatrixAt(i, new THREE.Matrix4().compose(v, q, s));
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} castShadow={shadows} receiveShadow={false} />;
}

export function Trees({ density, shadows }: { density: number; shadows: boolean }) {
  const L = useTreeLayout(density);
  const g = useMemo(() => ({
    palm: palmGeometry(), mango: mangoGeometry(2), baobab: baobabGeometry(), bush: bushGeometry(), tuft: tuftGeometry(),
  }), []);
  const m = useMemo(() => ({
    palm: plantMaterial(13, 0.012), mango: plantMaterial(7, 0.006), baobab: plantMaterial(11, 0.004), bush: plantMaterial(5, 0.004), tuft: plantMaterial(0.6, 0.06),
  }), []);
  return (
    <>
      <Instanced geo={g.palm} mat={m.palm} items={L.palms} shadows={shadows} />
      <Instanced geo={g.mango} mat={m.mango} items={L.mangos} shadows={shadows} />
      <Instanced geo={g.baobab} mat={m.baobab} items={L.baobabs} shadows={shadows} />
      <Instanced geo={g.bush} mat={m.bush} items={L.bush} />
      <Instanced geo={g.tuft} mat={m.tuft} items={L.tufts} />
    </>
  );
}
