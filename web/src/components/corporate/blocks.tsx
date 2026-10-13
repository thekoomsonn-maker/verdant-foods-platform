// Server-safe building blocks for the corporate pages. They only *render* client primitives.
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { ClipReveal, Reveal, Stagger } from "@/components/motion";
import { Eyebrow } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { SplitIn } from "@/components/corporate/client";

/** Section heading that splits into words as it enters. */
export function Title({ text, sub, light, className }: { text: string; sub?: string; light?: boolean; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-24", className)}>
      <SplitIn text={text} className={cx(T.h2, "max-w-[640px]", light ? "text-white" : "text-deep")} />
      {sub && <Reveal delay={0.15}><p className={cx(T.lead, "max-w-[460px]", light ? "text-white/75" : "text-muted")}>{sub}</p></Reveal>}
    </div>
  );
}

/** Numbered steps, 3 or 4 across. */
export function Steps({ items, dark }: { items: [string, string, string][]; dark?: boolean }) {
  return (
    <Stagger className={cx("grid gap-3 md:grid-cols-2 md:gap-4", items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {items.map(([n, t, d], i) => (
        <div key={t} className={cx("group/stp flex h-full flex-col gap-3.5 rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7", dark ? "bg-forest text-white" : "bg-paper")}>
          <div className="flex items-center justify-between">
            <span className={cx("text-[36px] font-medium tracking-[-0.03em]", dark ? "text-lime" : "text-leaf")}>{n}</span>
            {i < items.length - 1 && <Icon name="arrow-right" className={cx("hidden transition-transform duration-300 group-hover/stp:translate-x-1 lg:block", dark ? "text-white/60" : "text-muted")} />}
          </div>
          <div className={T.h5}>{t}</div>
          <div className={cx(T.small, dark ? "text-white/75" : "text-muted")}>{d}</div>
        </div>
      ))}
    </Stagger>
  );
}

/** Photo beside text, the photo wipes in. */
export function PhotoSplit({ img, eyebrow, title, children, flip, bg }: { img: string; eyebrow: string; title: string; children: ReactNode; flip?: boolean; bg?: string }) {
  return (
    <section className={cx(bg, "py-[72px] md:py-24 lg:py-[120px]")}>
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-16">
        <ClipReveal className={cx("group/ps relative h-[340px] overflow-hidden rounded-3xl md:h-[460px] lg:h-[560px]", flip && "lg:order-2")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover/ps:scale-105" loading="lazy" />
        </ClipReveal>
        <div className="flex flex-col gap-6">
          <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
          <SplitIn text={title} className={cx(T.h2, "text-deep")} />
          {children}
        </div>
      </div>
    </section>
  );
}

/** Glass card for hero side panels. */
export function HeroCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("glass-dark rounded-3xl p-5 text-white", className)}>{children}</div>;
}
