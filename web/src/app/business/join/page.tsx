import { PublicPage } from "@/components/site/page";
import { Checks } from "@/components/ui";
import { Reveal, SplitWords } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { JoinForm } from "./join-client";

export const metadata = { title: "Open a business account · Verdant Foods" };

export default function JoinPage() {
  return (
    <PublicPage nav="light">
      <section className="pt-[68px] lg:pt-[72px]">
        <div className="grid lg:min-h-[calc(100svh-72px)] lg:grid-cols-[minmax(0,612fr)_minmax(0,828fr)]">
          <div className="relative flex min-h-[420px] overflow-hidden bg-night text-white md:min-h-[520px] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/procurement-manager.jpg" alt="A hotel buyer checking a delivery of fresh vegetables" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(1_31_26/.15)_30%,rgb(1_26_20/.85))]" />
            <div className="relative mt-auto flex w-full flex-col gap-6 p-5 pb-8 md:p-10 lg:p-12">
              <SplitWords as="h2" text="Buy straight from the farms." className={cx(T.h1, "max-w-[460px]")} delay={0.1} />
              <Reveal delay={0.4} className="glass-dark max-w-[520px] rounded-2xl p-5 md:p-6">
                <Checks light items={["Agreed prices for 3 to 12 months", "30-day credit after approval", "A trace report with every delivery"]} />
              </Reveal>
            </div>
          </div>
          <div className="flex justify-center bg-white px-5 py-10 md:px-10 md:py-14 lg:px-16">
            <JoinForm />
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
