"use client";
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { radialTexture } from "./structures";
import type { Game } from "./store";

/** Nozzle positions in drone-local space (under the spray boom). */
/** The model is built at 1:1 for a small drone and scaled up to agricultural-sprayer size. */
export const DRONE_SCALE = 2;
export const NOZZLES: [number, number, number][] = [[-0.52, -0.42, 0.05], [-0.18, -0.42, 0.05], [0.18, -0.42, 0.05], [0.52, -0.42, 0.05]];

const ARM = 0.62;
const MOTORS: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([x, z]) => [x * ARM * Math.SQRT1_2, z * ARM * Math.SQRT1_2]);

export function DroneModel({ game, groupRef }: { game: Game; groupRef: RefObject<THREE.Group | null> }) {
  const rotors = useRef<(THREE.Group | null)[]>([]);
  const discs = useRef<(THREE.Mesh | null)[]>([]);
  const strobe = useRef<THREE.Sprite>(null);
  const water = useRef<THREE.Mesh>(null);
  const discTex = useMemo(() => radialTexture([[0, "rgba(30,30,30,0)"], [0.25, "rgba(30,30,30,0.12)"], [0.82, "rgba(40,40,40,0.28)"], [0.9, "rgba(230,230,230,0.35)"], [0.95, "rgba(40,40,40,0.1)"], [1, "rgba(0,0,0,0)"]]), []);
  const glow = useMemo(() => radialTexture([[0, "rgba(255,255,255,1)"], [0.2, "rgba(255,255,255,0.5)"], [1, "rgba(255,255,255,0)"]], 64), []);
  const m = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: "#f4f5f1", roughness: 0.28, metalness: 0.1 }),
    canopy: new THREE.MeshStandardMaterial({ color: "#024639", roughness: 0.22, metalness: 0.25 }),
    carbon: new THREE.MeshStandardMaterial({ color: "#1c201f", roughness: 0.45, metalness: 0.35 }),
    motor: new THREE.MeshStandardMaterial({ color: "#3a403e", roughness: 0.3, metalness: 0.85 }),
    lime: new THREE.MeshStandardMaterial({ color: "#bbea70", roughness: 0.4, emissive: "#bbea70", emissiveIntensity: 0.25 }),
    blade: new THREE.MeshStandardMaterial({ color: "#151817", roughness: 0.4, transparent: true, opacity: 0.35, depthWrite: false }),
    tank: new THREE.MeshStandardMaterial({ color: "#e9efe9", roughness: 0.2, transparent: true, opacity: 0.55 }),
    water: new THREE.MeshStandardMaterial({ color: "#5fb7d4", roughness: 0.1, emissive: "#1d6d85", emissiveIntensity: 0.3 }),
    lens: new THREE.MeshStandardMaterial({ color: "#0b0f12", roughness: 0.05, metalness: 0.9 }),
    disc: new THREE.MeshBasicMaterial({ map: discTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  }), [discTex]);

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    const spin = game.phase === "intro" ? 55 : 60;
    rotors.current.forEach((r, i) => { if (r) r.rotation.y += (i % 2 ? -1 : 1) * spin * Math.min(dt, 0.05); });
    discs.current.forEach((d) => { if (d) d.rotation.z = t * 3; });
    if (strobe.current) {
      const on = (t % 1.2) < 0.06 || ((t - 0.15) % 1.2 < 0.06 && t % 1.2 > 0.15);
      strobe.current.material.opacity = on ? 1 : 0;
    }
    if (water.current) {
      const k = Math.max(0.02, game.tank / 100);
      water.current.scale.y = k;
      water.current.position.y = -0.36 - 0.15 + 0.15 * k;
    }
  });

  return (
    <group ref={groupRef}>
      <group scale={DRONE_SCALE}>
        {/* body */}
        <mesh castShadow material={m.shell} scale={[1.25, 0.62, 1]} rotation-x={Math.PI / 2}>
          <capsuleGeometry args={[0.2, 0.42, 6, 14]} />
        </mesh>
        <mesh castShadow material={m.canopy} position={[0, 0.08, -0.04]} scale={[1, 0.55, 1.35]}>
          <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={m.lime} position={[0, 0.02, 0]}><boxGeometry args={[0.52, 0.025, 0.66]} /></mesh>
        {/* camera gimbal */}
        <mesh material={m.carbon} position={[0, -0.06, -0.38]}><sphereGeometry args={[0.07, 12, 10]} /></mesh>
        <mesh material={m.lens} position={[0, -0.06, -0.44]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.035, 0.035, 0.03, 12]} /></mesh>
        {/* arms, motors, rotors */}
        {MOTORS.map(([x, z], i) => (
          <group key={i}>
            <mesh castShadow material={m.carbon} position={[x / 2, 0.02, z / 2]} rotation={[0, Math.atan2(z, -x), Math.PI / 2]}>
              <cylinderGeometry args={[0.028, 0.034, ARM, 8]} />
            </mesh>
            <group position={[x, 0.02, z]}>
              <mesh castShadow material={m.motor} position={[0, 0.05, 0]}><cylinderGeometry args={[0.06, 0.07, 0.1, 14]} /></mesh>
              <mesh material={m.lime} position={[0, 0.02, 0]}><cylinderGeometry args={[0.072, 0.072, 0.02, 14]} /></mesh>
              <group ref={(el) => { rotors.current[i] = el; }} position={[0, 0.115, 0]}>
                {[0, Math.PI].map((r) => (
                  <mesh key={r} material={m.blade} rotation={[0.12, r, 0]} position={[Math.cos(r) * 0.17, 0, -Math.sin(r) * 0.17]}>
                    <boxGeometry args={[0.34, 0.008, 0.045]} />
                  </mesh>
                ))}
                <mesh material={m.motor}><cylinderGeometry args={[0.025, 0.025, 0.03, 8]} /></mesh>
              </group>
              <mesh ref={(el) => { discs.current[i] = el; }} position={[0, 0.118, 0]} rotation-x={-Math.PI / 2} material={m.disc}>
                <circleGeometry args={[0.36, 32]} />
              </mesh>
              {/* leg */}
              <mesh material={m.carbon} position={[0, -0.16, 0]}><cylinderGeometry args={[0.015, 0.02, 0.32, 6]} /></mesh>
            </group>
          </group>
        ))}
        {/* nav lights: red port (left), green starboard (right), white strobe at the rear */}
        {([[-1, "#ff3b30"], [1, "#4cff7a"]] as const).map(([s, c]) => (
          <group key={s} position={[MOTORS[s === 1 ? 2 : 3][0] * 1.0, -0.02, MOTORS[2][1]]}>
            <mesh><sphereGeometry args={[0.03, 8, 6]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
            <sprite scale={[0.42, 0.42, 1]}><spriteMaterial map={glow} color={c} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
          </group>
        ))}
        <sprite ref={strobe} position={[0, 0.05, 0.36]} scale={[0.55, 0.55, 1]}>
          <spriteMaterial map={glow} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
        {/* spray tank, boom and nozzles */}
        <mesh material={m.tank} position={[0, -0.36, 0.05]}><cylinderGeometry args={[0.17, 0.15, 0.32, 18]} /></mesh>
        <mesh ref={water} material={m.water} position={[0, -0.36, 0.05]}><cylinderGeometry args={[0.15, 0.135, 0.3, 18]} /></mesh>
        <mesh material={m.carbon} position={[0, -0.19, 0.05]}><cylinderGeometry args={[0.08, 0.17, 0.06, 18]} /></mesh>
        <mesh material={m.carbon} position={[0, -0.4, 0.05]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.014, 0.014, 1.14, 6]} /></mesh>
        {NOZZLES.map((p, i) => (
          <mesh key={i} material={m.lime} position={[p[0], p[1] + 0.005, p[2]]} rotation-x={Math.PI}><coneGeometry args={[0.022, 0.05, 8]} /></mesh>
        ))}
        {/* skids */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh material={m.carbon} position={[s * 0.2, -0.56, 0.02]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.014, 0.014, 0.7, 6]} /></mesh>
            {[-0.2, 0.22].map((z) => <mesh key={z} material={m.carbon} position={[s * 0.17, -0.42, z]} rotation-z={s * 0.25}><cylinderGeometry args={[0.012, 0.012, 0.3, 6]} /></mesh>)}
          </group>
        ))}
      </group>
    </group>
  );
}
