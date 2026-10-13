"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Input } from "@/components/account/auth";
import { Icon } from "@/components/icon";
import { EASE, SplitWords } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";
import { R } from "@/lib/routes";

export function SignInForm() {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"Phone" | "Email">("Phone");
  const [phone, setPhone] = useState("24 555 0182");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "Phone" && phone.replace(/\D/g, "").length < 9) return setErr("Enter your 9-digit number, without the first 0.");
    if (mode === "Email" && !/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter an email address like ama@example.com.");
    setErr(""); setBusy(true);
    toast(mode === "Phone" ? `Code sent to +233 ${phone}` : `Code sent to ${email}`);
    const to = mode === "Phone" ? `+233 ${phone}` : email;
    setTimeout(() => router.push(`${R.code}?to=${encodeURIComponent(to)}`), 450);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <SplitWords text="Welcome back" className={cx(T.h1, "text-deep")} delay={0.1} />
        <p className="text-[16px] text-muted">Sign in with your {mode === "Phone" ? "phone number" : "email"}. We will send you a code.</p>
      </div>
      <LayoutGroup id="signin-mode">
        <div className="grid grid-cols-2 rounded-full bg-mist p-1" role="tablist" aria-label="Sign in with">
          {(["Phone", "Email"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(""); }} className={cx("relative h-11 rounded-full text-[15px] font-semibold transition-colors", mode === m ? "text-deep" : "text-muted hover:text-ink")}>
              {mode === m && <motion.span layoutId="signin-pill" className="absolute inset-0 rounded-full bg-white shadow-[var(--shadow-1)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} initial={{ opacity: 0, x: mode === "Phone" ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
            {mode === "Phone" ? (
              <Input label="Phone number" value={phone} onChange={(v) => { setPhone(v); setErr(""); }} inputMode="tel" autoComplete="tel-national" error={err}
                prefix={<span className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-xl bg-paper px-3.5 text-[15px]"><span className="text-muted">GH</span><span className="font-semibold">+233</span><Icon name="chevron-down" size={16} className="text-muted" /></span>} />
            ) : (
              <Input label="Email address" value={email} onChange={(v) => { setEmail(v); setErr(""); }} type="email" inputMode="email" autoComplete="email" placeholder="ama@example.com" error={err} icon={<Icon name="mail" size={18} className="text-muted" />} />
            )}
          </motion.div>
        </AnimatePresence>
        <Button type="submit" full arrow>{busy ? "Sending…" : "Send me a code"}</Button>
      </form>
      <div className="flex items-center gap-4 text-[13px] text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <Button href={R.b2b} variant="secondary" full>Continue as a business buyer</Button>
      <Link href={R.signUp} className="text-center text-[15px] font-semibold text-leaf hover:text-deep">New to Verdant? Create an account</Link>
    </>
  );
}
