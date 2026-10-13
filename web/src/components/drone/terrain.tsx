"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FIELDS, ROADS, YARDS, RESERVOIR, WATER_LEVEL, farmMask, heightAt } from "./world";
import type { Game } from "./store";

const NOISE_GLSL = /* glsl */ `
float vh(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(vh(i),vh(i+vec2(1,0)),u.x), mix(vh(i+vec2(0,1)),vh(i+vec2(1,1)),u.x), u.y)*2.-1.; }
float fbm3(vec2 p){ return vn(p)*.5 + vn(p*2.03)*.25 + vn(p*4.11)*.125; }
`;

/** Grid that is dense near the farm and coarse in the distance. */
function buildTerrain(segs: number, extent: number) {
  const N = segs + 1;
  const a = 175 / extent; // linear part (fine near centre)
  const map = (u: number) => Math.sign(u) * extent * (a * Math.abs(u) + (1 - a) * Math.pow(Math.abs(u), 5));
  const pos = new Float32Array(N * N * 3);
  const mask = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    const z = map((j / segs) * 2 - 1);
    for (let i = 0; i < N; i++) {
      const x = map((i / segs) * 2 - 1);
      const k = j * N + i;
      pos[k * 3] = x; pos[k * 3 + 1] = heightAt(x, z); pos[k * 3 + 2] = z;
      mask[k] = farmMask(x, z);
    }
  }
  const idx = new Uint32Array(segs * segs * 6);
  let p = 0;
  for (let j = 0; j < segs; j++) for (let i = 0; i < segs; i++) {
    const A = j * N + i, B = A + 1, C = A + N, D = C + 1;
    idx[p++] = A; idx[p++] = C; idx[p++] = B; idx[p++] = B; idx[p++] = C; idx[p++] = D;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aMask", new THREE.BufferAttribute(mask, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

export function Terrain({ game, segs }: { game: Game; segs: number }) {
  const geo = useMemo(() => buildTerrain(segs, 760), [segs]);
  const uniforms = useMemo(() => ({
    uRoads: { value: ROADS.map(([ax, az, bx, bz]) => new THREE.Vector4(ax, az, bx, bz)) },
    uRoadW: { value: ROADS.map((r) => r[4]) },
    uYards: { value: YARDS.map(([x, z, r]) => new THREE.Vector3(x, z, r)) },
    uFields: { value: FIELDS.map((f) => new THREE.Vector4(f.cx, f.cz, f.hw, f.hd)) },
    uRow: { value: FIELDS.map((f) => f.sz) },
    uMoist: { value: FIELDS.map(() => 0) },
    uRes: { value: new THREE.Vector4(RESERVOIR.cx, RESERVOIR.cz, RESERVOIR.hw, RESERVOIR.hd) },
  }), []);
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0 });
    m.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, uniforms);
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aMask; varying vec3 vW; varying float vMask;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvW = (modelMatrix*vec4(transformed,1.)).xyz; vMask = aMask;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", `#include <common>
varying vec3 vW; varying float vMask;
uniform vec4 uRoads[${ROADS.length}]; uniform float uRoadW[${ROADS.length}];
uniform vec3 uYards[${YARDS.length}];
uniform vec4 uFields[${FIELDS.length}]; uniform float uRow[${FIELDS.length}]; uniform float uMoist[${FIELDS.length}];
uniform vec4 uRes;
float tWet;
${NOISE_GLSL}
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
float sdBox2(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
`)
        .replace("#include <color_fragment>", `#include <color_fragment>
{
  vec2 p = vW.xz;
  float n = fbm3(p*0.035), n2 = vn(p*0.31), n3 = vn(p*1.9), n4 = vn(p*7.0);
  // Grass: warm golden-hour greens with patches of drier savanna grass.
  vec3 gA = vec3(0.25,0.43,0.10), gB = vec3(0.47,0.52,0.17), gC = vec3(0.15,0.33,0.075);
  vec3 col = mix(gA, gB, smoothstep(-0.15,0.55,n));
  col = mix(col, gC, smoothstep(0.1,0.75,n2)*0.5);
  col *= 0.9 + 0.12*n3 + 0.05*n4;
  // Hills: forest canopy, darker and blotchy.
  vec3 forest = mix(vec3(0.13,0.27,0.08), vec3(0.25,0.38,0.12), smoothstep(-0.4,0.6, vn(p*0.09)+n3*0.3));
  col = mix(col, forest, smoothstep(0.35,0.9,vMask)*0.85);
  // Laterite yards.
  float yard = 1e3;
  for(int i=0;i<${YARDS.length};i++){ yard = min(yard, length(p-uYards[i].xy)-uYards[i].z); }
  vec3 earth = vec3(0.64,0.36,0.2) * (0.92 + 0.1*n3);
  col = mix(col, mix(earth, col, 0.35), 1.-smoothstep(-2.,3.,yard + n2*3.));
  // Reservoir banks.
  float rb = sdBox2(p-uRes.xy, uRes.zw);
  col = mix(col, vec3(0.45,0.35,0.22), 1.-smoothstep(0.,3.,rb+n3*.6));
  // Roads (red laterite) with tyre tracks and a dusty verge.
  float rd = 1e3; float tr = 1e3;
  for(int i=0;i<${ROADS.length};i++){ float d = sdSeg(p, uRoads[i].xy, uRoads[i].zw); rd = min(rd, d - uRoadW[i]*.5); tr = min(tr, abs(abs(d)-uRoadW[i]*.2)); }
  vec3 lat = vec3(0.70,0.33,0.16) * (0.9 + 0.12*n3 + 0.06*n4);
  lat = mix(lat*0.82, lat, smoothstep(0.15,0.6,tr));
  col = mix(col, mix(col, vec3(0.62,0.42,0.24), 0.55), 1.-smoothstep(0.,2.4,rd + n3*0.8));
  col = mix(col, lat, 1.-smoothstep(-0.35,0.35,rd + n4*0.25));
  // Fields: furrowed soil that darkens as it is watered.
  tWet = 0.;
  for(int i=0;i<${FIELDS.length};i++){
    vec2 q = p - uFields[i].xy;
    float fd = sdBox2(q, uFields[i].zw);
    if (fd < 1.6) {
      float inside = 1.-smoothstep(-0.6,0.5,fd + n4*0.3);
      float m = uMoist[i];
      float spread = smoothstep(0., 1., m*1.5 - 0.35 + n2*0.35 + n3*0.12);
      spread = max(spread, smoothstep(0.85,1.,m));
      float rows = 0.5+0.5*cos(q.y/uRow[i]*6.2832);
      vec3 dry = vec3(0.66,0.52,0.34) * (0.92+0.1*n3+0.05*n4);
      vec3 wet = vec3(0.30,0.19,0.11) * (0.92+0.12*n3);
      vec3 soil = mix(dry, wet, spread);
      soil *= mix(1.06, 0.80, rows);
      // a few weeds between rows
      soil = mix(soil, vec3(0.32,0.42,0.14), smoothstep(0.55,0.9,n4)*0.25*(1.-rows));
      col = mix(col, soil, inside);
      tWet = max(tWet, spread*inside);
    }
  }
  diffuseColor.rgb = col;
}`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.62, tWet);");
    };
    m.customProgramCacheKey = () => "verdant-terrain";
    return m;
  }, [uniforms]);

  useFrame(() => {
    const vis = game.visual;
    for (let i = 0; i < FIELDS.length; i++) uniforms.uMoist.value[i] = vis[i];
  });

  return <mesh geometry={geo} material={mat} receiveShadow />;
}

/** Procedural tiling normal map for the water surface. */
function waterNormals() {
  const S = 128;
  const data = new Uint8Array(S * S * 4);
  const h = (x: number, y: number) => {
    const t = (x / S) * Math.PI * 2, u = (y / S) * Math.PI * 2;
    return Math.sin(t * 3 + Math.sin(u * 2) * 1.5) * 0.5 + Math.sin(u * 5 + t * 2) * 0.35 + Math.sin((t + u) * 7) * 0.15;
  };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = h(x + 1, y) - h(x - 1, y), dy = h(x, y + 1) - h(x, y - 1);
    const n = new THREE.Vector3(-dx * 2, -dy * 2, 1).normalize();
    const k = (y * S + x) * 4;
    data[k] = (n.x * 0.5 + 0.5) * 255; data[k + 1] = (n.y * 0.5 + 0.5) * 255; data[k + 2] = (n.z * 0.5 + 0.5) * 255; data[k + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.needsUpdate = true;
  return tex;
}

export function Water() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const nm = useMemo(waterNormals, []);
  const y = useMemo(WATER_LEVEL, []);
  useFrame((_, dt) => {
    nm.offset.x += dt * 0.02;
    nm.offset.y += dt * 0.012;
  });
  return (
    <mesh position={[RESERVOIR.cx, y, RESERVOIR.cz]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[RESERVOIR.hw * 2 + 7, RESERVOIR.hd * 2 + 7]} />
      <meshStandardMaterial ref={ref} color="#2c6b66" roughness={0.06} metalness={0.1} normalMap={nm} normalScale={new THREE.Vector2(0.35, 0.35)} envMapIntensity={1.2} />
    </mesh>
  );
}
