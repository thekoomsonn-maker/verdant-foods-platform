"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AreaChart, Donut, Legend } from "@/components/charts";
import { Icon, type IconName } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { CountUp, EASE, Reveal, SplitWords } from "@/components/motion";
import { StoryCard } from "@/components/site/sections";
import { useToast } from "@/components/toast";
import { Button, Chip, Container, Pills, Section, Tabs } from "@/components/ui";
import { cx, T } from "@/components/tokens";
import { cedi, FARMS, JOURNEY, PLACES, plotAround, STORIES } from "@/lib/data";
import { LEGAL, ROLES } from "@/lib/data-corporate";
import { LANGS } from "@/lib/langs";
import { R } from "@/lib/routes";

/** SplitWords that starts when the heading scrolls into view (section titles). */
export function SplitIn({ text, className, as = "h2" }: { text: string; className?: string; as?: "h2" | "p" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const C = as;
  return <div ref={ref}>{inView ? <SplitWords as={as} text={text} className={className} delay={0} /> : <C className={cx(className, "opacity-0")}>{text}</C>}</div>;
}

/* ---------- Shared input (named, controlled-free) ---------- */
function Input({ label, name, placeholder, type = "text", area, required, error }: { label: string; name: string; placeholder?: string; type?: string; area?: boolean; required?: boolean; error?: boolean }) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      <span className={cx("flex w-full rounded-xl bg-paper px-4 ring-1 transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]", error ? "ring-danger" : "ring-transparent", area ? "py-3.5" : "h-[52px] items-center")}>
        {area
          ? <textarea name={name} placeholder={placeholder} rows={4} required={required} className="w-full resize-none bg-transparent text-[16px] outline-none placeholder:text-muted" />
          : <input name={name} type={type} placeholder={placeholder} required={required} className="w-full bg-transparent text-[16px] outline-none placeholder:text-muted" />}
      </span>
    </label>
  );
}

/** Check mark that draws itself (spec §10). */
function DrawnCheck({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }} className={cx("flex items-center justify-center rounded-full bg-lime text-night", className)} style={{ width: size, height: size }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.15, ease: EASE }} />
      </svg>
    </motion.span>
  );
}

/* ---------- About: where we work (list + live map) ---------- */
const REGIONS: { id: string; name: string; places: string; lat: number; lng: number }[] = [
  { id: "tamale", name: "Northern Region", places: "Tamale, Tolon, Kumbungu, Savelugu", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng },
  { id: "wa", name: "Upper West Region", places: "Wa, Lawra, Nadowli", lat: PLACES.wa.lat, lng: PLACES.wa.lng },
  { id: "", name: "We deliver to", places: "Accra, Kumasi, Tamale", lat: PLACES.accra.lat, lng: PLACES.accra.lng },
];
export function WhereWeWork() {
  const [active, setActive] = useState<string | undefined>();
  return (
    <section className="bg-deep text-white">
      <Container className="grid gap-10 py-[72px] md:py-24 lg:grid-cols-[420px_1fr] lg:items-center lg:gap-16 lg:py-[120px]">
        <div className="flex flex-col gap-5">
          <Reveal><span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime"><span className="h-1.5 w-1.5 rounded-full bg-lime" />Where we work</span></Reveal>
          <SplitIn text="Northern and Upper West regions" className={T.h2} />
          <Reveal delay={0.1}><p className="text-[17px] text-white/75">Our farmers are in seven districts. We deliver to three cities.</p></Reveal>
          <Reveal delay={0.2} className="flex flex-col">
            {REGIONS.map((r) => (
              <button key={r.name} disabled={!r.id} onClick={() => r.id && setActive(r.id)} className={cx("group/rg disabled:cursor-default flex items-center justify-between gap-4 border-t border-white/10 py-3 text-left transition-colors", active === r.id ? "text-white" : "text-white/80 hover:text-white")}>
                <span className="text-[15px] font-semibold text-lime">{r.name}</span>
                <span className="inline-flex items-center gap-2 text-right text-[14px]">{r.places}<Icon name="locate-fixed" size={15} className={cx("transition-opacity", active === r.id ? "opacity-100 text-lime" : "opacity-0 group-hover/rg:opacity-60")} /></span>
              </button>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <LiveMap height="h-[340px] md:h-[440px] lg:h-[480px]" focus={{ lat: 9.85, lng: -1.7, zoom: 7.3 }} live="Field sites" legend={[["#BBEA70", "Farming districts"]]}
            plots={FARMS.map((f) => ({ id: f.slug, name: f.name, coords: plotAround(f.lat, f.lng, 0.05, 0.012) }))}
            pins={[
              { id: "wa", lat: PLACES.wa.lat, lng: PLACES.wa.lng, kind: "farm", label: "Wa" },
              { id: "tamale", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, kind: "handover", icon: "warehouse", label: "Tamale" },
              { id: "tolon", lat: PLACES.tolon.lat, lng: PLACES.tolon.lng, kind: "farm", label: "Tolon" },
            ]}
            active={active} />
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Farmers: app demo with language pills ---------- */
export function FarmerApp() {
  const [lang, setLang] = useState("Dagbani");
  return (
    <Section id="app" className="grid gap-12 lg:grid-cols-[1fr_520px] lg:items-center lg:gap-20">
      <div className="flex flex-col gap-5">
        <Reveal><span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-leaf"><span className="h-1.5 w-1.5 rounded-full bg-leaf" />The farmer app</span></Reveal>
        <SplitIn text="Works without internet, in your language" className={cx(T.h2, "text-deep")} />
        <Reveal delay={0.1}><p className={cx(T.lead, "max-w-[640px] text-muted")}>Record harvests, see offers and check payments even with no signal. Everything syncs when you are back online.</p></Reveal>
        <Reveal delay={0.2}><Pills items={[...LANGS]} value={lang} onChange={setLang} size="S" className="flex-wrap" /></Reveal>
      </div>
      <Reveal delay={0.15} y={32} className="flex justify-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-[300px] rounded-[44px] bg-night p-2.5 shadow-[var(--shadow-3)] md:w-[320px]">
          <div className="flex h-[560px] flex-col gap-3 rounded-[36px] bg-white p-4 md:h-[600px]">
            <div className="flex items-center justify-between pt-1"><span className="text-[18px] font-semibold text-ink">Good morning, Amina</span><span className="rounded-full bg-mist px-2 py-1 text-[11px] font-semibold text-deep">{lang}</span></div>
            <div className="rounded-2xl bg-deep p-4 text-white">
              <div className="text-[13px] text-white/75">Money coming to you</div>
              <CountUp value="GH₵ 2,480" className="mt-1 block text-[24px] font-semibold" />
              <div className="mt-1 text-[13px] text-lime">Paid Friday by MoMo</div>
            </div>
            <div className="rounded-2xl bg-paper p-3.5">
              <div className="text-[15px] font-semibold">New offer to buy</div>
              <div className="mt-2.5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/products/tomatoes.jpg" alt="" className="h-11 w-11 rounded-xl object-cover mix-blend-multiply" style={{ background: "#FDE4DF" }} />
                <div className="min-w-0"><div className="text-[15px] font-semibold">Tomatoes · 400 kg</div><div className="truncate text-[12px] text-muted">GH₵ 9.50 a kg · Accra Fresh Market</div></div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-success-bg px-3 py-2.5 text-[13px] font-medium text-success"><Icon name="circle-check" size={16} />All records saved</div>
            <div className="mt-auto flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5 text-[12px] text-muted"><Icon name="wifi-off" size={14} />Offline. 3 harvests will sync later.</div>
          </div>
        </motion.div>
      </Reveal>
    </Section>
  );
}

/* ---------- Business: spend preview ---------- */
const SPEND: Record<string, { total: string; diff: string; values: number[]; market: number[]; tip: [string, string] }> = {
  October: { total: "GH₵ 48,620", diff: "↓ 8% vs market price", values: [41200, 43100, 42400, 44600, 45900, 45100, 46800, 47600, 48620], market: [45600, 46100, 47200, 48400, 49300, 50100, 51000, 51900, 52800], tip: ["GH₵ 48,620", "Oct 13"] },
  September: { total: "GH₵ 46,180", diff: "↓ 7% vs market price", values: [39800, 41200, 40600, 42900, 43400, 44100, 44800, 45600, 46180], market: [43900, 44400, 45100, 46000, 46700, 47300, 48100, 48900, 49600], tip: ["GH₵ 46,180", "Sep 30"] },
  August: { total: "GH₵ 44,950", diff: "↓ 9% vs market price", values: [38200, 39100, 40400, 40100, 41700, 42900, 43300, 44200, 44950], market: [42800, 43500, 44300, 44900, 45900, 46800, 47600, 48500, 49300], tip: ["GH₵ 44,950", "Aug 31"] },
};
export function SpendPreview() {
  const [month, setMonth] = useState("October");
  const [open, setOpen] = useState(false);
  const d = SPEND[month];
  return (
    <div className="rounded-3xl bg-white p-5 text-ink shadow-[var(--shadow-3)] md:p-6">
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold">Spend this month</span>
        <div className="relative">
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[14px] font-semibold text-deep transition-colors hover:bg-mint">{month}<motion.span animate={{ rotate: open ? 180 : 0 }}><Icon name="chevron-down" size={16} /></motion.span></button>
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.2, ease: EASE }} className="absolute right-0 top-11 z-10 flex w-40 flex-col rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)]">
                {Object.keys(SPEND).map((m) => <button key={m} onClick={() => { setMonth(m); setOpen(false); }} className={cx("rounded-xl px-3 py-2 text-left text-[14px] transition-colors", m === month ? "bg-mist font-semibold text-deep" : "hover:bg-paper")}>{m}</button>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <CountUp key={month} value={d.total} className="text-[32px] font-semibold tracking-[-0.02em] md:text-[36px]" />
        <span className="text-[14px] font-semibold text-leaf">{d.diff}</span>
      </div>
      <div className="mt-10">
        <AreaChart key={month} values={d.values} compare={d.market} labels={["Jun", "Jul", "Aug", "Sep", "Oct"]} tip={d.tip} height={140} fmt={(v) => cedi(v)} />
      </div>
      <div className="mt-4"><Legend items={[["#024639", "Verdant price"], ["#C9D3CE", "Market price"]]} /></div>
    </div>
  );
}

/* ---------- Trace your food: hero code form + journey card ---------- */
export function TraceForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  return (
    <div className="flex max-w-[600px] flex-col gap-3">
      <form onSubmit={(e) => { e.preventDefault(); router.push(R.trace(code.trim().toUpperCase() || JOURNEY.code)); }} className="glass-dark flex items-center gap-2 rounded-full p-1.5 pl-5">
        <Icon name="qr-code" size={20} className="shrink-0 text-lime" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. VF-TOM-00048" aria-label="Trace code" className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/60" />
        <button className="group/tb inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-lime px-4 text-[14px] font-semibold text-night transition-colors hover:bg-leaf-light md:px-5">Trace my food<Icon name="arrow-right" size={16} className="transition-transform group-hover/tb:translate-x-[3px]" /></button>
      </form>
      <p className="text-[14px] text-white/70">No code? Look for the QR sticker on your box or receipt. <Link href={R.traceSearch} className="font-semibold text-lime hover:underline">Scan with your camera</Link></p>
    </div>
  );
}
export function TraceCard() {
  const s = JOURNEY.steps;
  const shown = [0, 2, 4];
  const [step, setStep] = useState(4);
  return (
    <div className="glass-dark flex flex-col gap-3 rounded-3xl p-4">
      <div className="flex items-center gap-3 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/products/tomatoes.jpg" alt="" className="h-10 w-10 rounded-xl object-cover" />
        <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold">Vine tomatoes from Nyankpala</div><div className="text-[12px] text-lime">{JOURNEY.code}</div></div>
      </div>
      <LiveMap height="h-[170px]" rounded="rounded-2xl" controls={false} focus={{ lat: 7.6, lng: -0.6, zoom: 5.3 }}
        routes={[{ id: "r", coords: s.map((x) => [x.lng, x.lat]) }]}
        plots={[{ id: "a", coords: plotAround(9.4021, -0.9876, 0.05, 0.01) }]}
        pins={shown.map((i) => ({ id: String(i), lat: s[i].lat, lng: s[i].lng, kind: i === 0 ? "farm" : i === 4 ? "home" : "handover", label: s[i].title }))}
        active={String(step)} onPin={(id) => setStep(Number(id))} />
      <div className="flex flex-col">
        {shown.map((i) => (
          <button key={i} onClick={() => setStep(i)} className={cx("flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors", step === i ? "bg-white/10" : "hover:bg-white/5")}>
            <span className={cx("flex h-6 w-6 items-center justify-center rounded-full", step === i ? "bg-lime text-night" : "bg-forest text-lime")}><Icon name={s[i].icon} size={13} /></span>
            <span className="text-[13px] font-semibold">{i === 2 ? "Checked and packed" : s[i].title === "Delivered to you" ? "Delivered" : s[i].title}</span>
            <span className="text-[12px] text-white/65">{s[i].time}</span>
          </button>
        ))}
      </div>
      <Link href={R.trace()} className="inline-flex items-center gap-1.5 px-2 pb-1 text-[13px] font-semibold text-lime">See the full journey <Icon name="arrow-up-right" size={15} /></Link>
    </div>
  );
}

/* ---------- Contact ---------- */
const WHO = ["Shopper", "Business buyer", "Farmer", "Partner", "Journalist"];
export function ContactForm() {
  const toast = useToast();
  const [who, setWho] = useState("Business buyer");
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState<Record<string, boolean>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim(), phone = String(f.get("phone") ?? "").trim(), email = String(f.get("email") ?? "").trim(), msg = String(f.get("message") ?? "").trim();
    const next = { name: !name, phone: !phone && !email, email: !phone && !email, message: !msg };
    setErr(next);
    if (Object.values(next).some(Boolean)) { toast("Add your name, a phone or email, and a message.", "danger"); return; }
    setSent(name.split(" ")[0]);
    toast("Message sent. We reply within one working day.");
  };
  return (
    <div className="rounded-3xl bg-white p-6 md:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex min-h-[440px] flex-col items-start justify-center gap-5">
            <DrawnCheck />
            <h2 className={cx(T.h3, "text-deep")}>Thank you, {sent}.</h2>
            <p className="max-w-[460px] text-muted">We have your message and will reply within one working day. For anything urgent, call or WhatsApp us.</p>
            <div className="flex flex-wrap gap-3"><Button variant="secondary" size="M" onClick={() => setSent(null)}>Send another message</Button><Button href={R.help} variant="ghost" size="M" arrow>Visit the help centre</Button></div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-5">
            <h2 className={cx(T.h3, "text-deep")}>Send us a message</h2>
            <div className="grid gap-4 md:grid-cols-2"><Input label="Full name" name="name" placeholder="Ama Owusu" error={err.name} /><Input label="Phone number" name="phone" type="tel" placeholder="024 000 0000" error={err.phone} /></div>
            <Input label="Email address" name="email" type="email" placeholder="you@example.com" error={err.email} />
            <div className="flex flex-col gap-2.5"><span className="text-[14px] font-semibold text-ink">I am a</span><Pills items={WHO} value={who} onChange={setWho} size="S" className="flex-wrap" /></div>
            <Input label="Message" name="message" area placeholder="Tell us how we can help" error={err.message} />
            <div><Button type="submit" arrow>Send message</Button></div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
export function ContactMap() {
  return (
    <LiveMap height="h-[220px]" rounded="rounded-3xl" controls={false} focus={{ lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, zoom: 11.5 }}
      pins={[{ id: "hq", lat: PLACES.tamale.lat, lng: PLACES.tamale.lng, kind: "handover", icon: "building-2", label: "Tamale head office" }]} />
  );
}

/* ---------- Impact charts ---------- */
export function ImpactCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_440px] lg:items-start">
      <Reveal className="rounded-3xl bg-white p-5 md:p-7">
        <div className="text-[18px] font-semibold">Farmer income per season</div>
        <div className="mt-1 text-[13px] text-muted">Average per farmer, GH₵</div>
        <div className="mt-12"><AreaChart values={[3100, 3350, 3600, 3900, 4250, 4700, 5200, 5800]} compare={[3000, 3050, 3150, 3200, 3250, 3300, 3380, 3450]} labels={["2019", "2021", "2023", "2026"]} tip={["GH₵ 5,800", "2026"]} height={240} fmt={(v) => cedi(v)} /></div>
        <div className="mt-4"><Legend items={[["#024639", "Verdant farmers"], ["#C9D3CE", "District average"]]} /></div>
      </Reveal>
      <Reveal delay={0.1} className="rounded-3xl bg-white p-5 md:p-7">
        <div className="text-[18px] font-semibold">Where each cedi goes</div>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
          <Donut parts={[[62, "#024639"], [14, "#F7C33C"], [12, "#FF7006"], [12, "#5F9F0D"]]} size={150} label="62%" sub="to farmers" />
          <div className="flex-1"><Legend vertical items={[["#024639", "Farmer", "62%"], ["#F7C33C", "Transport", "14%"], ["#FF7006", "Packing", "12%"], ["#5F9F0D", "Verdant", "12%"]]} /></div>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- Stories: filter + grid ---------- */
export function StoriesGrid() {
  const toast = useToast();
  const [tag, setTag] = useState("All");
  const items = STORIES.filter((s) => tag === "All" || s.tag === tag);
  return (
    <Section id="latest" className="flex flex-col gap-8">
      <Pills items={["All", "Farmers", "Food", "Business", "News"]} value={tag} onChange={setTag} size="S" />
      <LayoutGroup>
        <motion.div layout className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((s, i) => (
              <motion.div key={s.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: Math.min(i, 8) * 0.06 } }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}>
                <StoryCard s={s} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      <div className="flex justify-center"><Button variant="secondary" size="M" onClick={() => toast("That is every story for now. A new one comes each week.", "info")}>Show more stories</Button></div>
    </Section>
  );
}

/* ---------- Newsletter ---------- */
export function Newsletter({ title, sub }: { title: string; sub: string }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  return (
    <Section bg="bg-deep" className="flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
      <Reveal className="flex flex-col gap-2"><h2 className={T.h2}>{title}</h2><p className="text-[18px] text-white/75">{sub}</p></Reveal>
      <Reveal delay={0.1} className="w-full lg:w-[520px]">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-full bg-forest p-1.5 pr-5"><DrawnCheck size={40} /><span className="font-semibold">You are on the list. See you next week.</span></motion.div>
          ) : (
            <motion.form key="f" exit={{ opacity: 0, y: -8 }} onSubmit={(e) => {
              e.preventDefault();
              const v = String(new FormData(e.currentTarget).get("email") ?? "");
              if (!/^\S+@\S+\.\S+$/.test(v)) { toast("Enter a valid email address.", "danger"); return; }
              setDone(true); toast("Subscribed. One story a week, no spam.");
            }} className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5">
              <input name="email" type="email" placeholder="Your email address" aria-label="Email" className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted" />
              <Button size="M" type="submit">Subscribe</Button>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </Section>
  );
}

/* ---------- Story article: share ---------- */
export function ShareBar({ title }: { title: string }) {
  const toast = useToast();
  const open = (kind: "facebook" | "linkedin" | "whatsapp") => {
    const url = encodeURIComponent(window.location.href), t = encodeURIComponent(title);
    const href = kind === "facebook" ? `https://www.facebook.com/sharer/sharer.php?u=${url}` : kind === "linkedin" ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}` : `https://wa.me/?text=${t}%20${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast("Link copied"); } catch { toast("Could not copy the link", "danger"); }
  };
  const items: [IconName, string, () => void][] = [["share-2", "Copy link", copy], ["facebook", "Share on Facebook", () => open("facebook")], ["linkedin", "Share on LinkedIn", () => open("linkedin")], ["message-circle", "Share on WhatsApp", () => open("whatsapp")]];
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[14px] text-muted">Share</span>
      {items.map(([i, l, f]) => <button key={l} onClick={f} aria-label={l} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-deep transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-mint active:scale-95"><Icon name={i} size={18} /></button>)}
    </div>
  );
}

/* ---------- Careers: filter + expandable roles ---------- */
export function RolesList() {
  const toast = useToast();
  const [group, setGroup] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const [applied, setApplied] = useState<Record<number, boolean>>({});
  const list = ROLES.map((r, i) => ({ r, i })).filter(({ r }) => group === "All" || r.group === group);
  return (
    <Section id="roles" bg="bg-paper" className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <Reveal><h2 className={cx(T.h2, "text-deep")}>Open roles</h2></Reveal>
        <Pills items={[`All · ${ROLES.length}`, "Field", "Packhouse", "Tech", "Sales"]} onChange={(v) => { setGroup(v.startsWith("All") ? "All" : v); setOpen(null); }} size="S" light />
      </div>
      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map(({ r, i }, n) => {
            const on = open === i;
            return (
              <motion.div key={i} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: Math.min(n, 8) * 0.04 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className={cx("rounded-2xl bg-white transition-shadow duration-300", on ? "shadow-[var(--shadow-2)]" : "hover:shadow-[var(--shadow-1)]")}>
                <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="group/role flex w-full flex-col gap-3 p-5 text-left md:flex-row md:items-center md:justify-between md:p-6">
                  <span><span className="block text-[18px] font-semibold text-ink transition-colors group-hover/role:text-deep">{r.title}</span><span className="text-[15px] text-muted">{r.team}</span></span>
                  <span className="flex items-center gap-2">
                    <Chip icon="map-pin" className="bg-mist text-deep">{r.place}</Chip>
                    <Chip className="bg-mist text-muted">{r.type}</Chip>
                    <motion.span animate={{ rotate: on ? 90 : 0 }} transition={{ duration: 0.25 }} className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep text-white transition-colors group-hover/role:bg-forest md:ml-2"><Icon name="arrow-right" size={18} /></motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                      <div className="flex flex-col gap-4 border-t border-line px-5 pb-6 pt-5 md:flex-row md:items-end md:justify-between md:px-6">
                        <p className="max-w-[720px] text-muted">{r.about}</p>
                        <div className="flex shrink-0 gap-2">
                          <Button href={R.contact} variant="ghost" size="M">Ask a question</Button>
                          {applied[i]
                            ? <span className="inline-flex h-10 items-center gap-2 rounded-full bg-success-bg px-5 text-[14px] font-semibold text-success"><Icon name="check" size={16} />Interest sent</span>
                            : <Button size="M" arrow onClick={() => { setApplied((a) => ({ ...a, [i]: true })); toast(`Thanks. We will text you about the ${r.title.toLowerCase()} role in ${r.place}.`); }}>Apply for this role</Button>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}

/* ---------- Help / 404 search ---------- */
export function SiteSearch({ placeholder = "Search for an answer, e.g. refund", popular }: { placeholder?: string; popular?: [string, string][] }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      <form onSubmit={(e) => { e.preventDefault(); if (!q.trim()) { toast("Type what you are looking for first.", "info"); return; } router.push(R.search(q.trim())); }} className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[var(--shadow-2)]">
        <Icon name="search" size={20} className="shrink-0 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted" />
        <Button size="M" type="submit">Search</Button>
      </form>
      {popular && (
        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <span className="text-white/75">Popular:</span>
          {popular.map(([l, h]) => <Link key={l} href={h} className="glass rounded-full px-3 py-1.5 font-medium text-white transition-colors hover:bg-white/25">{l}</Link>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Legal: tabs, contents, sections ---------- */
export function LegalBody() {
  const tabs = Object.keys(LEGAL);
  const [tab, setTab] = useState(tabs[0]);
  const doc = LEGAL[tab];
  const [active, setActive] = useState(doc.sections[0].id);
  useEffect(() => {
    setActive(doc.sections[0].id);
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-20% 0px -65% 0px" });
    // Wait for the outgoing tab to finish its exit so we observe the new sections.
    const t = setTimeout(() => doc.sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); }), 400);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [doc]);
  const go = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <>
      <div className="bg-mist"><Container><Tabs items={tabs} value={tab} onChange={setTab} /></Container></div>
      <Section className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-20" tight>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <LayoutGroup id="legal-toc">
            <nav aria-label="Contents" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:rounded-3xl lg:bg-paper lg:p-3">
              {doc.sections.map((s) => (
                <button key={s.id} onClick={() => go(s.id)} className={cx("relative shrink-0 rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors", active === s.id ? "font-semibold text-deep" : "text-muted hover:text-ink")}>
                  {active === s.id && <motion.span layoutId="toc" className="absolute inset-0 rounded-xl bg-mist lg:bg-white" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{s.title}</span>
                </button>
              ))}
            </nav>
          </LayoutGroup>
        </aside>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="flex min-w-0 flex-col gap-8">
            <p className="text-[14px] text-muted">{doc.updated}</p>
            {doc.sections.map((s) => s.list ? (
              <section key={s.id} id={s.id} className="scroll-mt-28 rounded-3xl bg-mist p-6 md:p-7">
                <h2 className={cx(T.h4, "text-deep")}>{s.title}</h2>
                <ul className="mt-4 flex flex-col gap-4">{s.list.map((l) => <li key={l} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name="check" size={16} /></span><span>{l}</span></li>)}</ul>
              </section>
            ) : (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className={cx(T.h4, "text-ink")}>{s.title}</h2>
                {s.text?.map((t) => <p key={t} className="mt-3 max-w-[820px] text-muted">{t}</p>)}
              </section>
            ))}
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6"><span className="text-muted">Questions about this page?</span><Button href={R.contact} variant="secondary" size="M" arrow>Contact us</Button></div>
          </motion.div>
        </AnimatePresence>
      </Section>
    </>
  );
}

