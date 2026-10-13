"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DrawnCheck } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { EASE, SplitWords } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";
import { R } from "@/lib/routes";

const N = 6;
const DEMO = "481920"; // Demo only. The real check happens on Verdant's servers.
const WAIT = 42;

export function CodeForm({ to }: { to: string }) {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const shake = useAnimationControls();
  const [d, setD] = useState<string[]>(Array(N).fill(""));
  const [wrong, setWrong] = useState(false);
  const [ok, setOk] = useState(false);
  const [left, setLeft] = useState(WAIT);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(N - 1, i))]?.focus();

  const verify = async (code: string[]) => {
    if (code.some((x) => !x)) { toast("Enter all 6 digits", "info"); focus(code.findIndex((x) => !x)); return; }
    if (code.join("") === DEMO) {
      setOk(true); toast("You are signed in");
      setTimeout(() => router.push(R.account), reduce ? 200 : 1100);
      return;
    }
    setWrong(true);
    toast("That code is not right. Check the message and try again.", "danger");
    await shake.start({ x: reduce ? 0 : [0, -4, 4, -4, 4, -4, 4, 0], transition: { duration: 0.42 } });
    setD(Array(N).fill("")); focus(0);
  };

  const put = (i: number, raw: string) => {
    let digits = raw.replace(/\D/g, "");
    // Typing over a filled box gives two characters: keep the new one.
    if (digits.length === 2 && d[i]) digits = digits[0] === d[i] ? digits[1] : digits[0];
    setWrong(false);
    if (!digits) { const n = [...d]; n[i] = ""; setD(n); return; }
    const n = [...d];
    for (let k = 0; k < digits.length && i + k < N; k++) n[i + k] = digits[k];
    setD(n);
    const next = i + digits.length;
    if (next >= N && n.every(Boolean)) { refs.current[N - 1]?.blur(); verify(n); } else focus(next);
  };

  const key = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !d[i]) { e.preventDefault(); const n = [...d]; n[i - 1 >= 0 ? i - 1 : 0] = ""; setD(n); focus(i - 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); focus(i - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); focus(i + 1); }
  };

  if (ok) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col items-start gap-4" role="status">
        <DrawnCheck size={64} className="text-leaf" />
        <h1 className={cx(T.h2, "text-deep")}>You are in</h1>
        <p className="text-muted">Taking you to your account.</p>
      </motion.div>
    );
  }

  const m = Math.floor(left / 60), s = String(left % 60).padStart(2, "0");
  return (
    <>
      <Link href={R.signIn} className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold text-deep hover:text-leaf"><Icon name="arrow-left" size={16} />Back</Link>
      <div className="flex flex-col gap-3">
        <SplitWords text="Enter your code" className={cx(T.h1, "text-deep")} delay={0.1} />
        <p className="text-[16px] text-muted">We sent 6 digits to <span className="font-medium text-ink">{to}</span>. Use this to sign in or get back into your account.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); verify(d); }} className="flex flex-col gap-5" noValidate>
        <motion.div animate={shake} className="grid grid-cols-6 gap-2 sm:gap-2.5" role="group" aria-label="6-digit code">
          {d.map((v, i) => (
            <label key={i} className={cx("relative flex aspect-[4/5] max-h-[64px] items-center justify-center rounded-xl transition-[background-color,box-shadow] duration-150 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-2 focus-within:ring-deep",
              wrong ? "bg-danger-bg ring-2 ring-danger" : v ? "bg-mist" : "bg-paper ring-1 ring-line")}>
              <input
                ref={(el) => { refs.current[i] = el; }}
                value={v} onChange={(e) => put(i, e.target.value)} onKeyDown={(e) => key(i, e)} onFocus={(e) => e.target.select()}
                onPaste={(e) => { e.preventDefault(); put(i, e.clipboardData.getData("text")); }}
                inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`}
                className="absolute inset-0 h-full w-full bg-transparent text-center text-transparent caret-deep outline-none"
              />
              <AnimatePresence>
                {v && (
                  <motion.span key={v + i} aria-hidden initial={{ scale: reduce ? 1 : 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: "spring", stiffness: 520, damping: 22 }}
                    className={cx("pointer-events-none text-[26px] font-medium tabular", wrong ? "text-danger" : "text-ink")}>{v}</motion.span>
                )}
              </AnimatePresence>
            </label>
          ))}
        </motion.div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait" initial={false}>
            {left > 0 ? (
              <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[13px] font-medium text-deep tabular" aria-live="polite">
                <Icon name="timer" size={15} />Resend in {m}:{s}
              </motion.span>
            ) : (
              <motion.button key="go" type="button" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={() => { setLeft(WAIT); toast(`New code sent to ${to}`); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-deep px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-forest"><Icon name="refresh-cw" size={14} />Resend code</motion.button>
            )}
          </AnimatePresence>
          <Link href={R.signIn} className="text-[14px] font-semibold text-leaf hover:text-deep">Use a different number</Link>
        </div>
        <Button type="submit" full arrow>Confirm</Button>
      </form>
      <div className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 text-[14px]">
        <Icon name="message-circle" size={18} className="shrink-0 text-deep" />
        <span className="flex-1">No code? We can send it by WhatsApp or call you.</span>
        <button type="button" onClick={() => toast("Sending your code by WhatsApp")} className="shrink-0 font-semibold text-deep hover:text-leaf">Send</button>
      </div>
      <p className="text-[13px] text-muted">This is a preview. Use code <span className="font-semibold tabular text-ink">{DEMO}</span> to continue.</p>
    </>
  );
}
