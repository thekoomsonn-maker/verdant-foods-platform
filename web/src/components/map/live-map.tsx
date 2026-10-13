"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import MapGL, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "../icon";
import { cx } from "../ui";

export type PinKind = "farm" | "handover" | "van" | "problem" | "buyer" | "home";
export type Pin = { id: string; lat: number; lng: number; label?: string; kind: PinKind; icon?: IconName; sub?: string };
export type Plot = { id: string; name?: string; coords: [number, number][]; color?: string };
export type RouteLine = { id: string; coords: [number, number][]; color?: string; dashed?: boolean };
export type Van = { id: string; label?: string; route: [number, number][]; speed?: number; offset?: number; loop?: boolean };

const KIND: Record<PinKind, { bg: string; fg: string; icon: IconName }> = {
  farm: { bg: "bg-lime", fg: "text-night", icon: "sprout" },
  handover: { bg: "bg-white", fg: "text-deep", icon: "scale" },
  van: { bg: "bg-orange", fg: "text-white", icon: "truck" },
  problem: { bg: "bg-tomato", fg: "text-white", icon: "triangle-alert" },
  buyer: { bg: "bg-orange", fg: "text-white", icon: "building-2" },
  home: { bg: "bg-orange", fg: "text-white", icon: "house" },
};

const SAT = {
  version: 8 as const,
  sources: { sat: { type: "raster" as const, tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, attribution: "Esri, Maxar, Earthstar Geographics", maxzoom: 18 } },
  layers: [{ id: "sat", type: "raster" as const, source: "sat", paint: { "raster-saturation": -0.15, "raster-contrast": 0.05 } }],
};
const LIGHT = {
  version: 8 as const,
  sources: { carto: { type: "raster" as const, tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png", "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"], tileSize: 256, attribution: "© OpenStreetMap contributors © CARTO" } },
  layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
};

function along(route: [number, number][], t: number): [number, number] {
  if (route.length < 2) return route[0];
  const segs: number[] = []; let total = 0;
  for (let i = 1; i < route.length; i++) { const d = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); segs.push(d); total += d; }
  let k = (t % 1) * total;
  for (let i = 0; i < segs.length; i++) { if (k <= segs[i]) { const f = k / segs[i]; return [route[i][0] + (route[i + 1][0] - route[i][0]) * f, route[i][1] + (route[i + 1][1] - route[i][1]) * f]; } k -= segs[i]; }
  return route[route.length - 1];
}

export type LiveMapProps = {
  className?: string; styleName?: "satellite" | "light";
  focus: { lat: number; lng: number; zoom: number }; intro?: boolean;
  plots?: Plot[]; routes?: RouteLine[]; pins?: Pin[]; vans?: Van[];
  live?: string; legend?: [string, string][]; controls?: boolean; layers?: string[];
  active?: string; onPin?: (id: string) => void; rounded?: string; interactive?: boolean; labels?: "hover" | "always";
};

export default function LiveMap({ className, styleName = "satellite", focus, intro = true, plots = [], routes = [], pins = [], vans = [], live, legend, controls = true, layers, active, onPin, rounded = "rounded-3xl", interactive = true, labels = "hover" }: LiveMapProps) {
  const ref = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries((layers ?? []).map((l) => [l, true])));
  const [vanPos, setVanPos] = useState<Record<string, [number, number]>>({});
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const plotsGeo = useMemo(() => ({ type: "FeatureCollection" as const, features: plots.map((p) => ({ type: "Feature" as const, properties: { id: p.id, color: p.color ?? "#BBEA70" }, geometry: { type: "Polygon" as const, coordinates: [p.coords] } })) }), [plots]);
  const routeGeo = useMemo(() => ({ type: "FeatureCollection" as const, features: routes.map((r) => ({ type: "Feature" as const, properties: { id: r.id, color: r.color ?? "#FFFFFF" }, geometry: { type: "LineString" as const, coordinates: r.coords } })) }), [routes]);

  // Intro: start over Ghana, fly to the area that matters.
  useEffect(() => {
    if (!loaded) return;
    const m = ref.current; if (!m) return;
    m.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom, duration: intro && !reduce ? 2200 : 0, curve: 1.4, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, focus.lat, focus.lng, focus.zoom]);

  // Fly to active pin.
  useEffect(() => {
    if (!loaded || !active) return;
    const p = pins.find((x) => x.id === active);
    if (p) ref.current?.flyTo({ center: [p.lng, p.lat], zoom: Math.max(focus.zoom, 9), duration: reduce ? 0 : 1100, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, loaded]);

  // Plots fade in, route dashes flow.
  useEffect(() => {
    if (!loaded) return;
    const map = ref.current?.getMap(); if (!map) return;
    if (reduce) return;
    const seq = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
    let step = -1, id = 0, last = 0;
    const tick = (ts: number) => {
      if (ts - last > 60) { last = ts; const s = Math.floor(ts / 60) % seq.length; if (s !== step && map.getLayer("routes")) { map.setPaintProperty("routes", "line-dasharray", seq[s]); step = s; } }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [loaded, reduce]);

  // Vans move along their routes.
  const vanKey = vans.map((v) => v.id + v.route.length).join("|");
  useEffect(() => {
    if (!vans.length) return;
    let id = 0, last = 0; const t0 = performance.now();
    const tick = (ts: number) => {
      if (ts - last > 33) { last = ts; const out: Record<string, [number, number]> = {}; for (const v of vans) { const t = reduce ? (v.offset ?? 0.4) : (v.offset ?? 0) + ((ts - t0) / 1000) * (v.speed ?? 0.02); out[v.id] = along(v.route, v.loop === false ? Math.min(t, 0.9999) : t); } setVanPos(out); }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vanKey, reduce]);

  const visible = (k: PinKind) => !layers || on[k === "farm" ? "Farms" : k === "handover" ? "Collection points" : k === "van" ? "Vans" : k === "problem" ? "Problems" : "Buyers"] !== false;

  return (
    <div className={cx("relative isolate overflow-hidden bg-night", rounded, className)}>
      <MapGL
        ref={ref}
        mapLib={maplibregl}
        initialViewState={intro ? { longitude: -1.02, latitude: 7.9, zoom: 5.4 } : { longitude: focus.lng, latitude: focus.lat, zoom: focus.zoom }}
        mapStyle={styleName === "satellite" ? SAT : LIGHT}
        onLoad={() => setLoaded(true)}
        attributionControl={{ compact: true }}
        scrollZoom={false}
        dragRotate={false}
        interactive={interactive}
        style={{ position: "absolute", inset: 0 }}
      >
        {plots.length > 0 && (!layers || on["Plots"] !== false) && (
          <Source id="plots" type="geojson" data={plotsGeo}>
            <Layer id="plots-fill" type="fill" paint={{ "fill-color": ["get", "color"], "fill-opacity": loaded ? 0.24 : 0, ...({ "fill-opacity-transition": { duration: 900, delay: 400 } } as object) }} />
            <Layer id="plots-line" type="line" paint={{ "line-color": ["get", "color"], "line-width": 2.5, "line-opacity": loaded ? 1 : 0, ...({ "line-opacity-transition": { duration: 600, delay: 200 } } as object) }} />
          </Source>
        )}
        {routes.length > 0 && (
          <Source id="routes" type="geojson" data={routeGeo}>
            <Layer id="routes-glow" type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": ["get", "color"], "line-width": 7, "line-opacity": 0.18, "line-blur": 2 }} />
            <Layer id="routes" type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": ["get", "color"], "line-width": 2.5, "line-dasharray": [0, 4, 3] }} />
          </Source>
        )}
        {pins.filter((p) => visible(p.kind)).map((p, i) => {
          const k = KIND[p.kind]; const isOn = active === p.id || hover === p.id;
          return (
            <Marker key={p.id} longitude={p.lng} latitude={p.lat} anchor="center" style={{ zIndex: isOn ? 5 : 1 }}>
              <motion.button
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: isOn ? 1.12 : 1, opacity: 1 }} transition={{ delay: loaded ? 0.6 + i * 0.06 : 0, type: "spring", stiffness: 400, damping: 22 }}
                onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)}
                onClick={() => onPin?.(p.id)} aria-label={p.label ?? p.kind}
                className="relative flex items-center gap-2"
              >
                {p.kind === "problem" && <span className="absolute left-0 top-0 h-9 w-9 animate-pulse-ring rounded-full bg-tomato" />}
                <span className={cx("relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_6px_18px_rgb(0_0_0/.35)] ring-[3px] ring-white", k.bg, k.fg)}><Icon name={p.icon ?? k.icon} size={17} /></span>
                <AnimatePresence>
                  {p.label && (isOn || !onPin || labels === "always") && (
                    <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="pointer-events-none whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-left text-[13px] font-semibold text-ink shadow-[var(--shadow-1)]">
                      {p.label}{p.sub && <span className="ml-1.5 font-normal text-muted">{p.sub}</span>}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Marker>
          );
        })}
        {(!layers || on["Vans"] !== false) && vans.map((v) => vanPos[v.id] && (
          <Marker key={v.id} longitude={vanPos[v.id][0]} latitude={vanPos[v.id][1]} anchor="center" style={{ zIndex: 4 }}>
            <span className="flex items-center gap-2">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-orange text-white shadow-[0_6px_18px_rgb(0_0_0/.35)] ring-[3px] ring-white"><Icon name="truck" size={17} /></span>
              {v.label && <span className="whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-ink">{v.label}</span>}
            </span>
          </Marker>
        ))}
      </MapGL>

      {live && (
        <span className="glass-dark absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-white md:left-4 md:top-4">
          <span className="h-2 w-2 animate-breathe rounded-full bg-lime" />{live}
        </span>
      )}
      {controls && (
        <div className="glass-dark absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-2xl md:right-4 md:top-4">
          {([["plus", () => ref.current?.zoomIn()], ["minus", () => ref.current?.zoomOut()], ["locate-fixed", () => ref.current?.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom, duration: 1000 })]] as const).map(([i, f]) => (
            <button key={i} onClick={f} aria-label={i} className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-white/15"><Icon name={i} size={18} /></button>
          ))}
        </div>
      )}
      {layers && (
        <div className="no-scrollbar absolute inset-x-3 bottom-14 z-10 flex gap-2 overflow-x-auto md:inset-x-4">
          {layers.map((l) => (
            <button key={l} onClick={() => setOn((o) => ({ ...o, [l]: !o[l] }))} className={cx("shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", on[l] ? "bg-white text-deep" : "glass-dark text-white/80")}>{l}</button>
          ))}
        </div>
      )}
      {legend && (
        <div className="glass-dark absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full px-3.5 py-2 text-[12px] text-white md:bottom-4 md:left-4">
          {legend.map(([c, l]) => <span key={l} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</span>)}
        </div>
      )}
      {!loaded && <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,#01261f_25%,#0b5b49_50%,#01261f_75%)] bg-[length:200%_100%]" />}
    </div>
  );
}
