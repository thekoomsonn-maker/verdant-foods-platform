/* Game state. The frame loop mutates `game` directly; the HUD reads throttled snapshots through `useGame`. */
import { useSyncExternalStore } from "react";
import { FIELDS, type HotspotId } from "./world";

export type Phase = "intro" | "ready" | "flying" | "paused" | "celebrate";

export type Input = {
  x: number; y: number; z: number; // joystick / keys: strafe, forward, altitude (-1..1)
  spray: boolean;
  keys: Set<string>;
};

export type Snapshot = {
  phase: Phase;
  moisture: number[];
  watered: number;
  field: number;
  battery: number;
  tank: number;
  spraying: boolean;
  refilling: boolean;
  charging: boolean;
  hotspot: HotspotId | null;
  autopilot: boolean;
  complete: boolean;
  justWatered: number; // field id of the most recent completed field, -1 if none
  quality: "high" | "low";
};

function initial(): Snapshot {
  return {
    phase: "intro", moisture: FIELDS.map(() => 0), watered: 0, field: -1, battery: 100, tank: 100,
    spraying: false, refilling: false, charging: false, hotspot: null, autopilot: false, complete: false, justWatered: -1, quality: "high",
  };
}

export function createGame() {
  const listeners = new Set<() => void>();
  let snap: Snapshot = initial();
  const game = {
    ...initial(),
    /** Smoothed moisture used for visuals (lags behind `moisture`). */
    visual: FIELDS.map(() => 0),
    input: { x: 0, y: 0, z: 0, spray: false, keys: new Set<string>() } as Input,
    /** Camera orbit controlled by drag. */
    cam: { yaw: 0, pitch: 0.34, dist: 12.5 },
    /** Autopilot target (absolute x, z). */
    target: null as null | { x: number; z: number },
    /** Hotspot the user closed; it stays closed until the drone leaves it. */
    dismissed: null as HotspotId | null,
    /** Hotspot opened by a click (overrides proximity until closed). */
    pinned: null as HotspotId | null,
    /** Drone position / velocity (world), written by the rig every frame. */
    pos: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    /** Incremented when a field is finished (drives the sparkle burst). */
    burst: { n: 0, field: -1 },
    /** Set by the rig: screen point (NDC) -> what is under it. */
    pick: null as null | ((nx: number, ny: number) => { field: number; hotspot: HotspotId | null }),
    reduceMotion: false,
    /** Largest simulation step per frame (raised only by the QA hook so slow software renderers can keep up). */
    maxDt: 1 / 20,
    phaseTime: 0,
    resetToken: 0,
    emit() {
      snap = {
        phase: game.phase, moisture: game.moisture.slice(), watered: game.watered, field: game.field, battery: game.battery, tank: game.tank,
        spraying: game.spraying, refilling: game.refilling, charging: game.charging, hotspot: game.hotspot, autopilot: game.autopilot,
        complete: game.complete, justWatered: game.justWatered, quality: game.quality,
      };
      listeners.forEach((l) => l());
    },
    setPhase(p: Phase) {
      game.phase = p;
      game.phaseTime = 0;
      game.emit();
    },
    reset() {
      Object.assign(game, { moisture: FIELDS.map(() => 0), watered: 0, battery: 100, tank: 100, complete: false, justWatered: -1 });
      game.resetToken++;
      game.emit();
    },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
    getSnapshot() { return snap; },
  };
  return game;
}
export type Game = ReturnType<typeof createGame>;

export function useGame(game: Game) {
  return useSyncExternalStore(game.subscribe, game.getSnapshot, game.getSnapshot);
}
