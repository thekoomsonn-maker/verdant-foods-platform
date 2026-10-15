"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell, ADM, Panel } from "../portal/shell";
import { Donut } from "../charts";
import { Tabs } from "../ui";
import { Icon, type IconName } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { ASSIGNEES, PROBLEM_COLORS, PROBLEMS, type Problem, type ProblemType } from "@/lib/data-admin-ops";
import { R } from "@/lib/routes";
import { ActionPill } from "./widgets";

const ME = "Akosua D.";
const TYPE_ICON: Record<ProblemType, IconName> = { Weight: "scale", "Farm checks": "badge-check", "Spray records": "spray-can", "Unmapped plots": "map-pin" };
const BG = { danger: "bg-danger-bg", warning: "bg-sun-soft", mist: "bg-mist" } as const;
const FG = { danger: "text-danger", warning: "text-warning", mist: "text-deep" } as const;

export function AdminProblems() {
  const toast = useToast();
  const router = useRouter();
  const [items, setItems] = useState(PROBLEMS);
  const [tab, setTab] = useState("All");
  const [menu, setMenu] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});

  const groups: [string, (p: Problem) => boolean][] = [["All", () => true], ["Urgent", (p) => p.urgent], ["This week", (p) => p.week], ["Assigned to me", (p) => p.who === ME]];
  const labels = groups.map(([g, f]) => `${g} · ${items.filter(f).length}`);
  const list = items.filter(groups.find(([g]) => tab.startsWith(g))![1]);
  const types = Object.keys(PROBLEM_COLORS) as ProblemType[];
  const counts = types.map((t) => list.filter((p) => p.type === t).length);

  const assign = (id: string, who: string) => { setItems((x) => x.map((p) => (p.id === id ? { ...p, who } : p))); setMenu(null); toast(`Assigned to ${who}`); };
  const act = (p: Problem) => {
    if (p.action === "Investigate") return router.push(R.adminWeights);
    if (p.action === "Assign") return setMenu(p.id);
    const msg = p.action === "Block lot" ? "Lot blocked. It can no longer be sold." : p.action === "Remind" ? `Reminder sent to ${p.who ?? "the officer"}` : "Message sent to the farmer by SMS";
    setDone((d) => ({ ...d, [p.id]: p.action === "Block lot" ? "Blocked" : "Sent" }));
    toast(msg);
  };

  return (
    <PortalShell cfg={ADM} active="Problems" title="Problems" sub="Everything that breaks trust, in one list."
      actions={<ActionPill variant="light" onClick={() => { const n = items.filter((p) => !p.who).length; setItems((x) => x.map((p) => (p.who ? p : { ...p, who: ME }))); toast(n ? `${n} problems assigned to you` : "Everything is already assigned", n ? "success" : "info"); }}>Assign all</ActionPill>}>
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[360px_1fr]">
        <Panel>
          <h2 className="text-[18px] font-semibold">{list.length} open</h2>
          <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
            <Donut key={tab + counts.join()} parts={types.map((t, i) => [counts[i] || 0.0001, PROBLEM_COLORS[t]] as [number, string])} size={170} label={String(list.length)} sub="open" />
            <div className="flex w-full flex-col gap-3">
              {types.map((t, i) => (
                <div key={t} className="flex items-center gap-2.5 text-[15px]">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: PROBLEM_COLORS[t] }} /><span className="text-muted">{t}</span>
                  <motion.span key={counts[i]} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-semibold tabular">{counts[i]}</motion.span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <Tabs key={labels.join()} items={labels} value={labels[groups.findIndex(([g]) => tab.startsWith(g))]} onChange={(v) => { setTab(v); setMenu(null); }} />
          <motion.div layout className="flex flex-col gap-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((p, i) => (
                <motion.div layout key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                  className={cx("relative flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center", BG[p.tone])}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Icon name={TYPE_ICON[p.type]} size={20} className={cx("shrink-0", FG[p.tone])} />
                    <div className="min-w-0"><div className="text-[15px] font-semibold">{p.t}</div><div className="text-[13px] text-muted">{p.s}</div></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Assignee p={p} open={menu === p.id} onOpen={() => setMenu(menu === p.id ? null : p.id)} onClose={() => setMenu(null)} onPick={(w) => assign(p.id, w)} />
                    <button onClick={() => act(p)} disabled={!!done[p.id]} className={cx("inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-[background-color,transform] duration-150 active:scale-[0.97]", done[p.id] ? "bg-white text-success" : "bg-deep text-white hover:bg-forest")}>
                      {done[p.id] ? <><Icon name="check" size={16} />{done[p.id]}</> : p.action}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {list.length === 0 && <p className="py-8 text-center text-muted">Nothing here. Good.</p>}
          </motion.div>
        </Panel>
      </div>
    </PortalShell>
  );
}

function Assignee({ p, open, onOpen, onClose, onPick }: { p: Problem; open: boolean; onOpen: () => void; onClose: () => void; onPick: (w: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  return (
    <div ref={ref} className="relative">
      <button onClick={onOpen} aria-expanded={open} className={cx("inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-[14px] transition-colors hover:bg-paper", p.who ? "text-ink" : "text-muted")}>
        <Icon name="user" size={16} />{p.who ?? "Unassigned"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.96, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
            className="absolute left-0 top-12 z-20 w-48 origin-top rounded-2xl bg-white p-1.5 shadow-[var(--shadow-2)] md:left-auto md:right-0">
            {ASSIGNEES.map((w) => (
              <button key={w} onClick={() => onPick(w)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-medium hover:bg-paper">{w}{p.who === w && <Icon name="check" size={16} className="text-success" />}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
