"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { Button, Container, Field, Pills } from "@/components/ui";
import { cx } from "@/components/tokens";
import { cedi, productImg, TINT } from "@/lib/data";
import { ORDER, PAY_OPTIONS } from "@/lib/data-market";
import { R } from "@/lib/routes";
import { useBagLines } from "@/components/market/bag-lines";

const STEPS = ["Details", "Delivery", "Payment"];

function StepBar({ step, onGo }: { step: number; onGo: (n: number) => void }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Checkout steps">
      {STEPS.map((s, i) => {
        const done = i < step, on = i === step;
        return (
          <li key={s} className="flex items-center gap-3">
            <button onClick={() => i < step && onGo(i)} disabled={i >= step} className="flex items-center gap-2.5" aria-current={on ? "step" : undefined}>
              <span className="relative flex h-7 w-7 items-center justify-center">
                <motion.span className="absolute inset-0 rounded-full" animate={{ backgroundColor: done ? "#5F9F0D" : on ? "#024639" : "#E2E8E4" }} transition={{ duration: 0.3 }} />
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.svg key="c" viewBox="0 0 24 24" width="16" height="16" className="relative text-white" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE }} />
                    </motion.svg>
                  ) : (
                    <motion.span key="n" className={cx("relative text-[13px] font-semibold", on ? "text-white" : "text-muted")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{i + 1}</motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className={cx("hidden text-[15px] font-medium sm:inline", on || done ? "text-ink" : "text-muted")}>{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="relative h-[2px] w-8 overflow-hidden rounded-full bg-line md:w-12">
                <motion.span className="absolute inset-0 origin-left rounded-full bg-leaf" initial={false} animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DoneCard({ title, sub, onChange }: { title: string; sub: string; onChange: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-3xl bg-white p-5 md:p-6">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf text-white"><Icon name="check" size={16} /></span>
      <div className="min-w-0 flex-1"><div className="text-[17px] font-semibold">{title}</div><div className="text-[14px] text-muted">{sub}</div></div>
      <button onClick={onChange} className="text-[15px] font-semibold text-leaf hover:text-deep">Change</button>
    </motion.div>
  );
}
function EditCard({ title, children, onNext }: { title: string; children: ReactNode; onNext: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="flex flex-col gap-5 rounded-3xl bg-white p-5 md:p-7">
      <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
      <Button arrow full onClick={onNext}>Continue</Button>
    </motion.div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, delivery, total } = useBagLines();
  const [step, setStep] = useState(2);
  const [pay, setPay] = useState<string>("mtn");
  const [paying, setPaying] = useState(false);
  const [day, setDay] = useState("Thursday 16 Oct");
  const [slot, setSlot] = useState("9 am to 1 pm");
  const opt = PAY_OPTIONS.find((o) => o.id === pay)!;
  const onPay = () => {
    setPaying(true);
    setTimeout(() => router.push(R.confirmed), 1600);
  };
  return (
    <div className="min-h-svh bg-paper">
      <header className="bg-white">
        <Container className="flex h-[72px] items-center justify-between lg:h-20">
          <Link href={R.home} aria-label="Verdant Foods home" className="relative block h-9 w-[110px] lg:h-10 lg:w-[124px]"><Image src="/brand/logo-green.png" alt="Verdant Foods" fill sizes="124px" className="object-contain object-left" priority /></Link>
          <span className="inline-flex items-center gap-2 text-[15px] font-medium text-deep"><Icon name="lock" size={18} className="text-leaf" />Secure checkout</span>
        </Container>
      </header>
      <Container className="grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_420px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-4 pb-1">
            <StepBar step={step} onGo={setStep} />
            <Link href={R.bag} className="hidden text-[14px] font-semibold text-muted hover:text-deep sm:inline">Back to bag</Link>
          </div>
          <LayoutGroup>
            {step === 0 ? (
              <EditCard title="Your details" onNext={() => setStep(1)}>
                <div className="grid gap-4 md:grid-cols-2"><Field label="Full name" value={ORDER.buyer} /><Field label="Phone" value={ORDER.phone} icon="smartphone" type="tel" /></div>
                <Field label="Email" value={ORDER.email} icon="mail" type="email" />
              </EditCard>
            ) : <DoneCard title="Your details" sub={`${ORDER.buyer} · ${ORDER.phone} · ${ORDER.email}`} onChange={() => setStep(0)} />}
            {step < 1 ? null : step === 1 ? (
              <EditCard title="Delivery" onNext={() => setStep(2)}>
                <Field label="Address" value={ORDER.address} icon="map-pin" />
                <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">Day</span><Pills items={["Wednesday 15 Oct", "Thursday 16 Oct", "Friday 17 Oct"]} value={day} onChange={setDay} size="S" /></div>
                <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold">Time</span><Pills items={["7 to 9 am", "9 am to 1 pm", "4 to 6 pm"]} value={slot} onChange={setSlot} size="S" /></div>
              </EditCard>
            ) : <DoneCard title={`Delivery · ${day}, ${slot}`} sub={ORDER.address} onChange={() => setStep(1)} />}
            {step === 2 && (
              <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col gap-3 rounded-3xl bg-white p-5 md:p-7">
                <h2 className="mb-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[24px]">How would you like to pay?</h2>
                <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-1">
                  {PAY_OPTIONS.map((o) => {
                    const on = o.id === pay;
                    return (
                      <div key={o.id} className="relative">
                        {on && <motion.span layoutId="pay-on" className="absolute inset-0 rounded-2xl bg-mist ring-2 ring-deep" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                        <button role="radio" aria-checked={on} onClick={() => setPay(o.id)} className="relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left">
                          <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-semibold", o.cls)}>{o.badge}</span>
                          <span className="flex-1"><span className="block text-[16px] font-semibold">{o.name}</span><span className="block text-[14px] text-muted">{o.sub}</span></span>
                          <span className={cx("flex h-6 w-6 items-center justify-center rounded-full transition-colors", on ? "bg-deep" : "ring-1 ring-line-strong")}>
                            <motion.span className="h-2.5 w-2.5 rounded-full bg-white" initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 26 }} />
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {on && o.id !== "bank" && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="relative overflow-hidden">
                              <div className="px-4 pb-4">
                                {o.momo ? <Field label={o.id === "mtn" ? "MoMo number" : `${o.name} number`} value={ORDER.phone} icon="smartphone" type="tel" />
                                  : <div className="grid gap-3 md:grid-cols-[1fr_120px_100px]"><Field label="Card number" placeholder="1234 5678 9012 3456" icon="credit-card" /><Field label="Expiry" placeholder="MM/YY" /><Field label="CVV" placeholder="123" /></div>}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                <button onClick={onPay} disabled={paying || !lines.length} className="relative mt-3 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-deep text-[17px] font-semibold text-white transition-[background-color,transform] hover:bg-forest active:scale-[0.98] disabled:cursor-default disabled:hover:bg-deep">
                  <AnimatePresence mode="wait" initial={false}>
                    {paying ? (
                      <motion.span key="p" className="inline-flex items-center gap-2.5" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-lime" />{opt.momo ? "Approve the prompt on your phone" : "Confirming payment"}
                      </motion.span>
                    ) : (
                      <motion.span key="i" className="group/pay inline-flex items-center gap-2" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>Pay {cedi(total)}<Icon name="arrow-right" size={20} /></motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <p className="text-center text-[13px] text-muted">{opt.momo ? "You will get a prompt on your phone. Your bag is held for 15 minutes." : opt.id === "card" ? "Your card is charged once your bag is packed." : "Your order is packed once the transfer arrives."}</p>
              </motion.div>
            )}
          </LayoutGroup>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 md:p-6">
            <span className="text-[19px] font-semibold">Order summary</span>
            <ul className="flex flex-col gap-3 border-b border-line pb-4">
              {lines.map((l, i) => (
                <motion.li key={l.p.slug} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + Math.min(i, 8) * 0.04 }} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImg(l.p)} alt="" className="h-12 w-12 rounded-xl object-cover mix-blend-multiply" style={{ background: TINT[l.p.img] }} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{l.p.name}</span><span className="block text-[13px] text-muted">{l.qty} × {l.p.unit}</span></span>
                  <span className="text-[15px] font-semibold tabular">{cedi(l.p.price * l.qty)}</span>
                </motion.li>
              ))}
              {!lines.length && <li className="text-[14px] text-muted">Your bag is empty. <Link href={R.shop} className="font-semibold text-deep">Shop fresh</Link></li>}
            </ul>
            <div className="flex flex-col gap-2.5 text-[15px]">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold tabular">{cedi(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span className="font-semibold tabular">{delivery ? cedi(delivery) : "Free"}</span></div>
              <div className="flex items-center justify-between pt-1"><span className="font-semibold">Total</span><span className="text-[26px] font-semibold text-deep tabular">{cedi(total)}</span></div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-lime-soft px-5 py-4 text-[15px] text-deep"><Icon name="timer" size={20} className="mt-0.5 shrink-0" />Packed {day.split(" ")[0]} morning. About 30 hours from harvest to your door.</div>
        </div>
      </Container>
    </div>
  );
}
