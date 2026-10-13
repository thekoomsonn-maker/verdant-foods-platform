"use client";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FIELDS, heightAt } from "./world";
import { DRONE_SCALE, NOZZLES } from "./drone-model";
import { leafShape } from "./geo";
import type { Game } from "./store";

/* ---------- CPU-simulated, GPU-drawn particle pool ---------- */
class Pool {
  n: number; next = 0;
  pos: Float32Array; vel: Float32Array; life: Float32Array; max: Float32Array; size: Float32Array; alpha: Float32Array; col: Float32Array; gy: Float32Array; drag: Float32Array; grow: Float32Array;
  geo: THREE.BufferGeometry;
  aLife: THREE.BufferAttribute; aPos: THREE.BufferAttribute; aSize: THREE.BufferAttribute; aAlpha: THREE.BufferAttribute; aCol: THREE.BufferAttribute;
  constructor(n: number) {
    this.n = n;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.col = new Float32Array(n * 3).fill(1);
    this.life = new Float32Array(n); this.max = new Float32Array(n).fill(1); this.size = new Float32Array(n); this.alpha = new Float32Array(n);
    this.gy = new Float32Array(n).fill(-1e9); this.drag = new Float32Array(n); this.grow = new Float32Array(n);
    this.geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aLife = new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.aAlpha = new THREE.BufferAttribute(this.alpha, 1);
    this.aCol = new THREE.BufferAttribute(this.col, 3);
    this.geo.setAttribute("position", this.aPos);
    this.geo.setAttribute("aLife", this.aLife);
    this.geo.setAttribute("aSize", this.aSize);
    this.geo.setAttribute("aAlpha", this.aAlpha);
    this.geo.setAttribute("aCol", this.aCol);
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  }
  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number, alpha: number, gy: number, drag = 0, grow = 0, c?: THREE.Color) {
    const i = this.next; this.next = (this.next + 1) % this.n;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.max[i] = life; this.size[i] = size; this.alpha[i] = alpha; this.gy[i] = gy; this.drag[i] = drag; this.grow[i] = grow;
    if (c) { this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b; }
  }
  step(dt: number, gravity: number) {
    const L = this.aLife.array as Float32Array;
    let alive = false;
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) { L[i] = 0; continue; }
      alive = true;
      this.life[i] -= dt;
      const d = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= d; this.vel[i * 3 + 2] *= d;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d - gravity * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] += this.grow[i] * dt;
      if (this.pos[i * 3 + 1] < this.gy[i]) {
        // droplets settle: stop, flatten out and fade quickly
        this.pos[i * 3 + 1] = this.gy[i];
        this.vel[i * 3] *= 0.2; this.vel[i * 3 + 1] = 0; this.vel[i * 3 + 2] *= 0.2;
        this.life[i] = Math.min(this.life[i], 0.18);
      }
      L[i] = Math.max(0, this.life[i] / this.max[i]);
    }
    this.aPos.needsUpdate = true; this.aLife.needsUpdate = true; this.aSize.needsUpdate = true; this.aAlpha.needsUpdate = true; this.aCol.needsUpdate = true;
    return alive;
  }
}

function pointsMaterial(additive: boolean, twinkle: boolean) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 500 }, uT: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aLife; attribute float aSize; attribute float aAlpha; attribute vec3 aCol;
      varying float vA; varying vec3 vC; uniform float uScale; uniform float uT;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mv;
        float a = aAlpha * smoothstep(0., 0.25, aLife) * smoothstep(1., 0.85, aLife);
        ${twinkle ? "a *= 0.55 + 0.45 * sin(uT * 18. + position.x * 7. + position.z * 3.);" : ""}
        vA = a; vC = aCol;
        gl_PointSize = aLife > 0. ? max(1.5, aSize * uScale / -mv.z) : 0.;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA; varying vec3 vC;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        ${twinkle ? "a = pow(a, 2.2) * 1.6;" : "a = pow(a, 1.4);"}
        a *= vA;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vC, a);
      }`,
  });
}

function usePointScale(mat: THREE.ShaderMaterial) {
  const { size, viewport, camera } = useThree();
  useFrame((st) => {
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50;
    mat.uniforms.uScale.value = (size.height * viewport.dpr) / (2 * Math.tan((fov * Math.PI) / 360));
    mat.uniforms.uT.value = st.clock.elapsedTime;
  });
}

const tmpV = new THREE.Vector3();

/** Water mist from the four nozzles. */
export function Spray({ game, drone, count }: { game: Game; drone: RefObject<THREE.Group | null>; count: number }) {
  const pool = useMemo(() => new Pool(count), [count]);
  const mat = useMemo(() => pointsMaterial(false, false), []);
  usePointScale(mat);
  const acc = useRef(0);
  const white = useMemo(() => new THREE.Color("#eef9ff"), []);
  const blue = useMemo(() => new THREE.Color("#cfeaf6"), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const d = drone.current;
    if (d && game.spraying) {
      acc.current += dt * (count / 1.15);
      const gy = heightAt(d.position.x, d.position.z);
      const plant = game.field >= 0 ? 0.6 : 0.05;
      while (acc.current > 1) {
        acc.current -= 1;
        const nz = NOZZLES[(Math.random() * 4) | 0];
        tmpV.set(nz[0] * DRONE_SCALE, nz[1] * DRONE_SCALE, nz[2] * DRONE_SCALE);
        d.localToWorld(tmpV);
        const big = Math.random() < 0.28;
        const v = game.vel;
        pool.spawn(
          tmpV.x + (Math.random() - 0.5) * 0.1, tmpV.y, tmpV.z + (Math.random() - 0.5) * 0.1,
          v.x * 0.55 + (Math.random() - 0.5) * (big ? 2.2 : 1.6), -(big ? 3.5 : 6.5) - Math.random() * 3, v.z * 0.55 + (Math.random() - 0.5) * (big ? 2.2 : 1.6),
          big ? 1.4 : 1.0, big ? 0.9 + Math.random() * 0.7 : 0.08 + Math.random() * 0.09, big ? 0.1 : 0.75,
          gy + plant, big ? 1.4 : 0.3, big ? 1.2 : 0, big ? blue : white,
        );
      }
    }
    pool.step(dt, 6);
  });
  return <points geometry={pool.geo} material={mat} frustumCulled={false} renderOrder={2} />;
}

/** A soft, streaky curtain of mist from the boom down to the crop canopy. */
export function SprayCurtain({ game, drone }: { game: Game; drone: RefObject<THREE.Group | null> }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 }, uO: { value: 0 }, uRt: { value: 0.75 }, uRb: { value: 2.4 } },
    vertexShader: /* glsl */ `
      uniform float uRt; uniform float uRb;
      varying vec2 vUv; varying float vT; varying vec3 vN; varying vec3 vV;
      void main(){
        vUv = uv; vT = 0.5 - position.y;
        vec3 p = position;
        float r = mix(uRt, uRb, vT);
        p.x *= r * 1.25; p.z *= r * 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vN = normalize(normalMatrix * vec3(normal.x, 0., normal.z));
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uT; uniform float uO;
      varying vec2 vUv; varying float vT; varying vec3 vN; varying vec3 vV;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        float s = n(vec2(vUv.x * 46., vUv.y * 2.5 + uT * 4.2)) * 0.6 + n(vec2(vUv.x * 13., vUv.y * 1.2 + uT * 2.6)) * 0.4;
        float a = smoothstep(0., 0.12, vT) * (1. - smoothstep(0.55, 1., vT));
        float graze = 1. - abs(dot(vN, vV));
        a *= (0.3 + 0.7 * graze) * (0.35 + 0.65 * s);
        gl_FragColor = vec4(vec3(0.94, 0.98, 1.0), a * uO * 0.4);
      }`,
  }), []);
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 28, 1, true), []);
  useFrame((st, raw) => {
    const dt = Math.min(raw, 0.05);
    const d = drone.current, m = ref.current;
    if (!d || !m) return;
    mat.uniforms.uT.value = st.clock.elapsedTime;
    const target = game.spraying ? 1 : 0;
    mat.uniforms.uO.value += (target - mat.uniforms.uO.value) * (1 - Math.exp(-dt * (game.spraying ? 8 : 4)));
    m.visible = mat.uniforms.uO.value > 0.01;
    if (!m.visible) return;
    const top = d.position.y - 0.42 * DRONE_SCALE;
    const plant = game.field >= 0 ? 0.5 + game.visual[game.field] * 0.6 : 0.05;
    const bottom = heightAt(d.position.x, d.position.z) + plant;
    const hgt = Math.max(0.5, top - bottom);
    m.position.set(d.position.x, top - hgt / 2, d.position.z);
    m.rotation.set(0, d.rotation.y, 0);
    m.scale.set(1, hgt, 1);
    mat.uniforms.uRb.value = 1.2 + hgt * 0.18;
  });
  return <mesh ref={ref} geometry={geo} material={mat} renderOrder={1} frustumCulled={false} />;
}

/** Lime and gold sparkles rising from plants as they drink, plus a burst when a field is done. */
export function Sparkles({ game, count }: { game: Game; count: number }) {
  const pool = useMemo(() => new Pool(count), [count]);
  const mat = useMemo(() => pointsMaterial(true, true), []);
  usePointScale(mat);
  const cols = useMemo(() => [new THREE.Color("#d8ff9a"), new THREE.Color("#bbea70"), new THREE.Color("#ffe08a"), new THREE.Color("#ffffff")], []);
  const acc = useRef(0);
  const seen = useRef(0);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const p = game.pos;
    if (game.spraying && game.field >= 0 && game.moisture[game.field] < 1) {
      acc.current += dt * 45;
      while (acc.current > 1) {
        acc.current -= 1;
        const a = Math.random() * 6.28, r = Math.random() * 3.2;
        const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
        const y = heightAt(x, z) + 0.4 + Math.random() * 1.2;
        pool.spawn(x, y, z, (Math.random() - 0.5) * 0.4, 0.6 + Math.random() * 0.8, (Math.random() - 0.5) * 0.4, 1.2 + Math.random() * 0.6, 0.12 + Math.random() * 0.12, 0.9, -1e9, 0.5, 0, cols[(Math.random() * 4) | 0]);
      }
    }
    if (game.phase === "celebrate" && game.phaseTime < 6) {
      // Sparkles twinkle up across the whole farm during the celebration sweep.
      for (let j = 0; j < Math.ceil(dt * 70); j++) {
        const f = FIELDS[(Math.random() * FIELDS.length) | 0];
        const x = f.cx + (Math.random() - 0.5) * f.hw * 2, z = f.cz + (Math.random() - 0.5) * f.hd * 2;
        pool.spawn(x, heightAt(x, z) + 0.5 + Math.random() * 2, z, 0, 1.5 + Math.random() * 2, 0, 1.8 + Math.random(), 0.35 + Math.random() * 0.3, 1, -1e9, 0.4, 0, cols[(Math.random() * 4) | 0]);
      }
    }
    if (game.burst.n !== seen.current) {
      seen.current = game.burst.n;
      const f = FIELDS[game.burst.field];
      if (f) for (let i = 0; i < Math.min(count * 0.6, 260); i++) {
        const x = f.cx + (Math.random() - 0.5) * f.hw * 2, z = f.cz + (Math.random() - 0.5) * f.hd * 2;
        const y = heightAt(x, z) + 0.5 + Math.random() * 1.5;
        pool.spawn(x, y, z, 0, 1 + Math.random() * 2.2, 0, 1.6 + Math.random() * 1.4, 0.18 + Math.random() * 0.2, 1, -1e9, 0.6, 0, cols[(Math.random() * 4) | 0]);
      }
    }
    pool.step(dt, -0.2);
  });
  return <points geometry={pool.geo} material={mat} frustumCulled={false} renderOrder={3} />;
}

/** Falling leaves in brand greens for the "all fields watered" moment. */
export function LeafConfetti({ game, count }: { game: Game; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => leafShape(), []);
  const state = useMemo(() => ({
    p: new Float32Array(count * 3), v: new Float32Array(count * 3), r: new Float32Array(count * 3), w: new Float32Array(count * 3), live: new Uint8Array(count), s: new Float32Array(count),
  }), [count]);
  const cam = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const m = ref.current!;
    const cols = ["#bbea70", "#5f9f0d", "#8cc63f", "#f7c33c", "#bbea70", "#e4efe8"];
    for (let i = 0; i < count; i++) m.setColorAt(i, new THREE.Color(cols[i % cols.length]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.count = 0;
  }, [count]);
  const mtx = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const camUp = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const m = ref.current;
    if (!m) return;
    const emitting = game.phase === "celebrate" && game.phaseTime < 6;
    let any = false;
    cam.getWorldDirection(fwd);
    right.setFromMatrixColumn(cam.matrixWorld, 0);
    camUp.setFromMatrixColumn(cam.matrixWorld, 1);
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      if (!state.live[i]) {
        if (!emitting || Math.random() > dt * 1.6) continue;
        // Spawn inside the view, in the upper part of the frame, so leaves drift down across it.
        const dist = 10 + Math.random() * 45;
        const side = (Math.random() - 0.5) * dist * 1.2;
        const up = (0.1 + Math.random() * 0.4) * dist;
        state.p[k] = cam.position.x + fwd.x * dist + right.x * side + camUp.x * up;
        state.p[k + 1] = cam.position.y + fwd.y * dist + right.y * side + camUp.y * up;
        state.p[k + 2] = cam.position.z + fwd.z * dist + right.z * side + camUp.z * up;
        state.v[k] = (Math.random() - 0.5) * 1.2; state.v[k + 1] = -(1.4 + Math.random() * 1.4); state.v[k + 2] = (Math.random() - 0.5) * 1.2;
        state.r[k] = Math.random() * 6; state.r[k + 1] = Math.random() * 6; state.r[k + 2] = Math.random() * 6;
        state.w[k] = 1 + Math.random() * 3; state.w[k + 1] = 1 + Math.random() * 3; state.w[k + 2] = Math.random() * 6;
        state.s[i] = 0.6 + Math.random() * 0.7;
        state.live[i] = 1;
      }
      any = true;
      state.p[k] += (state.v[k] + Math.sin(state.r[k + 2] * 1.3) * 0.8) * dt;
      state.p[k + 1] += state.v[k + 1] * dt;
      state.p[k + 2] += (state.v[k + 2] + Math.cos(state.r[k + 2] * 1.1) * 0.8) * dt;
      state.r[k] += state.w[k] * dt; state.r[k + 1] += state.w[k + 1] * dt; state.r[k + 2] += dt * 2;
      if (state.p[k + 1] < heightAt(state.p[k], state.p[k + 2]) + 0.1) state.live[i] = 0;
    }
    let n = 0;
    for (let i = 0; i < count; i++) {
      if (!state.live[i]) continue;
      const k = i * 3;
      e.set(state.r[k], state.r[k + 1], 0);
      q.setFromEuler(e);
      pos.set(state.p[k], state.p[k + 1], state.p[k + 2]);
      one.setScalar(state.s[i]);
      mtx.compose(pos, q, one);
      m.setMatrixAt(n++, mtx);
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    m.visible = any;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.6} emissive="#3d6b12" emissiveIntensity={0.25} />
    </instancedMesh>
  );
}
