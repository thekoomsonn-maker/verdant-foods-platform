"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/site/account";
import { DrawnCheck, Thumb } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button, Pills } from "@/components/ui";
import { cedi, farmBySlug } from "@/lib/data";
import { orderById, orderProducts, PROBLEMS } from "@/lib/data-account";
import { R } from "@/lib/routes";

export function ReportForm({ orderId }: { orderId: string }) {
  const o = orderById(orderId)!;
  const ps = orderProducts(o);
  const toast = useToast();
  const [picked, setPicked] = useState<Record<string, boolean>>({ [ps[0].slug]: true });
  const [why, setWhy] = useState("Not fresh");
  const [note, setNote] = useState("");
  const [fix, setFix] = useState<"refund" | "replace">("refund");
  const [photos, setPhotos] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [shake, setShake] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const chosen = ps.filter((p) => picked[p.slug]);
  const amount = chosen.reduce((a, p) => a + p.price * p.qty, 0);
  const farm = farmBySlug(chosen[0]?.farm ?? ps[0].farm);
  const ref = `PR-${o.id.slice(3)}-${chosen.length || 1}`;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosen.length) { setShake((n) => n + 1); toast("Pick at least one item", "danger"); return; }
    setSent(true);
    toast(fix === "refund" ? `Report sent. ${cedi(amount)} will reach your MoMo within 24 hours.` : "Report sent. We will replace it with your next delivery.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (sent) {
    return (
      <Card className="items-start gap-5 p-6 md:p-10">
        <DrawnCheck size={64} className="text-leaf" />
        <div><h2 className="text-[26px] font-medium tracking-[-0.02em] text-deep md:text-[32px]">Thank you. We are on it.</h2>
          <p className="mt-2 max-w-[560px] text-muted">{fix === "refund" ? `${cedi(amount)} will be refunded to MTN MoMo within 24 hours.` : "A replacement will come with your next delivery, free."} We have told {farm.name} so they can check batch {o.batch}.</p></div>
        <div className="flex flex-wrap gap-2 text-[14px]"><span className="rounded-full bg-mist px-3 py-1.5 font-semibold text-deep">Reference {ref}</span><span className="rounded-full bg-mist px-3 py-1.5 text-deep">{chosen.map((p) => p.name).join(", ")} · {why}</span></div>
        <div className="flex flex-wrap gap-3"><Button href={R.orders} arrow>Back to orders</Button><Button href={R.tracking(o.id)} variant="secondary">View the order</Button></div>
      </Card>
    );
  }

  return (
    <form onSubmit={send} noValidate className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4 md:gap-6">
        <Card>
          <h2 className="text-[18px] font-semibold md:text-[20px]">1. Which items?</h2>
          <motion.div key={shake} animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.36 }} className="flex flex-col gap-2">
            {ps.map((p) => {
              const on = !!picked[p.slug];
              return (
                <button type="button" key={p.slug} role="checkbox" aria-checked={on} onClick={() => setPicked((x) => ({ ...x, [p.slug]: !on }))}
                  className={cx("flex items-center gap-3 rounded-2xl p-3 text-left transition-colors", on ? "bg-mist" : "bg-paper hover:bg-mist")}>
                  <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors", on ? "bg-deep text-white" : "bg-white ring-1 ring-line-strong")}>
                    <AnimatePresence>{on && <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}><Icon name="check" size={15} /></motion.span>}</AnimatePresence>
                  </span>
                  <Thumb p={p} size={40} />
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.name}</span><span className="block text-[13px] text-muted">{p.unit}{p.qty > 1 && ` × ${p.qty}`}</span></span>
                  <span className="text-[14px] tabular text-muted">{cedi(p.price * p.qty)}</span>
                </button>
              );
            })}
          </motion.div>
        </Card>

        <Card>
          <h2 className="text-[18px] font-semibold md:text-[20px]">2. What is wrong?</h2>
          <Pills items={PROBLEMS} value={why} onChange={setWhy} size="S" />
          <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
            {photos.length ? (
              <span className="flex">{photos.slice(0, 3).map((u, i) => (
                <motion.img key={u} src={u} alt="" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cx("h-12 w-12 rounded-xl object-cover ring-2 ring-paper", i > 0 && "-ml-3")} />
              ))}</span>
            ) : chosen[0] ? <Thumb p={chosen[0]} size={48} className="opacity-60" /> : <span className="h-12 w-12 rounded-xl bg-mist" />}
            <span className="min-w-0 flex-1"><span className="block font-semibold">{photos.length ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"} added` : "Add a photo"}</span><span className="block text-[13px] text-muted">Photos help the farm fix it fast.</span></span>
            <input ref={file} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) { const made = fs.map((f) => URL.createObjectURL(f)); urls.current.push(...made); setPhotos((p) => [...p, ...made]); toast(`${fs.length} ${fs.length === 1 ? "photo" : "photos"} added`); } e.target.value = ""; }} />
            <button type="button" onClick={() => file.current?.click()} aria-label="Add a photo" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-deep transition-colors hover:bg-mint"><Icon name="camera" size={18} /></button>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold">Tell us more (optional)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="For example: soft after one day in the fridge." className="resize-none rounded-xl bg-paper px-4 py-3.5 text-[16px] outline-none ring-1 ring-transparent transition placeholder:text-muted focus:bg-white focus:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus:ring-deep" />
          </label>
        </Card>

        <Card>
          <h2 className="text-[18px] font-semibold md:text-[20px]">3. How should we fix it?</h2>
          <LayoutGroup id="fix">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {([["refund", "wallet", "Refund to MoMo", `${cedi(amount)} within 24 hours`], ["replace", "repeat", "Replace it", "Free, with your next delivery"]] as const).map(([id, ic, t, s]) => {
                const on = fix === id;
                return (
                  <button type="button" key={id} onClick={() => setFix(id)} aria-pressed={on} className={cx("relative flex items-center gap-3 rounded-2xl p-4 text-left transition-colors", on ? "text-white" : "bg-paper hover:bg-mist")}>
                    {on && <motion.span layoutId="fix-on" className="absolute inset-0 rounded-2xl bg-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <Icon name={ic} size={20} className={cx("relative", on ? "text-lime" : "text-deep")} />
                    <span className="relative"><span className="block font-semibold">{t}</span><span className={cx("block text-[13px] tabular", on ? "text-white/75" : "text-muted")}>{s}</span></span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </Card>
        <div><Button type="submit" arrow>Send report</Button></div>
      </div>

      <Reveal delay={0.1} className="xl:sticky xl:top-24 xl:self-start">
        <section className="flex flex-col gap-4 rounded-[20px] bg-night p-5 text-white md:p-6">
          <Icon name="qr-code" size={24} className="text-lime" />
          <div className="text-[18px] font-semibold">We will tell the farm</div>
          <p className="text-[14px] text-white/75">Your report is linked to batch {o.batch} from {farm.name}. If others report the same, we check the whole batch.</p>
          <div className="flex flex-col gap-2 text-[14px]">
            <div className="flex justify-between"><span className="text-white/75">Picked</span><span className="font-semibold text-lime tabular">{o.picked}</span></div>
            <div className="flex justify-between"><span className="text-white/75">Reports on batch</span><span className="font-semibold text-lime">1 · yours</span></div>
          </div>
        </section>
      </Reveal>
    </form>
  );
}
