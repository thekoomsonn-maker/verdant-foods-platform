"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { PortalShell, ADM, Panel, Kpi, KpiRow, DataTable } from "../portal/shell";
import { Avatar, Pills, Status } from "../ui";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { EASE } from "../motion";
import { useToast } from "../toast";
import { PEOPLE, PERMS, ROLES } from "@/lib/data-admin2";
import { ActionPill } from "./a2-ui";

export function A2Users() {
  const toast = useToast();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState(false);
  const [role, setRole] = useState("All");
  const [m, setM] = useState(() => PERMS.map(([, r]) => [...r]));
  const people = PEOPLE.filter((p) => role === "All" || p.role === role);

  const flip = (i: number, j: number) => {
    if (i === 4 && j === 0) { toast("Admins always keep payouts", "info"); return; }
    const next = !m[i][j];
    setM((x) => x.map((r, a) => (a === i ? r.map((v, b) => (b === j ? next : v)) : r)));
    toast(`${ROLES[j]} ${next ? "can now" : "can no longer"} ${PERMS[i][0].toLowerCase()}`, next ? "success" : "info");
  };

  return (
    <PortalShell cfg={ADM} active="Users and roles" title="Users and roles" sub="Staff, field officers and drivers."
      actions={<ActionPill arrow onClick={() => toast("Invite sent. They sign in with a code by SMS.")}>Invite</ActionPill>}>
      <KpiRow>
        <Kpi l="Staff" v="48" d="12 office · 36 field" icon="users" />
        <Kpi l="Field officers" v="22" d="Covering 7 districts" icon="user-check" tone="muted" />
        <Kpi l="Drivers" v="9" d="7 on shift" icon="truck" tone="muted" />
        <Kpi l="2-step sign-in" v="100%" d="Required for all" icon="lock" tone="deep" bg="bg-lime-soft" />
      </KpiRow>

      <Panel>
        <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">People</h2>
          <button onClick={() => setFilter((f) => !f)} aria-expanded={filter} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf hover:text-deep"><Icon name="list-filter" size={16} />Filter</button></div>
        <AnimatePresence initial={false}>
          {filter && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}><Pills items={["All", ...ROLES]} value={role} onChange={setRole} size="S" /></motion.div>}
        </AnimatePresence>
        <DataTable key={role} cols={[["Name", "38%"], ["Role"], ["Area"], ["Last active"], ["Status"]]} rows={people.map((p) => [
          <span key="n" className="inline-flex items-center gap-3"><Avatar initials={p.i} size={32} className={p.c} />{p.n}</span>,
          p.role, p.area, p.last, <Status key="s" tone={p.status === "Active" ? "success" : "warning"}>{p.status}</Status>,
        ])} />
      </Panel>

      <Panel title="What each role can do">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead><tr className="bg-paper">
              <th className="rounded-l-xl px-4 py-2.5 text-[13px] font-medium text-muted">Can</th>
              {ROLES.map((r, j) => <th key={r} className={cx("px-2 py-2.5 text-center text-[13px] font-medium text-muted md:text-left", j === ROLES.length - 1 && "rounded-r-xl")}>{r}</th>)}
            </tr></thead>
            <tbody>
              {PERMS.map(([can], i) => (
                <tr key={can} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{can}</td>
                  {ROLES.map((r, j) => {
                    const on = m[i][j];
                    return (
                      <td key={r} className="px-2 py-3 text-center md:text-left">
                        <button role="checkbox" aria-checked={on} aria-label={`${r}: ${can}`} onClick={() => flip(i, j)}
                          className={cx("relative inline-flex h-7 w-7 items-center justify-center rounded-full transition-[background-color,transform] duration-200 hover:scale-110 active:scale-95", on ? "bg-success text-white" : "bg-paper hover:bg-mist")}>
                          <AnimatePresence initial={false}>
                            {on && (
                              <motion.svg key="c" viewBox="0 0 16 16" className="absolute h-4 w-4" initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }}>
                                <motion.path d="M3.5 8.5 L6.5 11.5 L12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.05, ease: EASE }} />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-muted">Changes apply the next time each person opens the app.</p>
      </Panel>
    </PortalShell>
  );
}
