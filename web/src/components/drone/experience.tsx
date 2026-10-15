"use client";
/* The lazily loaded 3D bundle: canvas, scene, input and HUD. Imported only through next/dynamic from ./index. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { cx } from "@/components/tokens";
import { FarmScene, type Quality } from "./scene";
import { createGame, useGame } from "./store";
import { BackLink, FlightHud, StartOverlay } from "./hud";
import { FIELDS, HOTSPOTS, clamp } from "./world";

const FLIGHT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "KeyF", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"]);

export default function DroneExperience({ mode, backHref }: { mode: "section" | "full"; backHref?: string }) {
  const game = useMemo(createGame, []);
  const snap = useGame(game);
  const wrap = useRef<HTMLDivElement>(null);
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const reduce = useReducedMotion();
  const [tier, setTier] = useState<"high" | "low">("high");
  const [inView, setInView] = useState(true);
  const [docHidden, setDocHidden] = useState(false);
  const [shown, setShown] = useState(false);

  const q: Quality = useMemo(() => ({
    shadows: tier === "high",
    mapSize: touch ? 1024 : 2048,
    density: touch ? 0.45 : 1,
    segs: touch ? 200 : 320,
    particles: touch ? 600 : 1100,
  }), [tier, touch]);
  const dpr: [number, number] = tier === "high" ? [1, touch ? 1.5 : 1.75] : [1, 1.2];

  useEffect(() => {
    game.reduceMotion = !!reduce;
    if (reduce && game.phase === "intro") game.setPhase("ready");
  }, [reduce, game]);

  useEffect(() => {
    const el = wrap.current!;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    const vis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);

  const release = useCallback(() => {
    game.input.keys.clear();
    game.input.spray = false; game.input.x = 0; game.input.y = 0; game.input.z = 0;
    game.target = null; game.autopilot = false; game.pinned = null;
  }, [game]);

  const pause = useCallback(() => {
    release();
    if (game.phase === "flying" || game.phase === "celebrate") game.setPhase("paused");
  }, [game, release]);

  const take = useCallback(() => {
    release();
    game.setPhase("flying");
    if (mode === "section") wrap.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    wrap.current?.focus({ preventScroll: true });
  }, [game, mode, reduce, release]);

  // Leaving the view or the tab releases control.
  useEffect(() => { if (!inView || docHidden) pause(); }, [inView, docHidden, pause]);

  const controlling = snap.phase === "flying" || snap.phase === "celebrate";

  // Keyboard: only while the visitor has taken control.
  useEffect(() => {
    if (!controlling) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); pause(); return; }
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (FLIGHT_KEYS.has(e.code)) {
        // Let Space/Enter press a focused HUD button instead of climbing.
        if (e.code === "Space" && t && t.tagName === "BUTTON") return;
        e.preventDefault();
        game.input.keys.add(e.code);
      }
      const m = /^Digit([1-8])$/.exec(e.code);
      if (m && game.phase === "flying") {
        const f = FIELDS[Number(m[1]) - 1];
        game.target = { x: f.cx, z: f.cz }; game.autopilot = true; game.emit();
      }
    };
    const up = (e: KeyboardEvent) => { game.input.keys.delete(e.code); };
    const blur = () => { game.input.keys.clear(); game.input.spray = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [controlling, game, pause]);

  // Wheel zoom (only while flying; never hijacks page scroll otherwise).
  useEffect(() => {
    const el = wrap.current!;
    const onWheel = (e: WheelEvent) => {
      if (!(game.phase === "flying" || game.phase === "celebrate")) return;
      e.preventDefault();
      e.stopPropagation(); // keep smooth-scroll libraries from scrolling the page underneath
      game.cam.dist = clamp(game.cam.dist * Math.exp(e.deltaY * 0.0012), 7, 34);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [game]);

  // Drag to orbit, pinch to zoom, tap to fly to a field or open a place.
  const ptrs = useRef(new Map<number, { x: number; y: number; sx: number; sy: number; t: number }>());
  const pinch = useRef(0);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!controlling) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = ptrs.current.get(e.pointerId);
    if (!p || !controlling) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (ptrs.current.size === 1) {
      game.cam.yaw -= dx * 0.0065;
      game.cam.pitch = clamp(game.cam.pitch + dy * 0.0045, 0.06, 1.25);
    } else if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current > 0) game.cam.dist = clamp(game.cam.dist * (pinch.current / d), 7, 34);
      pinch.current = d;
    }
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = ptrs.current.get(e.pointerId);
    ptrs.current.delete(e.pointerId);
    if (!p || game.phase !== "flying" || ptrs.current.size > 0) return;
    const moved = Math.hypot(e.clientX - p.sx, e.clientY - p.sy);
    if (moved > 8 || performance.now() - p.t > 450 || !game.pick) return;
    const r = e.currentTarget.getBoundingClientRect();
    const hit = game.pick(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (hit.hotspot) {
      const h = HOTSPOTS.find((x) => x.id === hit.hotspot)!;
      game.pinned = h.id; game.dismissed = null;
      game.target = { x: h.x + 2, z: h.z + 12 }; game.autopilot = true;
      game.emit();
    } else if (hit.field >= 0) {
      const f = FIELDS[hit.field];
      game.target = { x: f.cx, z: f.cz }; game.autopilot = true; game.pinned = null;
      game.emit();
    }
  };

  const active = inView && !docHidden;

  return (
    <div
      ref={wrap}
      tabIndex={-1}
      data-lenis-prevent={controlling ? "" : undefined}
      className={cx("isolate overflow-hidden bg-night outline-none", mode === "full" ? "fixed inset-0 h-[100svh] w-full" : "absolute inset-0 h-full w-full")}
      aria-label="Fly over the Verdant farm: an interactive 3D scene"
      role="region"
    >
      <div
        className={cx("absolute inset-0 transition-opacity duration-700", shown ? "opacity-100" : "opacity-0", controlling ? "cursor-grab active:cursor-grabbing" : "")}
        style={{ touchAction: controlling ? "none" : "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={(e) => ptrs.current.delete(e.pointerId)}
      >
        <Canvas
          shadows
          dpr={dpr}
          frameloop={active ? "always" : "demand"}
          camera={{ fov: 50, near: 0.3, far: 2600, position: [-340, 175, 430] }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.12;
            requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
          }}
          style={{ pointerEvents: controlling ? "auto" : "none" }}
        >
          <PerformanceMonitor flipflops={3} onDecline={() => setTier("low")} onIncline={() => setTier("high")} onFallback={() => setTier("low")} />
          <FarmScene game={game} q={q} />
        </Canvas>
      </div>

      {/* Soft cinematic vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(1_38_31/0.28)_100%)]" />
      <StartOverlay game={game} mode={mode} onTake={take} />
      {mode === "full" && backHref && !controlling && (
        <div className="absolute left-3 top-3 z-10 md:left-5 md:top-5"><BackLink href={backHref} /></div>
      )}
      <FlightHud game={game} touch={touch} onExit={pause} belowNav={mode === "section"} back={mode === "full" && backHref ? <BackLink href={backHref} /> : undefined} />
    </div>
  );
}
