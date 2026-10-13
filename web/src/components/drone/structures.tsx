"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HOTSPOTS, RESERVOIR, WATER_LEVEL, heightAt } from "./world";
import type { Game } from "./store";

/* ---------- small texture helpers (client only) ---------- */
export function radialTexture(stops: [number, string][], size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function signTexture() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#024639"; g.fillRect(0, 0, 1024, 160);
  g.fillStyle = "#bbea70"; g.fillRect(0, 148, 1024, 12);
  g.fillStyle = "#ffffff";
  g.font = "600 84px 'Plus Jakarta Sans', system-ui, sans-serif";
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillText("Verdant Foods", 512, 76);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function panelTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c9d0d6"; g.fillRect(0, 0, 256, 160);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 10; i++) {
    const grd = g.createLinearGradient(0, j * 26, 0, j * 26 + 24);
    grd.addColorStop(0, "#1f3460"); grd.addColorStop(1, "#14244a");
    g.fillStyle = grd;
    g.fillRect(4 + i * 25, 4 + j * 26, 23, 24);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function shutterTexture() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#9aa39e"; g.fillRect(0, 0, 64, 128);
  for (let y = 0; y < 128; y += 6) { g.fillStyle = "#7f8984"; g.fillRect(0, y, 64, 2); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function useMats() {
  return useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ color: "#efe9dc", roughness: 0.85 }),
    roof: new THREE.MeshStandardMaterial({ color: "#0b5b49", roughness: 0.45, metalness: 0.35 }),
    roofLight: new THREE.MeshStandardMaterial({ color: "#b9c3bf", roughness: 0.4, metalness: 0.55 }),
    concrete: new THREE.MeshStandardMaterial({ color: "#c9c4b8", roughness: 0.95 }),
    steel: new THREE.MeshStandardMaterial({ color: "#8d9693", roughness: 0.4, metalness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: "#1d2421", roughness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({ color: "#294a48", roughness: 0.1, metalness: 0.4 }),
    tunnel: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6e6", emissiveIntensity: 0.18, roughness: 0.35, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
    rib: new THREE.MeshStandardMaterial({ color: "#d9dedb", roughness: 0.4, metalness: 0.6 }),
    seedling: new THREE.MeshStandardMaterial({ color: "#4f9a2f", roughness: 0.8 }),
    green: new THREE.MeshStandardMaterial({ color: "#024639", roughness: 0.6 }),
    lime: new THREE.MeshStandardMaterial({ color: "#bbea70", roughness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: "#f4f5f2", roughness: 0.35, metalness: 0.15 }),
    tank: new THREE.MeshStandardMaterial({ color: "#20262a", roughness: 0.55 }),
    pipe: new THREE.MeshStandardMaterial({ color: "#2f5f9e", roughness: 0.5 }),
    tyre: new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.9 }),
  }), []);
}

type M = ReturnType<typeof useMats>;

function Packhouse({ m }: { m: M }) {
  const [x, z] = [-26, 58];
  const y = heightAt(x, z);
  const sign = useMemo(signTexture, []);
  const shutter = useMemo(shutterTexture, []);
  const W = 22, D = 14, H = 6, R = 2.6;
  const slope = Math.atan2(R, D / 2);
  const sl = Math.hypot(R, D / 2) + 0.5;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.15, 2]} receiveShadow material={m.concrete}><boxGeometry args={[W + 6, 0.5, D + 10]} /></mesh>
      <mesh position={[0, H / 2 - 0.5, 0]} castShadow receiveShadow material={m.wall}><boxGeometry args={[W, H + 1, D]} /></mesh>
      {/* gables */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - 0.01), H - 0.02, 0]} rotation-y={s * Math.PI / 2} material={m.wall} castShadow>
          <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, R)])]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, H + R / 2, (s * D) / 4]} rotation-x={s * slope} castShadow receiveShadow material={m.roof}>
          <boxGeometry args={[W + 1.4, 0.18, sl]} />
        </mesh>
      ))}
      <mesh position={[0, H + R + 0.02, 0]} material={m.roofLight}><boxGeometry args={[W + 1.5, 0.22, 0.5]} /></mesh>
      {/* sign + shutters on the road side */}
      <mesh position={[0, H - 1.1, D / 2 + 0.02]}><planeGeometry args={[9, 1.4]} /><meshStandardMaterial map={sign} roughness={0.6} /></mesh>
      {[-7, 0, 7].map((sx) => (
        <mesh key={sx} position={[sx, 1.9, D / 2 + 0.02]}><planeGeometry args={[4, 3.6]} /><meshStandardMaterial map={shutter} roughness={0.6} metalness={0.3} /></mesh>
      ))}
      {/* loading canopy */}
      <mesh position={[0, 4.1, D / 2 + 2]} castShadow material={m.roof}><boxGeometry args={[W - 2, 0.14, 4]} /></mesh>
      {[-9, 9].map((sx) => <mesh key={sx} position={[sx, 2.05, D / 2 + 3.8]} material={m.steel}><cylinderGeometry args={[0.1, 0.1, 4.1, 6]} /></mesh>)}
      {/* windows */}
      {[-1, 1].map((s) => [-4, 0, 4].map((wz) => (
        <mesh key={`${s}${wz}`} position={[s * (W / 2 + 0.02), 3.6, wz]} rotation-y={s * Math.PI / 2} material={m.glass}><planeGeometry args={[2.2, 1.2]} /></mesh>
      )))}
      <Van m={m} position={[9, 0.4, D / 2 + 9]} rotation={-0.25} />
    </group>
  );
}

function Van({ m, position, rotation }: { m: M; position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 1.55, -0.4]} castShadow material={m.white}><boxGeometry args={[2.1, 2.2, 4.2]} /></mesh>
      <mesh position={[0, 1.2, 2.25]} castShadow material={m.white}><boxGeometry args={[2.05, 1.5, 1.3]} /></mesh>
      <mesh position={[0, 1.6, 2.92]} material={m.glass}><boxGeometry args={[1.8, 0.7, 0.05]} /></mesh>
      <mesh position={[1.06, 1.3, -0.4]} material={m.green}><boxGeometry args={[0.02, 0.35, 4.1]} /></mesh>
      <mesh position={[-1.06, 1.3, -0.4]} material={m.green}><boxGeometry args={[0.02, 0.35, 4.1]} /></mesh>
      <mesh position={[1.06, 1.05, -0.4]} material={m.lime}><boxGeometry args={[0.02, 0.1, 4.1]} /></mesh>
      <mesh position={[-1.06, 1.05, -0.4]} material={m.lime}><boxGeometry args={[0.02, 0.1, 4.1]} /></mesh>
      {[[-1, -1.6], [1, -1.6], [-1, 2.1], [1, 2.1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[sx * 0.95, 0.4, sz]} rotation-z={Math.PI / 2} material={m.tyre}><cylinderGeometry args={[0.4, 0.4, 0.3, 10]} /></mesh>
      ))}
    </group>
  );
}

function CollectionPoint({ m }: { m: M }) {
  const [x, z] = [24, 54];
  const y = heightAt(x, z);
  const crates = useRef<THREE.InstancedMesh>(null);
  const layout = useMemo(() => {
    const out: { p: [number, number, number]; c: string }[] = [];
    const cols = ["#3f8f3a", "#f2b632", "#d24a2c", "#3f8f3a", "#2f6fb0"];
    let k = 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) for (let h = 0; h < 1 + ((i + j) % 3); h++) {
      out.push({ p: [-3.6 + i * 0.75, 0.62 + h * 0.36, -2.6 + j * 0.6], c: cols[k++ % cols.length] });
    }
    for (let i = 0; i < 5; i++) out.push({ p: [1.5 + (i % 3) * 0.75, 0.62 + Math.floor(i / 3) * 0.36, 1.6], c: cols[(i + 2) % cols.length] });
    return out;
  }, []);
  useLayoutEffect(() => {
    const im = crates.current!;
    const mm = new THREE.Matrix4();
    layout.forEach((l, i) => { mm.makeTranslation(...l.p); im.setMatrixAt(i, mm); im.setColorAt(i, new THREE.Color(l.c)); });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, [layout]);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.2, 0]} receiveShadow material={m.concrete}><boxGeometry args={[12, 0.45, 10]} /></mesh>
      {[[-5.5, -4.5], [5.5, -4.5], [-5.5, 4.5], [5.5, 4.5], [0, -4.5], [0, 4.5]].map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px, 2.6, pz]} castShadow material={m.steel}><cylinderGeometry args={[0.12, 0.12, 4.8, 6]} /></mesh>
      ))}
      <mesh position={[0, 5.0, 0]} rotation-x={0.12} castShadow receiveShadow material={m.roof}><boxGeometry args={[12.6, 0.16, 10.6]} /></mesh>
      <instancedMesh ref={crates} args={[undefined, undefined, layout.length]} castShadow>
        <boxGeometry args={[0.7, 0.34, 0.5]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      {/* weighing scale */}
      <mesh position={[2.6, 0.75, -1.6]} material={m.steel}><boxGeometry args={[1, 0.15, 1]} /></mesh>
      <mesh position={[2.6, 1.35, -2.05]} material={m.dark}><boxGeometry args={[0.5, 0.5, 0.1]} /></mesh>
    </group>
  );
}

function Greenhouses({ m }: { m: M }) {
  const tunnels: [number, number][] = [[-34, -56], [-22, -56]];
  const L = 23, Rr = 4.2;
  return (
    <>
      {tunnels.map(([x, z]) => {
        const y = heightAt(x, z);
        return (
          <group key={x} position={[x, y, z]}>
            <mesh rotation-x={Math.PI / 2} material={m.tunnel} castShadow>
              <cylinderGeometry args={[Rr, Rr, L, 24, 1, true, Math.PI / 2, Math.PI]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[0, 0, (s * L) / 2]} material={m.tunnel}>
                <circleGeometry args={[Rr, 24, 0, Math.PI]} />
              </mesh>
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <mesh key={i} position={[0, 0, -L / 2 + (i * L) / 8]} material={m.rib}><torusGeometry args={[Rr + 0.03, 0.05, 4, 20, Math.PI]} /></mesh>
            ))}
            {[-2, 0, 2].map((rx) => (
              <mesh key={rx} position={[rx, 0.25, 0]} material={m.seedling}><boxGeometry args={[0.9, 0.5, L - 2]} /></mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

function SolarPump({ m }: { m: M }) {
  const tex = useMemo(panelTexture, []);
  const pmat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.22, metalness: 0.45 }), [tex]);
  const [x, z] = [106, 18];
  const y = heightAt(x, z);
  const panels: [number, number][] = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) panels.push([-5 + c * 2, -1.6 + r * 3.4]);
  // Elevated tank
  const tx = 92, tz = -22, ty = heightAt(tx, tz);
  // Pump house and pipe to the reservoir
  const px = 106, pz = 5, py = heightAt(px, pz);
  const wl = WATER_LEVEL();
  return (
    <>
      <group position={[x, y, z]}>
        {panels.map(([pxp, pzp]) => (
          <group key={`${pxp}${pzp}`} position={[pxp, 1.6, pzp]}>
            <mesh rotation-x={-1.3} castShadow receiveShadow material={pmat}><boxGeometry args={[1.9, 2.9, 0.06]} /></mesh>
            <mesh position={[0, -0.8, 0.2]} material={m.steel}><boxGeometry args={[0.08, 1.6, 0.08]} /></mesh>
          </group>
        ))}
      </group>
      <group position={[px, py, pz]}>
        <mesh position={[0, 1.3, 0]} castShadow material={m.wall}><boxGeometry args={[3.2, 2.6, 2.6]} /></mesh>
        <mesh position={[0, 2.7, 0]} castShadow material={m.roof}><boxGeometry args={[3.6, 0.15, 3]} /></mesh>
        <mesh position={[0, 1.0, -1.31]} material={m.green}><planeGeometry args={[1, 2]} /></mesh>
        <mesh position={[0, 0.5, -3.2]} rotation-x={Math.PI / 2} material={m.pipe}><cylinderGeometry args={[0.16, 0.16, 4, 8]} /></mesh>
      </group>
      <WaterOutflow x={px} z={pz - 5.3} top={py + 0.5} bottom={wl} m={m} />
      <group position={[tx, ty, tz]}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
          <mesh key={`${sx}${sz}`} position={[sx * 1.3, 3.2, sz * 1.3]} rotation={[sz * 0.05, 0, -sx * 0.05]} castShadow material={m.steel}><boxGeometry args={[0.16, 6.4, 0.16]} /></mesh>
        ))}
        <mesh position={[0, 6.4, 0]} castShadow material={m.steel}><boxGeometry args={[3.2, 0.2, 3.2]} /></mesh>
        <mesh position={[0, 7.7, 0]} castShadow material={m.tank}><cylinderGeometry args={[1.45, 1.5, 2.4, 18]} /></mesh>
        <mesh position={[0, 9.0, 0]} castShadow material={m.tank}><cylinderGeometry args={[0.4, 1.45, 0.3, 18]} /></mesh>
      </group>
    </>
  );
}

/** Water pouring from the pump pipe into the reservoir, with ripples. */
function WaterOutflow({ x, z, top, bottom, m }: { x: number; z: number; top: number; bottom: number; m: M }) {
  const stream = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 16; c.height = 64;
    const g = c.getContext("2d")!;
    for (let y = 0; y < 64; y++) { g.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * Math.abs(Math.sin(y * 0.6))})`; g.fillRect(0, y, 16, 1); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  useFrame((st, dt) => {
    tex.offset.y += dt * 2.4;
    const t = st.clock.elapsedTime;
    rings.current?.children.forEach((ch, i) => {
      const k = ((t * 0.6 + i / 3) % 1);
      ch.scale.setScalar(0.4 + k * 2.6);
      ((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.55;
    });
  });
  const h = top - bottom;
  return (
    <>
      <mesh position={[x, top, z + 1.2]} rotation-x={Math.PI / 2} material={m.pipe}><cylinderGeometry args={[0.16, 0.16, 2.6, 8]} /></mesh>
      <mesh ref={stream} position={[x, bottom + h / 2, z]}>
        <cylinderGeometry args={[0.12, 0.2, h, 8, 1, true]} />
        <meshBasicMaterial map={tex} color="#d9f2ff" transparent opacity={0.75} depthWrite={false} />
      </mesh>
      <group ref={rings} position={[x, bottom + 0.03, z]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.85, 1, 32]} />
            <meshBasicMaterial color="#e8f7ff" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function Structures() {
  const m = useMats();
  return (
    <>
      <Packhouse m={m} />
      <CollectionPoint m={m} />
      <Greenhouses m={m} />
      <SolarPump m={m} />
    </>
  );
}

/* ---------- Hotspot markers ---------- */
export function Hotspots({ game }: { game: Game }) {
  const halo = useMemo(() => radialTexture([[0, "rgba(220,255,160,1)"], [0.25, "rgba(187,234,112,0.55)"], [1, "rgba(187,234,112,0)"]]), []);
  const beamMat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color("#bbea70") } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec2 vUv; uniform float uT; uniform vec3 uC; void main(){ float a = pow(1.-vUv.y, 1.6) * 0.55; a *= 0.75+0.25*sin(vUv.y*30.-uT*3.); gl_FragColor = vec4(uC*a, a); }",
  }), []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    beamMat.uniforms.uT.value = t;
    HOTSPOTS.forEach((h, i) => {
      const g = refs.current[i];
      if (!g) return;
      const on = game.hotspot === h.id;
      const orb = g.children[0];
      orb.position.y = h.y + Math.sin(t * 1.6 + i) * 0.35;
      const s = on ? 1.35 : 1 + Math.sin(t * 2.2 + i) * 0.08;
      orb.scale.setScalar(s);
      const ring = g.children[2] as THREE.Mesh;
      const k = (t * 0.5 + i * 0.25) % 1;
      ring.scale.setScalar(1 + k * 3);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
    });
  });
  return (
    <>
      {HOTSPOTS.map((h, i) => {
        const gy = heightAt(h.x, h.z);
        return (
          <group key={h.id} ref={(el) => { refs.current[i] = el; }} position={[h.x, gy, h.z]}>
            <group>
              <mesh>
                <sphereGeometry args={[0.45, 20, 14]} />
                <meshBasicMaterial color="#e9ffc4" toneMapped={false} />
              </mesh>
              <sprite scale={[4.4, 4.4, 1]}>
                <spriteMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
              </sprite>
            </group>
            <mesh position={[0, h.y / 2, 0]} material={beamMat}>
              <cylinderGeometry args={[0.14, 0.14, h.y, 8, 1, true]} />
            </mesh>
            <mesh position={[0, 0.25, 0]} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[0.9, 1.1, 40]} />
              <meshBasicMaterial color="#bbea70" transparent opacity={0.6} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export const RESERVOIR_RECT = RESERVOIR;
