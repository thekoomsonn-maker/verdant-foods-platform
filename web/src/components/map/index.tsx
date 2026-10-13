"use client";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import { useRef } from "react";
import type { LiveMapProps } from "./live-map";
import { cx } from "../ui";

const Inner = dynamic(() => import("./live-map"), { ssr: false, loading: () => <div className="absolute inset-0 skeleton" /> });

/** Loads MapLibre only when the map is near the viewport (spec §1). */
export function LiveMap(props: LiveMapProps & { height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "300px" });
  return (
    <div ref={ref} className={cx("relative w-full", props.height ?? "h-[360px] md:h-[480px] lg:h-[560px]")}>
      {near ? <Inner {...props} className={cx("absolute inset-0", props.className)} /> : <div className={cx("absolute inset-0 bg-night", props.rounded ?? "rounded-3xl")} />}
    </div>
  );
}
export type { Pin, Plot, RouteLine, Van } from "./live-map";
