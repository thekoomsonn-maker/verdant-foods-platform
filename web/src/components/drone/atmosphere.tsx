"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Game } from "./store";

/** Golden-hour sun, low in the west: side light with long shadows reaching east across the fields. */
export const SUN_DIR = new THREE.Vector3(-0.86, 0.3, 0.32).normalize();
export const HAZE = "#dcd8bd";

const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

const skyFrag = /* glsl */ `
varying vec3 vDir; uniform vec3 uSun; uniform vec3 uHaze;
vec3 toLin(vec3 c){ return pow(c, vec3(2.2)); }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 zen = toLin(vec3(0.29, 0.52, 0.79));
  vec3 mid = toLin(vec3(0.58, 0.74, 0.87));
  vec3 hor = uHaze;
  float sd = max(dot(d, uSun), 0.);
  // warm the horizon on the sun side
  vec3 horW = mix(hor, toLin(vec3(1.0, 0.80, 0.55)), pow(sd, 3.) * 0.8);
  vec3 col = mix(horW, mid, smoothstep(0.02, 0.22, h));
  col = mix(col, zen, smoothstep(0.18, 0.75, h));
  col += toLin(vec3(1.0, 0.70, 0.40)) * pow(sd, 6.) * 0.55;
  col += toLin(vec3(1.0, 0.86, 0.62)) * pow(sd, 90.) * 1.2;
  col += vec3(1.0, 0.92, 0.8) * smoothstep(0.99955, 0.99975, sd) * 6.;
  col = mix(col, hor, smoothstep(0.03, -0.12, h));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function Sky({ follow = true }: { follow?: boolean }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: SUN_DIR.clone() }, uHaze: { value: new THREE.Color(HAZE) } },
    vertexShader: skyVert, fragmentShader: skyFrag,
  }), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => { if (follow) ref.current?.position.copy(camera.position); });
  return (
    <mesh ref={ref} material={mat} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[1800, 32, 16]} />
    </mesh>
  );
}

/** Sun with a tight shadow frustum that follows the drone. */
export function Lights({ game, shadows, mapSize }: { game: Game; shadows: boolean; mapSize: number }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const l = light.current!;
    scene.add(l.target);
    return () => { scene.remove(l.target); };
  }, [scene]);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    // Centre the shadow box between the drone and the camera's view.
    const wide = game.phase === "intro" || game.phase === "celebrate";
    const fx = wide ? 0 : game.pos.x, fz = wide ? 6 : game.pos.z, fy = wide ? 2 : game.pos.y - 4;
    l.target.position.set(fx, fy, fz);
    l.position.set(fx + SUN_DIR.x * 150, fy + SUN_DIR.y * 150, fz + SUN_DIR.z * 150);
    const ext = wide ? 120 : 34;
    const cam = l.shadow.camera;
    if (cam.right !== ext) {
      cam.left = -ext; cam.right = ext; cam.top = ext; cam.bottom = -ext;
      cam.updateProjectionMatrix();
    }
  });
  return (
    <>
      <directionalLight
        ref={light}
        color="#ffd29a"
        intensity={3.6}
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-camera-near={10}
        shadow-camera-far={400}
      />
      <hemisphereLight args={["#d6e8f2", "#6f6a38", 0.55]} />
    </>
  );
}
