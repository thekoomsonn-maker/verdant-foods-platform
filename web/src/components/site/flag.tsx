import type { FlagKind } from "@/lib/langs";
import { cx } from "../tokens";

/** Small rounded flags drawn inline (no image requests). 3:2, defaults to 20 x 14. */
export function Flag({ kind, className }: { kind: FlagKind; className?: string }) {
  return (
    <span className={cx("inline-block h-[14px] w-[20px] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgb(1_38_31/0.12)]", className)} aria-hidden>
      {kind === "gb" && (
        <svg viewBox="0 0 60 40" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
          <clipPath id="vf-gb"><path d="M0 0h60v40H0z" /></clipPath>
          <g clipPath="url(#vf-gb)">
            <path d="M0 0h60v40H0z" fill="#012169" />
            <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
            <path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
            <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
            <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
          </g>
        </svg>
      )}
      {kind === "fr" && (
        <svg viewBox="0 0 3 2" className="block h-full w-full" preserveAspectRatio="none">
          <path d="M0 0h1v2H0z" fill="#002395" /><path d="M1 0h1v2H1z" fill="#fff" /><path d="M2 0h1v2H2z" fill="#ED2939" />
        </svg>
      )}
      {kind === "gh" && (
        <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
          <path d="M0 0h30v6.67H0z" fill="#CE1126" /><path d="M0 6.67h30v6.66H0z" fill="#FCD116" /><path d="M0 13.33h30V20H0z" fill="#006B3F" />
          <path d="M15 6.9l.85 2.6h2.74l-2.22 1.62.85 2.6L15 12.1l-2.22 1.62.85-2.6-2.22-1.62h2.74z" fill="#000" />
        </svg>
      )}
    </span>
  );
}
