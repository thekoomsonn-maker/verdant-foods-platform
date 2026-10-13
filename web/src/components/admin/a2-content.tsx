"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PortalShell, ADM, Panel } from "../portal/shell";
import { Status, Tabs } from "../ui";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { BANNERS, CONTENT_STORIES, HERO_BACKGROUNDS } from "@/lib/data-admin2";
import { R } from "@/lib/routes";
import { ActionPill } from "./a2-ui";

const TABS = ["Home page", "Banners · 3", "Stories · 12", "Help · 24", "Pages · 9"];
const HELP = [["How do I track my order?", R.help], ["What does the QR code show?", R.traceInfo], ["Delivery areas and times", R.delivery], ["Paying with mobile money", R.help]] as const;
const PAGES = [["About Verdant", R.about], ["For farmers", R.farmers], ["For business", R.business], ["Impact", R.impact], ["Careers", R.careers], ["Privacy and terms", R.legal]] as const;

function Input({ label, value, onChange, icon, max = 80 }: { label: string; value: string; onChange: (v: string) => void; icon?: "play" | "calendar"; max?: number }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold">{label}</span>
      <span className="flex h-[52px] items-center gap-2.5 rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]">
        {icon && <Icon name={icon} size={18} className="shrink-0 text-muted" />}
        <input value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-[16px] outline-none" />
      </span>
    </label>
  );
}

export function A2Content() {
  const toast = useToast();
  const [tab, setTab] = useState(TABS[0]);
  const [head, setHead] = useState("Fresh from Ghana’s farms, traced to your table.");
  const [b1, setB1] = useState("Shop fresh");
  const [b2, setB2] = useState("Trace your food");
  const [bg, setBg] = useState(0);
  const [from, setFrom] = useState("Mon 13 Oct");
  const [saved, setSaved] = useState(true);
  const edit = <T,>(f: (v: T) => void) => (v: T) => { f(v); setSaved(false); };
  const words = head.trim().split(/\s+/).filter(Boolean);

  return (
    <PortalShell cfg={ADM} active="Website content" title="Website content" sub="Pages, banners and stories."
      actions={<ActionPill arrow onClick={() => { setTab(TABS[2]); toast("New story draft created", "info"); }}>New story</ActionPill>}>
      <Tabs key={tab === TABS[2] ? "s" : "x"} items={TABS} value={tab} onChange={setTab} />
      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.55fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: EASE }}>
            {tab === TABS[0] ? (
              <Panel>
                <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">Home page hero</h2><Link href={R.home} target="_blank" className="text-[14px] font-semibold text-leaf hover:text-deep">Preview</Link></div>
                {/* Live preview: updates as you type. */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-night md:aspect-[652/300]">
                  <AnimatePresence initial={false}>
                    <motion.img key={bg} src={HERO_BACKGROUNDS[bg].img} alt="" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-0 h-full w-full object-cover" />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(1_38_31/0)_30%,rgb(1_38_31/0.75))]" />
                  <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 md:inset-x-5 md:bottom-5">
                    <h3 className="max-w-[560px] text-[22px] font-semibold leading-[1.15] tracking-[-0.015em] text-white md:text-[30px]">
                      {words.length ? words.map((w, i) => <motion.span layout="position" key={i + w} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="inline-block whitespace-pre">{w}{i < words.length - 1 ? " " : ""}</motion.span>) : <span className="text-white/50">Add a headline</span>}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {b1 && <span className="rounded-full bg-lime px-4 py-2 text-[14px] font-semibold text-night">{b1}</span>}
                      {b2 && <span className="glass rounded-full px-4 py-2 text-[14px] font-semibold text-white">{b2}</span>}
                    </div>
                  </div>
                </div>
                <Input label="Headline" value={head} onChange={edit(setHead)} max={72} />
                <div className="-mt-2 text-right text-[12px] text-muted tabular">{head.length} of 72</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Button 1" value={b1} onChange={edit(setB1)} max={22} />
                  <Input label="Button 2" value={b2} onChange={edit(setB2)} max={22} />
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-semibold">Background</span>
                    <button onClick={() => { setBg((b) => (b + 1) % HERO_BACKGROUNDS.length); setSaved(false); }} className="flex h-[52px] items-center gap-2.5 rounded-xl bg-paper px-4 text-left text-[16px] transition-colors hover:bg-mist">
                      <Icon name="play" size={18} className="text-muted" /><span className="flex-1">{HERO_BACKGROUNDS[bg].file}</span><Icon name="refresh-cw" size={16} className="text-muted" />
                    </button>
                  </label>
                  <Input label="Show from" value={from} onChange={edit(setFrom)} icon="calendar" max={20} />
                </div>
                <div className="flex items-center gap-4">
                  <ActionPill onClick={() => { setSaved(true); toast("Home page hero published"); }}>Publish</ActionPill>
                  <button onClick={() => { setSaved(true); toast("Draft saved", "info"); }} className="text-[15px] font-semibold text-deep hover:text-leaf">Save draft</button>
                  <span className={cx("ml-auto text-[13px] transition-opacity", saved ? "opacity-0" : "text-muted opacity-100")}>Unsaved changes</span>
                </div>
              </Panel>
            ) : tab === TABS[1] ? <BannerList big /> : tab === TABS[2] ? <StoryList all /> : (
              <Panel title={tab.startsWith("Help") ? "Help articles" : "Pages"}>
                {(tab.startsWith("Help") ? HELP : PAGES).map(([t, h]) => (
                  <Link key={t} href={h} className="flex items-center justify-between gap-3 border-b border-line py-3 text-[15px] font-semibold last:border-0 hover:text-leaf">{t}<Icon name="arrow-up-right" size={18} className="text-muted" /></Link>
                ))}
              </Panel>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col gap-4 md:gap-6">
          {tab !== TABS[1] && <BannerList />}
          {tab !== TABS[2] && <StoryList />}
        </div>
      </div>
    </PortalShell>
  );
}

function BannerList({ big }: { big?: boolean }) {
  const toast = useToast();
  const [list, setList] = useState(BANNERS);
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">Banners</h2>
        <button onClick={() => { setList((l) => [...l, { t: "New banner", s: "Shop · draft", c: "bg-lime", status: "Draft" }]); toast("Banner added as a draft", "info"); }} className="text-[14px] font-semibold text-leaf hover:text-deep">Add</button></div>
      <AnimatePresence initial={false}>
        {list.map((b, i) => (
          <motion.div layout key={b.t + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex items-center gap-3">
            <span className={cx("shrink-0 rounded-xl", b.c, big ? "h-14 w-14" : "h-11 w-11")} />
            <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold">{b.t}</div><div className="text-[13px] text-muted">{b.s}</div></div>
            <Status tone={b.status === "Live" ? "success" : b.status === "Scheduled" ? "info" : "neutral"}>{b.status}</Status>
          </motion.div>
        ))}
      </AnimatePresence>
    </Panel>
  );
}

function StoryList({ all }: { all?: boolean }) {
  return (
    <Panel title="Stories" link={["All", R.stories]}>
      {CONTENT_STORIES.slice(0, all ? 6 : 3).map((s) => (
        <Link key={s.slug} href={R.story(s.slug)} className="group/s flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.img} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover/s:scale-105" />
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold group-hover/s:text-leaf">{s.title}</span>
          <Status tone={s.status === "Published" ? "success" : "neutral"}>{s.status}</Status>
        </Link>
      ))}
    </Panel>
  );
}
