"use client";
/*
 * "Fly over the Verdant farm" — public entry points.
 * This file stays tiny: three.js and the scene load only through next/dynamic when the section is near the viewport.
 *
 *   <DroneFarmSection />            full-bleed ~100svh home-page section (rounded on desktop)
 *   <DroneFarmExperience back="/" /> full-screen version used by /fly
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/tokens";

const Experience = dynamic(() => import("./experience"), { ssr: false, loading: () => <Poster loading /> });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.warn("Drone farm scene could not start:", err); }
  render() { return this.state.failed ? <Poster unsupported /> : this.props.children; }
}

/** Still image with the headline: shown before the 3D loads, and as the fallback without WebGL. */
function Poster({ loading, unsupported }: { loading?: boolean; unsupported?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/video/home-poster.jpg" alt="Green fields on the Verdant farm" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(1_38_31/0.82),rgb(1_38_31/0.25)_50%,rgb(1_38_31/0.1))]" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-8 md:px-10 md:pb-12 lg:px-14">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />Our farm near Somanya, Eastern Region
        </span>
        <h2 className="max-w-[760px] text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-white md:text-[72px] lg:text-[88px]">Fly over our farm</h2>
        {unsupported ? (
          <p className="max-w-[520px] text-[17px] leading-[1.5] text-white/80">Your browser can’t show the 3D farm, so here is a photo of it instead. Try a recent version of Chrome, Safari or Firefox to fly the drone.</p>
        ) : (
          <p className="max-w-[520px] text-[17px] leading-[1.5] text-white/80">Take our spray drone over the Akwapim hills and water all eight fields.</p>
        )}
        {loading && (
          <span className="glass inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-white" role="status">
            <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-lime" />Loading the farm…
          </span>
        )}
      </div>
    </div>
  );
}

function useNearViewport(margin = "600px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin, near]);
  return [ref, near] as const;
}

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { setOk(hasWebGL()); }, []);
  return ok;
}

/** Full-bleed home-page section (about one screen tall, rounded corners on desktop). */
export function DroneFarmSection({ id = "fly-the-farm", className }: { id?: string; className?: string }) {
  const [ref, near] = useNearViewport();
  const gl = useWebGL();
  return (
    <section id={id} aria-label="Fly over our farm" className={cx("px-0 md:px-4 lg:px-6", className)}>
      <div ref={ref} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-night md:rounded-[28px] lg:rounded-[32px]">
        {near && gl ? (
          <GLBoundary><Experience mode="section" /></GLBoundary>
        ) : (
          <Poster loading={near && gl === null} unsupported={gl === false} />
        )}
      </div>
    </section>
  );
}

/** Full-screen experience (used by the /fly page). */
export function DroneFarmExperience({ backHref = "/" }: { backHref?: string }) {
  const gl = useWebGL();
  return (
    <div className="fixed inset-0 h-[100svh] w-full bg-night">
      {gl ? (
        <GLBoundary><Experience mode="full" backHref={backHref} /></GLBoundary>
      ) : (
        <>
          <Poster loading={gl === null} unsupported={gl === false} />
          <Link href={backHref} className="glass-dark absolute left-3 top-3 inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-white md:left-5 md:top-5">
            <span aria-hidden>←</span>Verdant home
          </Link>
        </>
      )}
    </div>
  );
}
