"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { PortalShell, ADM, Panel } from "../portal/shell";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { useToast } from "../toast";
import { DELIVERY_RULES, PROVIDERS, RULES, RULE_TOGGLES } from "@/lib/data-admin-ops";
import { R } from "@/lib/routes";
import { ActionPill, Switch, ValueField } from "./widgets";

type State = { v: Record<string, string>; t: Record<string, boolean>; p: boolean[]; c: { name: string; office: string; email: string } };
const INITIAL: State = {
  v: Object.fromEntries([...RULES, ...DELIVERY_RULES].map((r) => [r.k, r.v])),
  t: Object.fromEntries(RULE_TOGGLES.map((r) => [r.k, r.on])),
  p: PROVIDERS.map((p) => p.on),
  c: { name: "Verdant Foods Ltd.", office: "Tamale, Northern Region", email: "privacy@verdantfoods.com.gh" },
};

function Line({ t, s, children }: { t: string; s: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><div className="min-w-0"><div className="text-[15px] font-semibold">{t}</div><div className="text-[13px] text-muted">{s}</div></div>{children}</div>;
}
function Text({ label, icon, value, onChange }: { label: string; icon?: "map-pin" | "mail"; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold">{label}</span>
      <span className="flex h-[52px] items-center gap-2.5 rounded-xl bg-paper px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-deep focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)]">
        {icon && <Icon name={icon} size={18} className="shrink-0 text-muted" />}
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-[16px] outline-none" />
      </span>
    </label>
  );
}

export function AdminSettings() {
  const toast = useToast();
  const [saved, setSaved] = useState(INITIAL);
  const [s, set] = useState(INITIAL);
  const changes = useMemo(() => {
    let n = 0;
    for (const k in s.v) if (s.v[k] !== saved.v[k]) n++;
    for (const k in s.t) if (s.t[k] !== saved.t[k]) n++;
    s.p.forEach((x, i) => { if (x !== saved.p[i]) n++; });
    for (const k of ["name", "office", "email"] as const) if (s.c[k] !== saved.c[k]) n++;
    return n;
  }, [s, saved]);
  const val = (k: string) => (v: string) => set((x) => ({ ...x, v: { ...x.v, [k]: v } }));
  const co = (k: keyof State["c"]) => (v: string) => set((x) => ({ ...x, c: { ...x.c, [k]: v } }));

  const save = () => {
    if (!changes) { toast("Nothing to save. Everything is up to date.", "info"); return; }
    if (Object.values(s.v).some((v) => v === "" || Number.isNaN(Number(v)))) { toast("Fill in every value before saving", "danger"); return; }
    setSaved(s); toast(`${changes} ${changes === 1 ? "change" : "changes"} saved. The apps update on next sync.`);
  };

  return (
    <PortalShell cfg={ADM} active="Settings" title="Settings" sub="Rules the whole platform follows."
      actions={
        <div className="flex items-center gap-3">
          {changes > 0 && <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="text-[13px] text-muted tabular">{changes} unsaved</motion.span>}
          <ActionPill onClick={save} className={cx(changes > 0 && "shadow-[0_0_0_4px_rgb(187_234_112/0.6)]")}>Save</ActionPill>
        </div>
      }>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <Panel title="Traceability rules">
            <div className="flex flex-col gap-5">
              {RULES.map((r) => <Line key={r.k} t={r.t} s={r.s}><ValueField label={r.t} value={s.v[r.k]} onChange={val(r.k)} unit={r.unit} /></Line>)}
              {RULE_TOGGLES.map((r) => <Line key={r.k} t={r.t} s={r.s}><Switch label={r.t} on={s.t[r.k]} onChange={(v) => set((x) => ({ ...x, t: { ...x.t, [r.k]: v } }))} /></Line>)}
            </div>
          </Panel>
          <Panel title="Delivery" link={["Edit zones", R.delivery]}>
            <div className="flex flex-col gap-5">
              {DELIVERY_RULES.map((r) => <Line key={r.k} t={r.t} s={r.s}><ValueField label={r.t} value={s.v[r.k]} onChange={val(r.k)} pre={r.pre} unit={r.unit} /></Line>)}
            </div>
          </Panel>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <Panel title="Payment providers">
            <div className="flex flex-col gap-4">
              {PROVIDERS.map((p, i) => (
                <Line key={p.t} t={p.t} s={p.s}>
                  <Switch label={p.t} on={s.p[i]} onChange={(v) => set((x) => ({ ...x, p: x.p.map((y, j) => (j === i ? v : y)) }))} />
                </Line>
              )).map((el, i) => <div key={i} className="flex items-center gap-3"><span className={cx("h-10 w-10 shrink-0 rounded-xl transition-opacity duration-200", PROVIDERS[i].c, !s.p[i] && "opacity-40")} /><div className="flex-1">{el}</div></div>)}
            </div>
          </Panel>
          <Panel title="Company">
            <Text label="Legal name" value={s.c.name} onChange={co("name")} />
            <Text label="Head office" icon="map-pin" value={s.c.office} onChange={co("office")} />
            <Text label="Data protection contact" icon="mail" value={s.c.email} onChange={co("email")} />
            <Link href={R.legal} className="text-[14px] font-semibold text-leaf hover:text-deep">Privacy and terms page</Link>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
