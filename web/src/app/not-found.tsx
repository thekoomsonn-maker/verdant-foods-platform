import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/site/page";
import { PageHero } from "@/components/site/sections";
import { Button } from "@/components/ui";
import { Reveal, Stagger } from "@/components/motion";
import { Icon, type IconName } from "@/components/icon";
import { SiteSearch } from "@/components/corporate/client";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Page not found" };

const LINKS: [IconName, string, string, string][] = [
  ["shopping-basket", "Shop fresh produce", "Picked in the last three days", R.shop],
  ["qr-code", "Trace your food", "Enter the code on your bag", R.traceInfo],
  ["circle-help", "Help centre", "Orders, payments and delivery", R.help],
];

export default function NotFound() {
  return (
    <PublicPage>
      <PageHero img="/img/soil.jpg" eyebrow="Error 404" title="We could not find that page."
        sub="It may have moved, or the link may be wrong. Search, or try one of these."
        actions={<><Button href={R.home} variant="lime" arrow>Back to home</Button><Button href={R.contact} variant="glass">Tell us what broke</Button></>}>
        <Reveal delay={0.7}><SiteSearch placeholder="Search produce, farms or help" /></Reveal>
        <Stagger className="hidden gap-3 pt-2 sm:grid sm:grid-cols-3">
          {LINKS.map(([i, t, d, h]) => (
            <Link key={t} href={h} className="glass-dark group/nf flex h-full items-center gap-3 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-night transition-transform group-hover/nf:rotate-[-6deg]"><Icon name={i} size={18} /></span>
              <span className="min-w-0"><span className="block text-[15px] font-semibold">{t}</span><span className="block text-[13px] text-white/70">{d}</span></span>
            </Link>
          ))}
        </Stagger>
      </PageHero>
    </PublicPage>
  );
}
