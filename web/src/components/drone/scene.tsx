"use client";
import { useRef } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { HAZE, Lights, Sky } from "./atmosphere";
import { Terrain, Water } from "./terrain";
import { Crops, Trees } from "./vegetation";
import { Hotspots, Structures } from "./structures";
import { DroneModel } from "./drone-model";
import { LeafConfetti, Sparkles, Spray, SprayCurtain } from "./effects";
import { Rig } from "./rig";
import type { Game } from "./store";

export type Quality = { shadows: boolean; mapSize: number; density: number; segs: number; particles: number };

export function FarmScene({ game, q }: { game: Game; q: Quality }) {
  const drone = useRef<THREE.Group>(null);
  return (
    <>
      <fogExp2 attach="fog" args={[HAZE, 0.0015]} />
      <Sky />
      <Environment frames={1} resolution={64} environmentIntensity={1}>
        <Sky follow={false} />
      </Environment>
      <Lights game={game} shadows={q.shadows} mapSize={q.mapSize} />
      <Terrain game={game} segs={q.segs} />
      <Water />
      <Crops game={game} density={q.density} shadows={q.shadows} />
      <Trees density={q.density} shadows={q.shadows} />
      <Structures />
      <Hotspots game={game} />
      <DroneModel game={game} groupRef={drone} />
      <SprayCurtain game={game} drone={drone} />
      <Spray game={game} drone={drone} count={q.particles} />
      <Sparkles game={game} count={Math.round(q.particles * 0.35)} />
      <LeafConfetti game={game} count={q.density < 1 ? 140 : 240} />
      <Rig game={game} drone={drone} />
    </>
  );
}
