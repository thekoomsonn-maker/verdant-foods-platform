import { PublicPage } from "../site/page";
import { Reveal, SplitWords } from "../motion";
import { Button } from "../ui";
import { Icon } from "../icon";
import { cx, T } from "../tokens";
import { CodeForm } from "./actions";
import { QrGlyph } from "./qr";
import { JOURNEY } from "@/lib/data";
import { R } from "@/lib/routes";

/** Board 72: an unknown code on /t/[code]. Server-safe: only renders client components. */
export function CodeNotFound({ code }: { code: string }) {
  return (
    <PublicPage nav="light">
      <section className="bg-paper pt-[68px] lg:pt-[72px]">
        <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-5 px-5 py-14 text-center md:py-20">
          <Reveal y={0} className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sun-soft text-warning">
            <QrGlyph size={40} />
          </Reveal>
          <SplitWords as="h1" text="We could not find that code" className={cx(T.h1, "text-deep")} delay={0.05} />
          <Reveal delay={0.25}><p className={cx(T.lead, "text-muted")}><span className="font-medium text-ink">{code || "That code"}</span> is not in our records.</p></Reveal>
          <Reveal delay={0.35} className="w-full rounded-[20px] bg-white p-5 text-left md:p-6">
            <CodeForm tone="light" initial={JOURNEY.code} />
          </Reveal>
          <Reveal delay={0.45} className="w-full rounded-[20px] bg-mist p-5 text-left md:p-6">
            <div className="text-[14px] font-semibold text-deep">Common mix-ups</div>
            <ul className="mt-3 flex flex-col gap-3">
              {["O and 0 look alike. Codes only use 0.", "Scan in good light, holding the phone still.", "Codes start with VF."].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name="check" size={15} /></span><span className="text-[15px]">{t}</span></li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.55} className="flex w-full items-start gap-3 rounded-[20px] bg-danger-bg p-4 text-left text-[14px] text-ink md:p-5">
            <Icon name="triangle-alert" size={20} className="mt-0.5 shrink-0 text-danger" />
            <span>Bag opened or label damaged? Do not eat it. Report it and we will refund you.</span>
          </Reveal>
          <Reveal delay={0.6}><Button href={R.report} variant="secondary" size="M">Report this bag</Button></Reveal>
        </div>
      </section>
    </PublicPage>
  );
}
