"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Button, Check } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { DrawCheck, Input, Select } from "@/components/b2b/kit";
import { R } from "@/lib/routes";

const STEPS = ["Business", "Delivery", "Payment"];
const TYPES = ["Restaurant", "Hotel", "Caterer", "Shop", "Processor", "School or hospital"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Numbered steps joined by lines that fill as you move on. */
function StepsBar({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 md:gap-3" aria-label="Sign-up progress">
      {STEPS.map((s, i) => {
        const done = i < step, on = i === step;
        return (
          <li key={s} className={cx("flex items-center gap-2 md:gap-3", i < STEPS.length - 1 && "flex-1")} aria-current={on ? "step" : undefined}>
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">
              <motion.span className="absolute inset-0 rounded-full" initial={false} animate={{ backgroundColor: done || on ? "#024639" : "#F2F7F4" }} transition={{ duration: 0.3 }} />
              <span className={cx("relative", done || on ? "text-white" : "text-muted")}>{done ? <Icon name="check" size={14} /> : i + 1}</span>
            </span>
            <span className={cx("text-[14px] font-semibold", on ? "text-ink" : "hidden text-muted sm:inline")}>{s}</span>
            {i < STEPS.length - 1 && (
              <span className="relative h-[2px] min-w-6 flex-1 overflow-hidden rounded-full bg-line">
                <motion.span className="absolute inset-0 origin-left bg-deep" initial={false} animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Chips({ items, value, onToggle, id, single }: { items: string[]; value: string[]; onToggle: (v: string) => void; id: string; single?: boolean }) {
  return (
    <LayoutGroup id={id}>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => {
          const on = value.includes(t);
          return (
            <button key={t} type="button" aria-pressed={on} onClick={() => onToggle(t)} className={cx("relative rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors", on ? "text-white" : "bg-mist text-deep hover:bg-mint")}>
              {on && <motion.span layoutId={single ? "chip" : undefined} className="absolute inset-0 rounded-full bg-deep" initial={single ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{t}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function Label({ children }: { children: ReactNode }) { return <span className="text-[14px] font-semibold text-ink">{children}</span>; }

export function JoinForm() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ biz: "Osu Kitchen Group", type: "Restaurant", name: "Kwesi Owusu", phone: "+233 20 555 8812", email: "kwesi@osukitchen.com", city: "Accra", spend: "GH₵ 5,000 to 15,000", reg: "",
    address: "Oxford Street, Osu", landmark: "Behind the Osu Castle Road junction", days: ["Mon", "Wed", "Fri"], time: "5 to 7 am", receiver: "Joe Nartey", terms: "30-day credit", method: "Bank transfer", agree: true });
  const set = <K extends keyof typeof f>(k: K) => (v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); };
  const x = reduce ? 0 : 40;

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex w-full max-w-[500px] flex-col items-start gap-5 pt-6 lg:pt-16">
        <DrawCheck />
        <h1 className={cx(T.h2, "text-deep")}>Thanks, {f.name.split(" ")[0]}. We have your application.</h1>
        <p className="text-[17px] text-muted">Our business team will call {f.phone} within one working day to confirm your account and credit limit. You can start sourcing straight away and pay on delivery until then.</p>
        <div className="flex flex-col gap-3 sm:flex-row"><Button href={R.b2b} arrow>Go to your business account</Button><Button href={R.b2bSource} variant="secondary">See live stock</Button></div>
      </motion.div>
    );
  }

  return (
    <div className="flex w-full max-w-[500px] flex-col gap-7">
      <StepsBar step={step} />
      <div className="flex flex-col gap-3">
        <h1 className={cx(T.h2, "text-deep")}>Open a business account</h1>
        <p className="text-muted">We reply within one working day.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (step < 2) go(step + 1); else setDone(true); }} className="relative">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * x }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * x }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-5">
            {step === 0 && <>
              <Input label="Business name" value={f.biz} onChange={set("biz")} />
              <div className="flex flex-col gap-2"><Label>Type of business</Label><Chips single id="type" items={TYPES} value={[f.type]} onToggle={set("type")} /></div>
              <div className="grid gap-5 sm:grid-cols-2"><Input label="Your name" value={f.name} onChange={set("name")} /><Input label="Phone" type="tel" value={f.phone} onChange={set("phone")} /></div>
              <div className="grid gap-5 sm:grid-cols-2"><Input label="Work email" type="email" value={f.email} onChange={set("email")} /><Select label="City" value={f.city} options={["Accra", "Tema", "Kumasi", "Tamale", "Takoradi", "Cape Coast"]} onChange={set("city")} /></div>
              <Select label="Weekly produce spend" value={f.spend} options={["Under GH₵ 5,000", "GH₵ 5,000 to 15,000", "GH₵ 15,000 to 50,000", "Over GH₵ 50,000"]} onChange={set("spend")} />
              <Input label="Business registration number (optional)" placeholder="CS123456789" value={f.reg} onChange={set("reg")} />
            </>}
            {step === 1 && <>
              <Input label="Delivery address" icon="map-pin" value={f.address} onChange={set("address")} />
              <Input label="Landmark or directions" value={f.landmark} onChange={set("landmark")} />
              <div className="flex flex-col gap-2"><Label>Delivery days</Label><Chips id="days" items={DAYS} value={f.days} onToggle={(d) => set("days")(f.days.includes(d) ? f.days.filter((y) => y !== d) : [...f.days, d])} /></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select label="Time" value={f.time} options={["5 to 7 am", "7 to 9 am", "9 to 11 am", "2 to 4 pm"]} onChange={set("time")} />
                <Input label="Who receives" value={f.receiver} onChange={set("receiver")} />
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-mist p-4 text-[14px] text-deep"><Icon name="thermometer-snowflake" size={18} className="mt-0.5 shrink-0" />Cold vans reach Accra, Tema and Kumasi. Your receiver weighs each crate on arrival and confirms it in the app.</div>
            </>}
            {step === 2 && <>
              <div className="flex flex-col gap-2"><Label>How you want to pay</Label>
                <LayoutGroup id="terms">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([["30-day credit", "After approval, up to your limit"], ["Pay on delivery", "Mobile money or card at the door"]] as const).map(([t, s]) => {
                      const on = f.terms === t;
                      return (
                        <button key={t} type="button" onClick={() => set("terms")(t)} aria-pressed={on} className="relative flex flex-col gap-1 rounded-2xl p-4 text-left">
                          <span className={cx("absolute inset-0 rounded-2xl", on ? "" : "bg-paper")} />
                          {on && <motion.span layoutId="term" className="absolute inset-0 rounded-2xl bg-lime-soft ring-2 ring-deep" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                          <span className="relative text-[15px] font-semibold">{t}</span><span className="relative text-[13px] text-muted">{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>
              </div>
              <Select label="Payment method" value={f.method} options={["Bank transfer", "MTN Mobile Money", "Telecel Cash", "AT Money", "Visa or Mastercard"]} onChange={set("method")} />
              <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4 text-[14px]">
                <div className="flex justify-between"><span className="text-muted">Business</span><span className="font-semibold">{f.biz} · {f.type}</span></div>
                <div className="flex justify-between"><span className="text-muted">Delivery</span><span className="font-semibold">{f.days.join(", ") || "No days picked"} · {f.time}</span></div>
                <div className="flex justify-between"><span className="text-muted">Contact</span><span className="font-semibold">{f.name}</span></div>
              </div>
              <Check on={f.agree} label="I agree to the business terms and the privacy policy" />
              <Link href={R.legal} className="-mt-2 w-fit text-[14px] font-semibold text-leaf hover:text-deep">Read the business terms</Link>
            </>}
          </motion.div>
        </AnimatePresence>
        <div className="mt-7 flex flex-col gap-3">
          <Button type="submit" full arrow>{step < 2 ? "Continue" : "Send application"}</Button>
          {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="h-11 rounded-full text-[15px] font-semibold text-deep hover:bg-mist">Back</button>
            : <Link href={R.b2b} className="text-center text-[15px] font-semibold text-leaf hover:text-deep">Already have an account? Sign in</Link>}
        </div>
      </form>
    </div>
  );
}
