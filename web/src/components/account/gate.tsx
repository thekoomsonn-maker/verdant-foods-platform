"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Input } from "./auth";
import { Icon } from "../icon";
import { EASE, SplitWords } from "../motion";
import { cx, T } from "../tokens";

/**
 * Email + password sign-in for the staff console (area "team") and the business portal (area "business").
 * Posts to /api/auth/sign-in, which sets the signed `vf_session` cookie; then goes to ?next= or the area home.
 */
export function GateForm({ area, title, sub, foot }: { area: "team" | "business"; title: string; sub: string; foot?: ReactNode }) {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== "idle") return;
    const bad = (m: string) => { setErr(m); setShake((n) => n + 1); };
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return bad("Enter your work email, like name@company.com.");
    if (!password) return bad("Enter your password.");
    setErr(""); setState("busy");
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, area, remember, next: params.get("next") ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; next?: string };
      if (!res.ok || !data.ok) { setState("idle"); return bad(data.error ?? "Something went wrong. Please try again."); }
      setState("done");
      setTimeout(() => window.location.assign(data.next ?? (area === "team" ? "/admin" : "/b2b")), 450);
    } catch {
      setState("idle");
      bad("We could not reach Verdant. Check your connection and try again.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <SplitWords text={title} className={cx(T.h1, "text-deep")} delay={0.1} />
        <p className="text-[16px] text-muted">{sub}</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <Input label="Work email" name="email" type="email" inputMode="email" autoComplete="username" value={email} placeholder="name@company.com"
          onChange={(v) => { setEmail(v); setErr(""); }} icon={<Icon name="mail" size={18} className="text-muted" />} />
        <label className="flex w-full flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">Password</span>
          <span className={cx("flex h-[52px] w-full items-center gap-2.5 rounded-xl bg-paper pl-4 pr-1.5 ring-1 transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-deep", err ? "ring-danger" : "ring-transparent")}>
            <Icon name="lock" size={18} className="text-muted" />
            <input name="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }}
              aria-invalid={!!err} className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-muted" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
              className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-mist", show ? "text-deep" : "text-muted")}>
              <Icon name="eye" size={18} />
            </button>
          </span>
        </label>

        <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember(!remember)} className="group/k flex w-fit items-center gap-3 text-left">
          <span className={cx("flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md transition-colors duration-150", remember ? "bg-deep" : "bg-mint group-hover/k:bg-line-strong")}>
            <AnimatePresence>{remember && <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}><Icon name="check" size={15} strokeWidth={2.5} className="text-lime" /></motion.span>}</AnimatePresence>
          </span>
          <span className="text-[15px] text-ink">Keep me signed in <span className="text-muted">for 30 days</span></span>
        </button>

        <AnimatePresence initial={false}>
          {err && (
            <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
              <motion.div key={shake} role="alert" animate={reduce ? undefined : { x: [0, -4, 4, -4, 4, -4, 0] }} transition={{ duration: 0.36 }}
                className="flex items-start gap-3 rounded-2xl bg-danger-bg px-4 py-3.5 text-[14px] font-medium text-danger">
                <Icon name="circle-alert" size={18} className="mt-px shrink-0" />{err}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={state !== "idle"} aria-busy={state === "busy"}
          className={cx("group/btn relative inline-flex h-12 w-full select-none items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-[background-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
            state === "done" ? "bg-leaf text-white" : "bg-deep text-white hover:bg-night hover:shadow-[var(--shadow-1)]", state === "busy" && "cursor-wait")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={state} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
              {state === "busy" && <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />Signing in…</>}
              {state === "done" && <><Icon name="circle-check" size={20} />Signed in</>}
              {state === "idle" && <>Sign in<Icon name="arrow-right" size={20} className="transition-transform duration-200 group-hover/btn:translate-x-[3px]" /></>}
            </motion.span>
          </AnimatePresence>
        </button>
      </form>
      {foot}
    </>
  );
}

/** Quiet link row under the form. */
export function GateLinks({ items }: { items: [string, string][] }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-6">
      {items.map(([t, h]) => (
        <Link key={t} href={h} className="group/g flex w-fit items-center gap-1.5 text-[15px] font-semibold text-leaf transition-colors hover:text-deep">
          {t}<Icon name="arrow-up-right" size={16} className="transition-transform duration-200 group-hover/g:-translate-y-0.5 group-hover/g:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
