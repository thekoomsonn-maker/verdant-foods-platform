"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Card } from "@/components/site/account";
import { Input } from "@/components/account/auth";
import { Switch } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";
import { USER } from "@/lib/data-account";

const ALERTS: [string, string, string, boolean][] = [
  ["orders", "Order updates", "Packed, on the way, delivered", true],
  ["box", "Weekly box reminder", "Sunday, before the edit deadline", true],
  ["safety", "Safety alerts", "If a batch you bought is recalled", true],
  ["offers", "Offers and new harvests", "About once a week", false],
];
const LANGS = ["English", "Twi", "Ga", "Ewe", "Dagbani"];

export function Settings() {
  const toast = useToast();
  const [me, setMe] = useState({ name: USER.name, phone: USER.phone, email: USER.email, lang: "English" });
  const [saved, setSaved] = useState(me);
  const [st, setSt] = useState<Record<string, boolean>>(() => Object.fromEntries(ALERTS.map(([k, , , v]) => [k, v])));
  const [via, setVia] = useState<Record<string, boolean>>({ SMS: true, WhatsApp: true, Email: false });
  const [confirm, setConfirm] = useState(false);
  const dirty = JSON.stringify(me) !== JSON.stringify(saved);

  const toggle = (k: string, t: string, v: boolean) => {
    setSt((s) => ({ ...s, [k]: v }));
    if (k === "safety" && !v) toast("Safety alerts off. You will not hear about recalls.", "danger");
    else toast(`${t} ${v ? "on" : "off"}`, v ? "success" : "info");
  };
  const channel = (c: string) => {
    const on = !via[c];
    if (!on && Object.values(via).filter(Boolean).length === 1) { toast("Keep at least one way to reach you", "info"); return; }
    setVia((x) => ({ ...x, [c]: on }));
    toast(`${c} ${on ? "added" : "removed"}`, on ? "success" : "info");
  };

  return (
    <>
      <Card>
        <h2 className="text-[18px] font-semibold md:text-[20px]">Profile</h2>
        <form className="flex flex-col gap-4" noValidate onSubmit={(e) => {
          e.preventDefault();
          if (me.name.trim().length < 2) { toast("Add your full name", "danger"); return; }
          if (!/^\S+@\S+\.\S+$/.test(me.email)) { toast("That email address does not look right", "danger"); return; }
          if (!dirty) { toast("Nothing has changed", "info"); return; }
          setSaved(me); toast(me.lang !== saved.lang && me.lang !== "English" ? `Saved. Messages in ${me.lang} are coming soon; English until then.` : "Your profile is saved");
        }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" value={me.name} onChange={(v) => setMe({ ...me, name: v })} autoComplete="name" />
            <Input label="Phone" value={me.phone} onChange={(v) => setMe({ ...me, phone: v })} inputMode="tel" autoComplete="tel" />
            <Input label="Email" value={me.email} onChange={(v) => setMe({ ...me, email: v })} type="email" inputMode="email" autoComplete="email" />
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold">Language</span>
              <span className="relative flex h-[52px] items-center rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-deep">
                <select value={me.lang} onChange={(e) => setMe({ ...me, lang: e.target.value })} className="h-full w-full appearance-none bg-transparent text-[16px] outline-none">
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <Icon name="chevron-down" size={18} className="pointer-events-none shrink-0 text-muted" />
              </span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="M">Save changes</Button>
            <AnimatePresence>{dirty && <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[13px] text-muted">Unsaved changes</motion.span>}</AnimatePresence>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-[18px] font-semibold md:text-[20px]">Alerts</h2>
        <div className="flex flex-col">
          {ALERTS.map(([k, t, d]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0"><div className="text-[15px] font-semibold">{t}</div><div className="text-[13px] text-muted">{d}</div></div>
              <Switch on={st[k]} label={t} onChange={(v) => toggle(k, t, v)} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[14px] text-muted">Send by</span>
          {Object.keys(via).map((c) => (
            <button key={c} onClick={() => channel(c)} aria-pressed={via[c]} className={cx("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition-colors duration-200", via[c] ? "bg-deep text-white" : "bg-mist text-deep hover:bg-mint")}>
              <AnimatePresence initial={false}>{via[c] && <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden"><Icon name="check" size={14} /></motion.span>}</AnimatePresence>
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-[18px] font-semibold md:text-[20px]">Your data</h2>
        <p className="text-[14px] text-muted">See, download or delete what we hold about you.</p>
        <AnimatePresence mode="wait" initial={false}>
          {confirm ? (
            <motion.div key="c" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 rounded-2xl bg-danger-bg p-4">
              <div className="font-semibold text-danger">Delete your account?</div>
              <p className="text-[14px]">Your name, addresses and payment details are removed. Order records stay with the farms for food safety, without your name.</p>
              <div className="flex flex-wrap gap-2"><Button size="M" variant="danger" onClick={() => { setConfirm(false); toast("Request received. We will confirm by SMS within 48 hours.", "info"); }}>Yes, delete it</Button><Button size="M" variant="ghost" onClick={() => setConfirm(false)}>Keep my account</Button></div>
            </motion.div>
          ) : (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
              <Button size="M" variant="secondary" onClick={() => toast(`We will email your data to ${saved.email} within a day`)}>Download my data</Button>
              <Button size="M" variant="ghost" onClick={() => setConfirm(true)}>Delete my account</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </>
  );
}
