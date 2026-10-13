"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BOUNDS, FIELDS, HOTSPOTS, RESERVOIR, SOLAR, START, clamp, fieldAt, floorAt, heightAt, type HotspotId } from "./world";
import type { Game } from "./store";

const INTRO_S = 7.5;
const SWEEP_S = 7.5;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export function startPose() {
  const y = heightAt(START.x, START.z) + START.alt;
  return new THREE.Vector3(START.x, y, START.z);
}

function chaseOffset(yaw: number, pitch: number, dist: number, out: THREE.Vector3) {
  return out.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
}

export function Rig({ game, drone }: { game: Game; drone: RefObject<THREE.Group | null> }) {
  const camera = useThree((s) => s.camera);
  const pos = useMemo(startPose, []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const att = useRef({ yaw: 0, pitch: 0, roll: 0, yawRate: 0 });
  const camPos = useMemo(() => startPose().add(chaseOffset(0, 0.34, 12.5, new THREE.Vector3())), []);
  const look = useMemo(() => startPose(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);
  const emitT = useRef(0);
  const sweep = useRef({ a0: 0 });
  const lastPhase = useRef(game.phase);
  const resetSeen = useRef(game.resetToken);

  const intro = useMemo(() => {
    const end = startPose().add(chaseOffset(0, 0.34, 12.5, new THREE.Vector3()));
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-340, 175, 430), new THREE.Vector3(-190, 115, 290), new THREE.Vector3(-80, 58, 175),
      new THREE.Vector3(-22, 26, 104), end,
    ], false, "centripetal");
  }, []);

  // Picking: screen point -> hotspot or field.
  useEffect(() => {
    const rc = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const orb = new THREE.Vector3();
    game.pick = (nx, ny) => {
      ndc.set(nx, ny);
      rc.setFromCamera(ndc, camera);
      const ray = rc.ray;
      let best: HotspotId | null = null, bestD = Infinity;
      for (const h of HOTSPOTS) {
        const gy = heightAt(h.x, h.z);
        for (const f of [1, 0.6, 0.25]) {
          orb.set(h.x, gy + h.y * f, h.z);
          const d = ray.distanceSqToPoint(orb);
          const r = f === 1 ? 2.6 : 1.4;
          if (d < r * r) { const t = ray.origin.distanceTo(orb); if (t < bestD) { bestD = t; best = h.id; } }
        }
      }
      // March the ray against the height field.
      let t = 0.5, field = -1, hitT = Infinity;
      const p = new THREE.Vector3();
      while (t < 1400) {
        ray.at(t, p);
        if (p.y < heightAt(p.x, p.z)) {
          let a = t - Math.max(0.4, t * 0.012), b = t;
          for (let i = 0; i < 12; i++) { const m = (a + b) / 2; ray.at(m, p); if (p.y < heightAt(p.x, p.z)) b = m; else a = m; }
          ray.at(b, p);
          hitT = b;
          field = fieldAt(p.x, p.z, 0.5);
          break;
        }
        t += Math.max(0.4, t * 0.012);
      }
      if (best && bestD < hitT + 2) return { field: -1, hotspot: best };
      return { field, hotspot: null };
    };
    return () => { game.pick = null; };
  }, [camera, game]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, game.maxDt);
    const d = drone.current;
    if (!d) return;
    const t = state.clock.elapsedTime;
    game.phaseTime += dt;

    if (resetSeen.current !== game.resetToken) {
      resetSeen.current = game.resetToken;
      pos.copy(startPose()); vel.set(0, 0, 0); att.current.yaw = 0; game.target = null;
    }

    if (lastPhase.current !== game.phase) {
      if (game.phase === "celebrate") sweep.current.a0 = Math.atan2(camera.position.x, camera.position.z);
      if (lastPhase.current === "intro") { camPos.copy(camera.position); }
      lastPhase.current = game.phase;
    }

    const flying = game.phase === "flying";
    /* ---------- input ---------- */
    const k = game.input.keys;
    let ix = game.input.x, iy = game.input.y, iz = game.input.z;
    if (k.has("KeyW") || k.has("ArrowUp")) iy += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) iy -= 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) ix -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) ix += 1;
    if (k.has("KeyE") || k.has("Space")) iz += 1;
    if (k.has("KeyQ") || k.has("ShiftLeft") || k.has("ShiftRight")) iz -= 1;
    ix = clamp(ix, -1, 1); iy = clamp(iy, -1, 1); iz = clamp(iz, -1, 1);
    if (!flying) { ix = iy = iz = 0; }
    if ((ix || iy || iz) && game.target) { game.target = null; game.autopilot = false; }
    const wantSpray = flying && (game.input.spray || k.has("KeyF")) && game.tank > 0;

    /* ---------- flight ---------- */
    const ground = heightAt(pos.x, pos.z);
    const maxH = game.battery > 0 ? 15 : 6;
    let dvx = 0, dvz = 0, dvy = 0;
    if (flying && game.target) {
      const dx = game.target.x - pos.x, dz = game.target.z - pos.z;
      const dist = Math.hypot(dx, dz);
      const sp = Math.min(maxH * 1.2, dist * 1.1);
      dvx = (dx / (dist || 1)) * sp; dvz = (dz / (dist || 1)) * sp;
      const tAlt = Math.max(floorAt(pos.x, pos.z) + 1, ground + 8);
      dvy = clamp((tAlt - pos.y) * 1.4, -6, 6);
      if (dist < 1.2) { game.target = null; game.autopilot = false; }
    } else if (flying) {
      const cy = game.cam.yaw;
      const fx = -Math.sin(cy), fz = -Math.cos(cy), rx = Math.cos(cy), rz = -Math.sin(cy);
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix;
      const ml = Math.hypot(mx, mz);
      if (ml > 1) { mx /= ml; mz /= ml; }
      dvx = mx * maxH; dvz = mz * maxH;
      dvy = iz * 7;
    }
    vel.x += (dvx - vel.x) * damp(2.4, dt);
    vel.z += (dvz - vel.z) * damp(2.4, dt);
    vel.y += (dvy - vel.y) * damp(4, dt);
    // Soft boundary: an elastic push back towards the farm.
    const e = Math.hypot(pos.x / BOUNDS.rx, pos.z / BOUNDS.rz);
    if (e > 1) {
      const push = (e - 1) * 60;
      vel.x -= (pos.x / BOUNDS.rx / e) * push * dt * 2;
      vel.z -= (pos.z / BOUNDS.rz / e) * push * dt * 2;
    }
    pos.addScaledVector(vel, dt);
    if (e > 1.2) { pos.x /= e / 1.2; pos.z /= e / 1.2; }
    const floor = floorAt(pos.x, pos.z);
    if (pos.y < floor) { pos.y += (floor - pos.y) * damp(14, dt); if (vel.y < 0) vel.y = 0; }
    const ceil = heightAt(pos.x, pos.z) + 42;
    if (pos.y > ceil) { pos.y = ceil; if (vel.y > 0) vel.y = 0; }

    // Attitude: face the direction of travel, bank into turns, nose down when moving.
    const a = att.current;
    const hs = Math.hypot(vel.x, vel.z);
    if (hs > 0.9) {
      const ty = Math.atan2(-vel.x, -vel.z);
      const dy = angleDelta(a.yaw, ty) * damp(3, dt);
      a.yaw += dy;
      a.yawRate += (dy / dt - a.yawRate) * damp(6, dt);
    } else a.yawRate *= 1 - damp(4, dt);
    const fwdS = -Math.sin(a.yaw) * vel.x - Math.cos(a.yaw) * vel.z;
    const sideS = Math.cos(a.yaw) * vel.x - Math.sin(a.yaw) * vel.z;
    a.pitch += (-fwdS / 15 * 0.3 - a.pitch) * damp(5, dt);
    a.roll += (clamp(-sideS / 15 * 0.3 - a.yawRate * 0.18, -0.45, 0.45) - a.roll) * damp(5, dt);
    const bob = Math.sin(t * 2.1) * 0.08 + Math.sin(t * 3.3) * 0.03;
    d.position.set(pos.x, pos.y + bob, pos.z);
    d.rotation.set(a.pitch + Math.sin(t * 1.7) * 0.012, a.yaw, a.roll + Math.sin(t * 1.3) * 0.015, "YXZ");
    game.pos.x = pos.x; game.pos.y = pos.y; game.pos.z = pos.z;
    game.vel.x = vel.x; game.vel.y = vel.y; game.vel.z = vel.z;

    /* ---------- gameplay ---------- */
    const agl = pos.y - ground;
    const active = flying || game.phase === "celebrate";
    game.field = agl < 32 ? fieldAt(pos.x, pos.z, 1) : -1;
    game.spraying = wantSpray;
    if (active) {
      game.refilling = Math.abs(pos.x - RESERVOIR.cx) < RESERVOIR.hw + 3 && Math.abs(pos.z - RESERVOIR.cz) < RESERVOIR.hd + 3 && agl < 14;
      game.charging = Math.hypot(pos.x - SOLAR.cx, pos.z - SOLAR.cz) < 13 && agl < 16;
      if (game.refilling) game.tank = Math.min(100, game.tank + dt * 30);
      if (game.charging) game.battery = Math.min(100, game.battery + dt * 16);
      else if (flying) game.battery = Math.max(0, game.battery - dt * (0.3 + (wantSpray ? 0.25 : 0) + hs * 0.012));
      if (wantSpray) {
        game.tank = Math.max(0, game.tank - dt * 5.5);
        const f = game.field;
        if (f >= 0 && agl < 17 && game.moisture[f] < 1) {
          const eff = agl < 9 ? 1 : 1 - ((agl - 9) / 8) * 0.7;
          game.moisture[f] = Math.min(1, game.moisture[f] + dt * 0.24 * eff);
          if (game.moisture[f] >= 1) {
            game.watered = game.moisture.filter((m) => m >= 1).length;
            game.justWatered = f;
            game.burst.n++; game.burst.field = f;
            if (game.watered === FIELDS.length && !game.complete) {
              game.complete = true;
              game.spraying = false;
              game.setPhase("celebrate");
            }
            game.emit();
          }
        }
      }
    }
    for (let i = 0; i < FIELDS.length; i++) game.visual[i] += (game.moisture[i] - game.visual[i]) * damp(1.6, dt);

    // Hotspot proximity.
    let near: HotspotId | null = null;
    for (const h of HOTSPOTS) if (Math.hypot(pos.x - h.x, pos.z - h.z) < 14 && agl < 34) near = h.id;
    if (!near && game.dismissed) game.dismissed = null;
    const hot = game.pinned ?? (flying && near !== game.dismissed ? near : null);
    if (hot !== game.hotspot) { game.hotspot = hot; game.emit(); }

    /* ---------- camera ---------- */
    const c = game.cam;
    // Portrait screens: wider lens and a little more distance so the drone and the field both fit.
    const portrait = state.size.width < state.size.height * 0.85;
    const pc = camera as THREE.PerspectiveCamera;
    const fov = portrait ? 62 : 50;
    if (pc.fov !== fov) { pc.fov = fov; pc.updateProjectionMatrix(); }
    const distK = portrait ? 1.3 : 1;
    if (game.phase === "intro") {
      const u = clamp(game.phaseTime / INTRO_S, 0, 1);
      const s = easeInOut(u);
      intro.getPointAt(s, camPos);
      camPos.y = Math.max(camPos.y, heightAt(camPos.x, camPos.z) + 12 * (1 - s) + 2);
      tmp.set(0, 4, -10).lerp(tmp2.set(pos.x, pos.y + 0.6, pos.z), easeInOut(clamp((u - 0.35) / 0.65, 0, 1)));
      look.copy(tmp);
      camera.position.copy(camPos);
      camera.lookAt(look);
      if (u >= 1) game.setPhase("ready");
    } else if (game.phase === "celebrate" && game.phaseTime < SWEEP_S) {
      const u = easeInOut(clamp(game.phaseTime / SWEEP_S, 0, 1));
      const ang = sweep.current.a0 + u * Math.PI * 1.1;
      const rad = 105 - Math.sin(u * Math.PI) * 25;
      tmp.set(Math.sin(ang) * rad, 48 + Math.sin(u * Math.PI) * 14, Math.cos(ang) * rad + 4);
      camPos.lerp(tmp, damp(2.2, dt));
      look.lerp(tmp2.set(0, 2, 4), damp(2.5, dt));
      camera.position.copy(camPos);
      camera.lookAt(look);
    } else {
      if (game.phase === "celebrate") game.setPhase("flying");
      if ((game.phase === "ready" || game.phase === "paused") && !game.reduceMotion) c.yaw += dt * 0.07;
      chaseOffset(c.yaw, c.pitch, c.dist * distK, tmp).add(pos);
      tmp.y += 1.2;
      const cg = heightAt(tmp.x, tmp.z) + 1.5;
      if (tmp.y < cg) tmp.y = cg;
      camPos.lerp(tmp, damp(game.phase === "flying" ? 5 : 2.5, dt));
      look.lerp(tmp2.set(pos.x, pos.y + 1.4, pos.z), damp(8, dt));
      camera.position.copy(camPos);
      camera.lookAt(look);
    }

    emitT.current += dt;
    if (emitT.current > 0.1) { emitT.current = 0; game.emit(); }
  });

  return null;
}
