import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { PageHero } from "@/components/site/sections";
import { Section } from "@/components/ui";
import { Reveal, Stagger } from "@/components/motion";
import { Icon, type IconName } from "@/components/icon";
import { cx } from "@/components/tokens";
import { ContactForm, ContactMap } from "@/components/corporate/client";

export const metadata: Metadata = { title: "Contact", description: "Questions about an order, buying for your business or selling your harvest? We reply within one working day." };

const REACH: [IconName, string, string, string, string][] = [
  ["message-circle", "Call or WhatsApp", "Monday to Saturday, 8 am to 6 pm", "https://wa.me/233245550100", "bg-lime-soft"],
  ["mail", "Email", "hello@verdantfoods.com.gh", "mailto:hello@verdantfoods.com.gh", "bg-mint"],
  ["map-pin", "Head office", "Airport Residential Area, Accra", "https://www.google.com/maps/search/?api=1&query=5.6052,-0.1718", "bg-sun-soft"],
  ["sprout", "Verdant Farm", "Somanya, Eastern Region", "https://www.google.com/maps/search/?api=1&query=6.1043,-0.0151", "bg-orange-soft"],
];

export default function Contact() {
  return (
    <PublicPage>
      <PageHero img="/img/support-agent.jpg" height="short" eyebrow="Contact Verdant" title="Talk to us"
        sub="Questions about an order, buying for your business or selling your harvest? We reply within one working day." />
      <Section bg="bg-paper" className="grid gap-6 lg:grid-cols-[1fr_440px] lg:gap-10">
        <Reveal y={24}><ContactForm /></Reveal>
        <div className="flex flex-col gap-3">
          <Stagger className="flex flex-col gap-3">
            {REACH.map(([i, t, d, href, bg]) => (
              <a key={t} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                className={cx("group/rc flex items-center gap-4 rounded-2xl p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-1)]", bg)}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name={i} size={22} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[17px] font-semibold text-ink">{t}</span><span className="block truncate text-[14px] text-muted">{d}</span></span>
                <Icon name="arrow-up-right" size={18} className="shrink-0 text-deep transition-transform group-hover/rc:-translate-y-0.5 group-hover/rc:translate-x-0.5" />
              </a>
            ))}
          </Stagger>
          <Reveal delay={0.2}><ContactMap /></Reveal>
        </div>
      </Section>
    </PublicPage>
  );
}
