"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Bars } from "@/components/charts";
import { EASE } from "@/components/motion";
import { ADM, DataTable, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { Avatar, Button, Status } from "@/components/ui";
import { GROUPS, WEEKLY_SAVINGS } from "@/lib/data-admin1";

export function GroupsClient() {
  const toast = useToast();
  const [synced, setSynced] = useState<Record<string, boolean>>(Object.fromEntries(GROUPS.map((g) => [g.name, g.synced])));
  const remind = (name: string) => {
    toast(`Sync request sent to ${name}'s phone`, "info");
    setTimeout(() => { setSynced((s) => ({ ...s, [name]: true })); toast(`${name} meeting record synced`); }, 2200);
  };
  return (
    <PortalShell cfg={ADM} active="Savings groups" title="Savings groups" sub="20 groups · 1,400 members"
      actions={<Button size="M" arrow onClick={() => toast("New group form sent to the field officers' app")}>Add group</Button>}>
      <KpiRow>
        <Kpi l="Saved this cycle" v="GH₵ 186,400" d="+GH₵ 12,800 this week" icon="piggy-bank" />
        <Kpi l="Out on loan" v="GH₵ 92,100" d="4% late" icon="hand-coins" tone="warning" />
        <Kpi l="Meetings synced" v="18 of 20" d="2 waiting for signal" icon="refresh-cw" tone="muted" />
        <Kpi l="Members" v="1,400" d="86% women" icon="users" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Panel title="Weekly savings, all groups" link={["This cycle"]}>
          <Bars values={WEEKLY_SAVINGS} labels={WEEKLY_SAVINGS.map((_, i) => String(i + 1))} hi={WEEKLY_SAVINGS.length - 1} height={180} />
        </Panel>
        <Panel title="Meeting records" link={["Today"]}>
          <div className="flex flex-col">
            {GROUPS.slice(0, 4).map((g, i) => (
              <motion.div key={g.name} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
                className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <Avatar initials={g.init} size={36} />
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{g.name}</div><div className="text-[13px] text-muted">{g.meeting}</div></div>
                {synced[g.name]
                  ? <Status tone="success">Synced</Status>
                  : <button onClick={() => remind(g.name)} className="rounded-full transition-transform active:scale-[0.97]" aria-label={`Ask ${g.name} to sync`}><Status tone="warning">Waiting</Status></button>}
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-3"><h2 className="text-[18px] font-semibold">All groups</h2><button onClick={() => toast("Group list exported as CSV")} className="text-[14px] font-semibold text-leaf hover:text-deep">Export</button></div>
        <DataTable cols={[["Group"], ["District", "16%"], ["Members", "12%"], ["Savings", "16%"], ["Late loans", "12%"]]}
          rows={GROUPS.map((g) => [g.name, g.district, g.members, `GH₵ ${g.savings.toLocaleString("en-GH")}`, g.late ? <span key="l" className="font-semibold text-warning">{g.late}</span> : "0"])} />
      </Panel>
    </PortalShell>
  );
}
