"use client";
import { useEffect, useRef, useState } from "react";
import { cx } from "../tokens";

/**
 * AutoVideo — a background video that always plays (owner's request), muted and looping.
 *
 * - `base` picks `${base}-sd.mp4` under 768 px and `${base}-hd.mp4` above; or pass `src` directly.
 * - Plays on mount, on `canplay`/`loadeddata`, when the tab becomes visible again, when it re-enters the viewport,
 *   and on the first pointer / touch / key / scroll / wheel if the browser blocked autoplay (e.g. iOS Low Power Mode).
 * - Pauses only when fully off screen (battery) and resumes on re-entry.
 * - The poster stays underneath until the first frame is actually playing, then the video crossfades in.
 * - Plays regardless of reduced motion and Save-Data (explicit product decision).
 */
export function AutoVideo({ base, src, poster, className, videoClassName, posterPriority = true, fade = 900, onPlaying }: {
  base?: string; src?: string; poster?: string; className?: string; videoClassName?: string; posterPriority?: boolean; fade?: number; onPlaying?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [playing, setPlaying] = useState(false);
  const cb = useRef(onPlaying);
  cb.current = onPlaying;

  useEffect(() => {
    if (src) { setUrl(src); return; }
    if (!base) return;
    const pick = () => `${base}-${window.innerWidth < 768 ? "sd" : "hd"}.mp4`;
    setUrl(pick());
  }, [base, src]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !url) return;
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");

    let visible = true;
    let armed = false;
    const GESTURES = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"] as const;
    const disarm = () => { if (!armed) return; armed = false; GESTURES.forEach((g) => window.removeEventListener(g, kick)); };
    const arm = () => { if (armed) return; armed = true; GESTURES.forEach((g) => window.addEventListener(g, kick, { passive: true })); };
    const tryPlay = () => {
      if (!visible || document.hidden || !v.paused) return;
      v.muted = true;
      const p = v.play();
      if (p && typeof p.then === "function") p.then(disarm).catch(arm);
    };
    function kick() { disarm(); tryPlay(); }

    const onReady = () => tryPlay();
    const onPlay = () => { setPlaying(true); cb.current?.(); disarm(); };
    const onVis = () => { if (!document.hidden) tryPlay(); };
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("playing", onPlay);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onVis);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) tryPlay(); else if (!v.paused) v.pause();
    }, { threshold: 0 });
    io.observe(v);

    if (v.readyState === 0) v.load();
    tryPlay();

    return () => {
      io.disconnect(); disarm();
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("playing", onPlay);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onVis);
    };
  }, [url]);

  return (
    <div className={cx("absolute inset-0", className)}>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority={posterPriority ? "high" : "auto"} />
      )}
      {url && (
        <video
          ref={ref}
          key={url}
          className={cx("absolute inset-0 h-full w-full object-cover transition-opacity", playing ? "opacity-100" : "opacity-0", videoClassName)}
          style={{ transitionDuration: `${fade}ms` }}
          src={url}
          muted autoPlay loop playsInline preload="auto"
          disablePictureInPicture disableRemotePlayback
          controls={false} tabIndex={-1} aria-hidden
        />
      )}
    </div>
  );
}
