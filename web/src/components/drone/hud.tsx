"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, BatteryMedium, ChevronDown, ChevronUp, CircleHelp, Droplets, MapPin, RotateCcw, X, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { cx } from "@/components/tokens";
import { R } from "@/lib/routes";
import { FIELDS, HOTSPOTS } from "./world";
import { useGame, type Game } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;
const panel = "glass-dark rounded-[20px] text-white shadow-[0_12px_40px_rgb(1_38_31/0.25)]";

function Gauge({ value, tone = "lime", className }: { value: number; tone?: "lime" | "sky" | "sun" | "tomato"; className?: string }) {
  const col = tone === "lime" ? "bg-lime" : tone === "sky" ? "bg-[#8fd3f0]" : tone === "sun" ? "bg-sun" : "bg-tomato";
  return (
    <div className={cx("h-2 overflow-hidden rounded-full bg-white/15", className)}>
      <div className={cx("h-full rounded-full transition-[width] duration-200", col)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---------- Intro / ready / paused overlay ---------- */
export function StartOverlay({ game, mode, onTake }: { game: Game; mode: "section" | "full"; onTake: () => void }) {
  const s = useGame(game);
  const show = s.phase === "intro" || s.phase === "ready" || s.phase === "paused";
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} transition={{ duration: 0.6, ease: EASE }}
          className="pointer-events-none absolute inset-0 flex items-end">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(1_38_31/0.78),rgb(1_38_31/0.25)_45%,transparent_70%)]" />
          <div className={cx("pointer-events-auto relative flex w-full flex-col gap-5 px-5 pb-8 md:px-10 md:pb-12 lg:px-14", mode === "full" && "pb-10")}>
            {s.phase === "paused" ? (
              <>
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-lime">Paused</span>
                <h2 className="max-w-[640px] text-[32px] font-medium leading-[1.08] tracking-[-0.025em] text-white md:text-[44px]">The drone is hovering, waiting for you.</h2>
                <div className="flex flex-wrap gap-3">
                  <Button variant="lime" arrow onClick={onTake}>Resume flying</Button>
                </div>
              </>
            ) : (
              <>
                <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime">
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />Our farm near Somanya, Eastern Region
                </motion.span>
                <h2 className="max-w-[760px] overflow-hidden text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-white md:text-[72px] lg:text-[88px]">
                  {"Fly over our farm".split(" ").map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                      <motion.span className="inline-block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: 0.55 + i * 0.06, duration: 0.8, ease: EASE }}>{w}&nbsp;</motion.span>
                    </span>
                  ))}
                </h2>
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
                  className="max-w-[520px] text-[17px] leading-[1.5] text-white/80 md:text-[19px]">
                  Take our spray drone over the Akwapim hills and water all eight fields. Watch the crops come alive.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.7, ease: EASE }} className="flex flex-wrap items-center gap-3">
                  <Button variant="lime" arrow onClick={onTake}>Take the controls</Button>
                  {s.phase === "intro" && <Button variant="glass" onClick={() => game.setPhase("ready")}>Skip intro</Button>}
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- In-flight HUD ---------- */
export function FlightHud({ game, touch, onExit, back, belowNav }: { game: Game; touch: boolean; onExit: () => void; back?: ReactNode; belowNav?: boolean }) {
  const s = useGame(game);
  const flying = s.phase === "flying" || s.phase === "celebrate";
  const field = s.field >= 0 ? FIELDS[s.field] : null;
  const [help, setHelp] = useState(!touch);
  const [toast, setToast] = useState<string | null>(null);
  const [cta, setCta] = useState(false);
  const lastW = useRef(-1);

  useEffect(() => {
    if (s.justWatered >= 0 && s.justWatered !== lastW.current) {
      lastW.current = s.justWatered;
      setToast(`${FIELDS[s.justWatered].cropLabel} watered`);
      const id = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(id);
    }
  }, [s.justWatered, s.watered]);
  useEffect(() => {
    // Let the camera sweep play first, then offer the next step.
    if (s.complete && s.phase === "celebrate") { const id = setTimeout(() => setCta(true), 4800); return () => clearTimeout(id); }
  }, [s.complete, s.phase]);
  useEffect(() => { if (!s.complete) setCta(false); }, [s.complete]);
  useEffect(() => {
    if (!flying || touch) return;
    const id = setTimeout(() => setHelp(false), 9000);
    return () => clearTimeout(id);
  }, [flying, touch]);

  const hotspot = s.hotspot ? HOTSPOTS.find((h) => h.id === s.hotspot)! : null;
  const status = s.refilling ? "Refilling the spray tank" : s.charging ? "Charging from the solar pump" : s.tank <= 0 ? "Tank empty: fly to the reservoir" : s.battery <= 15 ? "Battery low: fly to the solar pump" : null;

  const helpBtn = (
    <button onClick={() => setHelp((h) => !h)} aria-expanded={help} aria-label="How to fly"
      className="glass-dark inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[14px] font-semibold text-white hover:bg-white/10">
      <CircleHelp size={18} /><span className="hidden md:inline">How to fly</span>
    </button>
  );
  const exitBtn = (
    <button onClick={onExit} className="glass-dark inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-white hover:bg-white/10">
      <X size={18} />Exit<span className="hidden rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] md:inline">Esc</span>
    </button>
  );

  return (
    <AnimatePresence>
      {flying && (
        <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
          className={cx("pointer-events-none absolute inset-x-0 bottom-0 select-none text-white", belowNav ? "top-[72px]" : "top-0")}>
          <div aria-live="polite" className="sr-only">{toast ?? ""}</div>
          {/* Top */}
          {touch ? (
            <div className="absolute inset-x-0 top-0 flex flex-col gap-2 p-3">
              <div className="pointer-events-auto flex items-center justify-between gap-2">
                {back ?? <span />}
                <div className="flex items-center gap-2">{helpBtn}{exitBtn}</div>
              </div>
              <div className={cx(panel, "flex items-center gap-3 rounded-[18px] px-4 py-2.5")}>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-[12px] font-medium text-white/70">Watered</span>
                  <span className="tabular text-[20px] font-medium leading-none">{s.watered}<span className="text-white/50">/{FIELDS.length}</span></span>
                </div>
                <Dots moisture={s.moisture} compact />
                <div className="ml-auto flex items-center gap-2.5 text-[12px]">
                  <span className={cx("inline-flex items-center gap-1", s.battery < 20 && "text-tomato")}><BatteryMedium size={15} /><span className="tabular font-semibold">{Math.round(s.battery)}%</span></span>
                  <span className={cx("inline-flex items-center gap-1", s.tank < 20 && "text-sun")}><Droplets size={15} /><span className="tabular font-semibold">{Math.round(s.tank)}%</span></span>
                </div>
              </div>
              <FieldCard field={field} moisture={field ? s.moisture[field.id] : 0} status={status} spraying={s.spraying} autopilot={s.autopilot} compact />
            </div>
          ) : (
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
              <div className="pointer-events-auto flex flex-col gap-2.5">
                {back}
                <div className={cx(panel, "flex items-center gap-5 px-5 py-4")}>
                  <div>
                    <div className="whitespace-nowrap text-[13px] font-medium text-white/70">Fields watered</div>
                    <div className="tabular text-[30px] font-medium leading-none tracking-[-0.02em]">{s.watered}<span className="text-white/50"> / {FIELDS.length}</span></div>
                  </div>
                  <Dots moisture={s.moisture} />
                </div>
              </div>
              <FieldCard field={field} moisture={field ? s.moisture[field.id] : 0} status={status} spraying={s.spraying} autopilot={s.autopilot} />
              <div className="pointer-events-auto flex items-center gap-2">{helpBtn}{exitBtn}</div>
            </div>
          )}

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div key={toast} initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}
                className={cx("absolute left-1/2 -translate-x-1/2", touch ? "top-[190px]" : "top-[124px]")}>
                <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-[14px] font-semibold text-night shadow-[var(--shadow-2)]">
                  <Droplets size={16} />{toast}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How to fly */}
          <AnimatePresence>
            {help && (
              <motion.div key="help" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}
                className={cx(panel, "pointer-events-auto absolute right-3 top-[64px] w-[300px] p-5 md:right-5 md:top-[84px]")}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[15px] font-semibold">How to fly</span>
                  <button onClick={() => setHelp(false)} aria-label="Close how to fly" className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"><ChevronUp size={18} /></button>
                </div>
                {touch ? (
                  <ul className="flex flex-col gap-2 text-[14px] text-white/85">
                    <li>Left stick: fly around</li>
                    <li>Up and down buttons: height</li>
                    <li>Hold the drop: spray water</li>
                    <li>Drag the view to look around</li>
                    <li>Tap a field to fly there</li>
                  </ul>
                ) : (
                  <ul className="flex flex-col gap-2.5 text-[14px] text-white/85">
                    <HelpRow keys={["W", "A", "S", "D"]}>Fly</HelpRow>
                    <HelpRow keys={["E", "Q"]}>Up and down</HelpRow>
                    <HelpRow keys={["F"]}>Hold to spray</HelpRow>
                    <HelpRow keys={["1–8"]}>Fly to a field</HelpRow>
                    <li className="text-white/70">Drag to look around, scroll to zoom, click a field to fly there.</li>
                  </ul>
                )}
                <p className="mt-3 border-t border-white/10 pt-3 text-[13px] leading-[1.45] text-white/70">Refill water at the reservoir and recharge at the solar pump.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hotspot info */}
          <AnimatePresence>
            {hotspot && (
              <motion.div key={hotspot.id} initial={{ opacity: 0, x: 16, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.35, ease: EASE }}
                role="dialog" aria-label={hotspot.title}
                className={cx(panel, "pointer-events-auto absolute p-5", touch ? "inset-x-3 bottom-[200px]" : "right-5 top-1/2 w-[340px] -translate-y-1/2")}>
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime"><MapPin size={15} />On the farm</span>
                  <button onClick={() => { game.dismissed = hotspot.id; game.pinned = null; game.hotspot = null; game.emit(); }} aria-label="Close"
                    className="-mr-1.5 -mt-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"><X size={18} /></button>
                </div>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.015em]">{hotspot.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.5] text-white/80">{hotspot.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom: status + spray (desktop) */}
          {!touch && (
            <>
              <div className={cx(panel, "pointer-events-auto absolute bottom-5 left-5 flex w-[280px] flex-col gap-3 px-5 py-4")}>
                <StatusRow icon={<BatteryMedium size={18} />} label="Battery" value={s.battery} tone={s.battery < 20 ? "tomato" : "lime"} extra={s.charging ? <Zap size={14} className="text-sun" /> : null} />
                <StatusRow icon={<Droplets size={18} />} label="Water tank" value={s.tank} tone={s.tank < 20 ? "sun" : "sky"} />
              </div>
              <div className="pointer-events-auto absolute bottom-5 right-5 flex flex-col items-center gap-2">
                <SprayButton game={game} active={s.spraying} empty={s.tank <= 0} size={96} />
                <span className="text-[12px] font-medium text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">Hold <b>F</b> or press</span>
              </div>
            </>
          )}
          {touch && <TouchControls game={game} spraying={s.spraying} empty={s.tank <= 0} />}

          {/* All watered */}
          <AnimatePresence>
            {cta && (
              <motion.div key="cta" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.6, ease: EASE }}
                className={cx("pointer-events-none absolute inset-x-0 flex justify-center p-4", touch ? "inset-y-0 items-center" : "bottom-6")}>
                <div role="dialog" aria-label="All fields watered" className={cx(panel, "pointer-events-auto w-full max-w-[600px] p-6 text-center md:px-10 md:py-8")}>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-lime">All 8 fields watered</span>
                  <h3 className="mx-auto mt-3 max-w-[420px] text-[30px] font-medium leading-[1.08] tracking-[-0.025em] md:text-[40px]">The whole farm is drinking.</h3>
                  <p className="mx-auto mt-3 max-w-[400px] text-[16px] leading-[1.5] text-white/80">What grows here goes to the Verdant shop, and every crate is traced from this field to your door.</p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button href={R.shop} variant="lime" arrow className="whitespace-nowrap">Shop what this farm grows</Button>
                    <Button href={R.traceInfo} variant="glass" className="whitespace-nowrap">See how we trace it</Button>
                  </div>
                  <div className="mt-5 flex justify-center gap-5 text-[14px] font-semibold text-white/75">
                    <button onClick={() => setCta(false)} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 hover:text-white">Keep flying<ArrowUpRight size={16} /></button>
                    <button onClick={() => { setCta(false); game.reset(); }} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 hover:text-white"><RotateCcw size={15} />Start over</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Dots({ moisture, compact }: { moisture: number[]; compact?: boolean }) {
  return (
    <div className={cx("grid gap-1.5", compact ? "grid-cols-8 gap-1" : "grid-cols-4")} aria-hidden>
      {moisture.map((m, i) => (
        <span key={i} className={cx("relative overflow-hidden rounded-full bg-white/15", compact ? "h-2 w-2.5" : "h-2.5 w-6")}>
          <span className={cx("absolute inset-y-0 left-0 rounded-full", m >= 1 ? "bg-lime" : "bg-[#8fd3f0]")} style={{ width: `${m * 100}%` }} />
        </span>
      ))}
    </div>
  );
}

function HelpRow({ keys, children }: { keys: string[]; children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{children}</span>
      <span className="flex gap-1">{keys.map((k) => <kbd key={k} className="min-w-[26px] rounded-md bg-white/15 px-1.5 py-0.5 text-center font-sans text-[12px] font-semibold">{k}</kbd>)}</span>
    </li>
  );
}

function StatusRow({ icon, label, value, tone, extra }: { icon: ReactNode; label: string; value: number; tone: "lime" | "sky" | "sun" | "tomato"; extra?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="inline-flex items-center gap-2 text-white/80">{icon}{label}{extra}</span>
        <span className="tabular font-semibold">{Math.round(value)}%</span>
      </div>
      <Gauge value={value} tone={tone} />
    </div>
  );
}

function FieldCard({ field, moisture, status, spraying, autopilot, compact }: { field: (typeof FIELDS)[number] | null; moisture: number; status: string | null; spraying: boolean; autopilot: boolean; compact?: boolean }) {
  const pct = Math.round(moisture * 100);
  return (
    <div className={cx(panel, "pointer-events-none flex flex-col", compact ? "gap-1.5 rounded-[18px] px-4 py-2.5" : "w-[360px] gap-2 px-5 py-4")}>
      {field ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-white/65 md:text-[13px]">{field.name}{spraying && moisture < 1 ? " · watering" : ""}</div>
              <div className={cx("truncate font-semibold tracking-[-0.01em]", compact ? "text-[16px]" : "text-[19px]")}>{field.cropLabel}</div>
            </div>
            <div className="tabular shrink-0 text-[20px] font-medium leading-none md:text-[24px]">{pct}%</div>
          </div>
          <Gauge value={pct} tone={moisture >= 1 ? "lime" : "sky"} />
          {!compact && <div className="flex justify-between text-[11px] font-medium text-white/55"><span>Dry</span><span>Moisture</span><span>Lush</span></div>}
        </>
      ) : (
        <div className="flex items-center gap-2.5 text-[14px] text-white/85">
          <MapPin size={16} className="shrink-0 text-lime" />
          <span>{status ?? (autopilot ? "Flying to your field…" : "Fly low over a field and spray to water it")}</span>
        </div>
      )}
      {field && status && <div className="text-[12px] font-medium text-sun">{status}</div>}
    </div>
  );
}

function SprayButton({ game, active, empty, size }: { game: Game; active: boolean; empty: boolean; size: number }) {
  const set = (v: boolean) => { game.input.spray = v; };
  return (
    <button
      type="button"
      aria-label="Spray water (hold)"
      aria-pressed={active}
      onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); set(true); }}
      onPointerUp={() => set(false)} onPointerCancel={() => set(false)} onLostPointerCapture={() => set(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(true); } }}
      onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") set(false); }}
      onContextMenu={(e) => e.preventDefault()}
      style={{ width: size, height: size, touchAction: "none" }}
      className={cx("relative inline-flex items-center justify-center rounded-full transition-[transform,background-color,box-shadow] duration-150",
        empty ? "bg-white/25 text-white/60" : active ? "scale-95 bg-leaf-light text-night shadow-[0_0_0_10px_rgb(187_234_112/0.25)]" : "bg-lime text-night shadow-[0_10px_30px_rgb(1_38_31/0.35)] hover:bg-leaf-light")}
    >
      {active && <span className="absolute inset-0 animate-ping rounded-full bg-lime/40" />}
      <span className="relative flex flex-col items-center gap-0.5">
        <Droplets size={size > 90 ? 30 : 26} />
        <span className="text-[12px] font-bold">{empty ? "Empty" : "Spray"}</span>
      </span>
    </button>
  );
}

function TouchControls({ game, spraying, empty }: { game: Game; spraying: boolean; empty: boolean }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const RAD = 46;
  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > RAD) { dx = (dx / l) * RAD; dy = (dy / l) * RAD; }
    setKnob({ x: dx, y: dy });
    game.input.x = dx / RAD; game.input.y = -dy / RAD;
  };
  const end = () => { setKnob({ x: 0, y: 0 }); game.input.x = 0; game.input.y = 0; };
  const alt = (v: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); game.input.z = v; },
    onPointerUp: () => { game.input.z = 0; }, onPointerCancel: () => { game.input.z = 0; }, onLostPointerCapture: () => { game.input.z = 0; },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });
  return (
    <>
      <div
        ref={base}
        role="application"
        aria-label="Flight stick"
        className="pointer-events-auto absolute bottom-6 left-5 h-[136px] w-[136px] rounded-full glass-dark"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e); }}
        onPointerUp={end} onPointerCancel={end}
      >
        <span className="absolute inset-[22px] rounded-full border border-white/15" />
        <span className="absolute left-1/2 top-1/2 h-[58px] w-[58px] rounded-full bg-white/90 shadow-[0_6px_18px_rgb(0_0_0/0.25)]"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
      </div>
      <div className="pointer-events-auto absolute bottom-6 right-5 flex items-end gap-3">
        <div className="flex flex-col gap-2.5">
          <button type="button" aria-label="Fly up" {...alt(1)} style={{ touchAction: "none" }} className="glass-dark inline-flex h-14 w-14 items-center justify-center rounded-full text-white active:bg-white/20"><ChevronUp size={24} /></button>
          <button type="button" aria-label="Fly down" {...alt(-1)} style={{ touchAction: "none" }} className="glass-dark inline-flex h-14 w-14 items-center justify-center rounded-full text-white active:bg-white/20"><ChevronDown size={24} /></button>
        </div>
        <SprayButton game={game} active={spraying} empty={empty} size={92} />
      </div>
    </>
  );
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="glass-dark inline-flex h-10 w-fit items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-white hover:bg-white/10">
      <ArrowLeft size={17} />Verdant home
    </Link>
  );
}
