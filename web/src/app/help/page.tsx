import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { Faq, PageHero, Tiles } from "@/components/site/sections";
import { Section } from "@/components/ui";
import { Stagger } from "@/components/motion";
import { Icon, type IconName } from "@/components/icon";
import { cx } from "@/components/tokens";
import { Title } from "@/components/corporate/blocks";
import { SiteSearch } from "@/components/corporate/client";
import { HELP_FAQ } from "@/lib/data-corporate";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Help centre", description: "Answers about orders, delivery, payments, the weekly box, trace codes and business accounts." };

const TALK: [IconName, string, string, string, string, string][] = [
  ["message-circle", "WhatsApp", "024 555 0100", "Replies in about 10 minutes", "https://wa.me/233245550100", "bg-lime-soft"],
  ["phone", "Call us", "0302 555 010", "Mon to Sat, 7 am to 7 pm", "tel:+233302555010", "bg-sun-soft"],
  ["mail", "Email", "help@verdantfoods.com.gh", "Replies within a day", "mailto:help@verdantfoods.com.gh", "bg-mint"],
];

export default function Help() {
  return (
    <PublicPage>
      <PageHero img="/img/family-unbox.jpg" height="mid" eyebrow="Help centre" title="How can we help?">
        <SiteSearch popular={[["Track my order", R.orders], ["Report a problem", R.report], ["Delivery areas", R.delivery], ["Trace a code", R.traceSearch]]} />
      </PageHero>

      <Section className="flex flex-col gap-10">
        <Title text="Browse by topic" />
        <Tiles cols={3} items={[
          ["truck", "Orders and delivery", "Track, change or cancel.", R.orders],
          ["wallet", "Payments", "Mobile money, card, refunds.", R.addresses],
          ["repeat", "Weekly box", "Pause, skip or change.", R.myBox],
          ["qr-code", "Trace codes", "What your code shows.", R.traceInfo],
          ["building-2", "Business accounts", "Credit, invoices, team.", R.business],
          ["sprout", "Selling your harvest", "For farmers and groups.", R.farmers],
        ]} />
      </Section>

      <Faq qs={HELP_FAQ} bg="bg-paper" />

      <Section className="flex flex-col gap-10">
        <Title text="Still need help?" sub="Real people in Accra and Tamale." />
        <Stagger className="grid gap-3 md:grid-cols-3 md:gap-4">
          {TALK.map(([i, l, v, d, href, bg]) => (
            <a key={l} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cx("group/tk flex h-full flex-col gap-2 rounded-3xl p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-1)]", bg)}>
              <span className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-deep transition-transform duration-300 group-hover/tk:rotate-[-6deg]"><Icon name={i} size={22} /></span><Icon name="arrow-up-right" size={18} className="text-deep transition-transform group-hover/tk:-translate-y-0.5 group-hover/tk:translate-x-0.5" /></span>
              <span className="mt-2 text-[15px] font-semibold text-muted">{l}</span>
              <span className="break-words text-[20px] font-semibold text-ink">{v}</span>
              <span className="text-[13px] text-muted">{d}</span>
            </a>
          ))}
        </Stagger>
      </Section>
    </PublicPage>
  );
}
