"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../icon";
import { Button } from "../ui";
import { cx } from "../tokens";
import { useToast } from "../toast";
import { useBag } from "../site/bag";
import { EASE } from "../motion";
import { Viewfinder, QrGlyph } from "./qr";
import { productBySlug } from "@/lib/data";
import { R } from "@/lib/routes";

/** "Alert me" form: phone number in, toast out. */
export function AlertForm({ batch }: { batch: string }) {
  const toast = useToast();
  const [phone, setPhone] = useState("024 555 0182");
  const [on, setOn] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (phone.replace(/\D/g, "").length < 9) { toast("Enter a phone number with at least 9 digits", "danger"); return; }
        setOn(true); toast(`We will text ${phone} if anything changes for batch ${batch}`);
      }}
      className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5"
    >
      <Icon name="phone" size={18} className="shrink-0 text-muted" />
      <input value={phone} onChange={(e) => { setPhone(e.target.value); setOn(false); }} inputMode="tel" aria-label="Phone number for alerts" className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted" placeholder="Your phone number" />
      <button type="submit" className={cx("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors duration-200", on ? "bg-lime text-night" : "bg-deep text-white hover:bg-forest")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={on ? "on" : "off"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="inline-flex items-center gap-1.5">
            {on ? <><Icon name="check" size={16} />Alerts on</> : "Alert me"}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  );
}

/** Buy again: adds the traced product to the bag with the fly-to-bag arc. */
export function BuyAgain({ slug = "vine-tomatoes", light }: { slug?: string; light?: boolean }) {
  const { add } = useBag();
  const toast = useToast();
  const ref = useRef<HTMLSpanElement>(null);
  const p = productBySlug(slug);
  return (
    <span ref={ref} className="inline-flex">
      <Button size="M" variant={light ? "lime" : "primary"} icon="shopping-bag" onClick={() => { add(p, ref.current); toast(`${p.name} added to your bag`); }}>Buy again</Button>
    </span>
  );
}

/** Thank-you note to the farmer. Opens a short form in place. */
export function ThankYou({ farmer, variant = "glass", center }: { farmer: string; variant?: "glass" | "lime"; center?: boolean }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("Thank you. The tomatoes were sweet and firm.");
  if (sent) return <span className={cx("inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold", variant === "lime" ? "bg-white/15 text-white" : "bg-white/10 text-white")}><Icon name="circle-check" size={18} className="text-lime" />Sent to {farmer.split(" ")[0]}</span>;
  return (
    <div className={cx("flex w-full flex-col gap-3", center && "items-center")}>
      {!open && <Button size="M" variant={variant} arrow={variant === "lime"} onClick={() => setOpen(true)}>Send a thank you</Button>}
      <AnimatePresence>
        {open && (
          <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); toast(`Thank you sent. ${farmer.split(" ")[0]}’s group will hear it at the next meeting.`); }}
            className="flex w-full max-w-[520px] items-center gap-2 rounded-full bg-white p-1.5 pl-5">
            <input autoFocus value={msg} onChange={(e) => setMsg(e.target.value)} aria-label="Your message" className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none" />
            <Button size="M" type="submit">Send</Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Code input that routes to /t/[code]. Used on trace search and the "code not found" page. */
export function CodeForm({ initial = "", tone = "dark", withScan, autoFocus }: { initial?: string; tone?: "dark" | "light"; withScan?: boolean; autoFocus?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState(initial);
  const [scan, setScan] = useState(false);
  const go = (c: string) => router.push(R.trace(encodeURIComponent(c.trim().toUpperCase() || "VF-TOM-00048")));
  if (tone === "light") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); go(code); }} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">Type the code on your bag</span>
          <span className="flex h-[52px] items-center gap-2.5 rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-deep">
            <Icon name="qr-code" size={18} className="text-muted" />
            <input autoFocus={autoFocus} value={code} onChange={(e) => setCode(e.target.value)} placeholder="VF-TOM-00048" className="w-full bg-transparent text-[16px] uppercase tracking-[0.02em] outline-none placeholder:normal-case placeholder:text-muted" />
          </span>
        </label>
        <Button type="submit" full arrow>Try again</Button>
      </form>
    );
  }
  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); go(code); }} className="glass-dark flex w-full max-w-[600px] items-center gap-2 rounded-full p-1.5 pl-4 md:pl-5">
        <Icon name="qr-code" size={20} className="shrink-0 text-lime" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter the code on your bag" aria-label="Trace code" className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/65" />
        <button type="submit" className="group/tr inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-lime px-4 text-[14px] font-semibold text-night transition-colors hover:bg-leaf-light md:px-5">Trace<Icon name="arrow-right" size={16} className="transition-transform group-hover/tr:translate-x-[3px]" /></button>
        {withScan && <button type="button" onClick={() => setScan(true)} className="glass hidden h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-white sm:inline-flex"><Icon name="scan-line" size={16} />Scan</button>}
      </form>
      {withScan && <button type="button" onClick={() => setScan(true)} className="glass mt-3 inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-white sm:hidden"><Icon name="scan-line" size={18} />Scan the code</button>}
      <ScanSheet open={scan} onClose={() => setScan(false)} onFound={(c) => go(c)} />
    </>
  );
}

/** Camera-style scanner sheet. Demo only: it "finds" the sample code after a moment. */
function ScanSheet({ open, onClose, onFound }: { open: boolean; onClose: () => void; onFound: (c: string) => void }) {
  const [found, setFound] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setFound(true), 2200);
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { clearTimeout(t); window.removeEventListener("keydown", k); };
  }, [open, onClose]);
  return (
    <AnimatePresence onExitComplete={() => setFound(false)}>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-night/60 backdrop-blur-sm md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal aria-label="Scan a code" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-t-[28px] bg-night p-5 text-white md:rounded-[28px]">
            <div className="flex items-center justify-between"><span className="text-[17px] font-semibold">Point at the square on your bag</span><button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><Icon name="x" size={18} /></button></div>
            <div className="relative mt-4 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/family-unbox.jpg" alt="" className="h-[340px] w-full scale-110 object-cover opacity-70 blur-[2px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Viewfinder className="flex h-[200px] w-[200px] items-center justify-center rounded-xl bg-white/90">
                  <QrGlyph size={128} className="text-night" />
                </Viewfinder>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {found ? (
                <motion.div key="f" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-forest p-3 pl-4">
                  <span><span className="block text-[13px] text-lime">Code found</span><span className="block text-[16px] font-semibold tracking-[0.02em]">VF-TOM-00048</span></span>
                  <Button size="M" variant="lime" arrow onClick={() => onFound("VF-TOM-00048")}>Open</Button>
                </motion.div>
              ) : (
                <motion.p key="s" exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 text-[14px] text-white/75"><span className="h-2 w-2 animate-breathe rounded-full bg-lime" />Looking for a code. Hold the phone still.</motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
