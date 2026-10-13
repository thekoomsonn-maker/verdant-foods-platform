"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { A1Table, A1Under } from "@/components/admin/a1-ui";
import { Donut, Legend } from "@/components/charts";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { ADM, DataTable, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Avatar, Button, Status } from "@/components/ui";
import { PAYMENTS_IN, PAYOUTS, type Payout } from "@/lib/data-admin1";
import { R } from "@/lib/routes";

const ced = (n: number) => `GH₵ ${n.toLocaleString("en-GH")}`;
const sum = (k: Payout["kind"]) => PAYOUTS.filter((p) => p.kind === k).reduce((a, p) => a + p.amount, 0);

export function PaymentsClient() {
  const toast = useToast();
  const [rows, setRows] = useState<(Payout & { live?: "Sending" })[]>(PAYOUTS);
  const [run, setRun] = useState<{ i: number; total: number } | null>(null);
  const [tab, setTab] = useState("Payouts");
  const [sel, setSel] = useState(PAYOUTS[0].name);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const queue = useRef<string[]>([]);

  const ready = rows.filter((r) => r.status === "Ready");
  const readySum = ready.reduce((a, r) => a + r.amount, 0);

  const start = () => {
    if (!ready.length || run) return;
    queue.current = ready.map((r) => r.name);
    setRun({ i: 0, total: queue.current.length });
    toast(`Sending ${queue.current.length} payouts, ${ced(readySum)} in all`, "info");
  };

  useEffect(() => {
    if (!run) return;
    const name = queue.current[run.i];
    if (!name) {
      const id = setTimeout(() => { setRun(null); toast(`${run.total} payouts sent. Farmers get an SMS receipt.`); }, 500);
      return () => clearTimeout(id);
    }
    setRows((rs) => rs.map((r) => (r.name === name ? { ...r, live: "Sending" } : r)));
    const id = setTimeout(() => {
      setRows((rs) => rs.map((r) => (r.name === name ? { ...r, live: undefined, status: "Paid" } : r)));
      setRun((s) => (s ? { ...s, i: s.i + 1 } : s));
    }, 700);
    return () => clearTimeout(id);
  }, [run, toast]);

  const pct = run ? Math.round((run.i / run.total) * 100) : 0;
  const tone = (r: (typeof rows)[number]) => (r.live ? "info" : r.status === "Paid" ? "success" : r.status === "Held" ? "danger" : "warning");

  return (
    <PortalShell cfg={ADM} active="Payments and payouts" title="Payments and payouts" sub="Money in from buyers, money out to farmers, groups and drivers"
      actions={<>
        <Button size="M" variant="light" icon="download" onClick={() => toast("Payment ledger exported for the accountant")}>Export</Button>
        <Button size="M" icon="banknote" onClick={start}>{run ? `Sending ${run.i + 1 > run.total ? run.total : run.i + 1} of ${run.total}` : ready.length ? "Run payouts" : "All paid"}</Button>
      </>}>
      <KpiRow>
        <Kpi l="Money in this week" v="GH₵ 214,600" d="12% up on last week" icon="wallet" spark={[5, 6, 5.4, 7, 6.6, 8, 8.4]} />
        <Kpi l="Waiting from buyers" v="GH₵ 38,400" d="1 invoice late" icon="hourglass" tone="warning" />
        <Kpi l="Payouts ready" v={ced(PAYOUTS.filter((p) => p.status === "Ready").reduce((a, p) => a + p.amount, 0))} d={`${PAYOUTS.filter((p) => p.status === "Ready").length} payees this week`} icon="hand-coins" tone="muted" />
        <Kpi l="Paid to farmers" v="GH₵ 412,800" d="This month, all on mobile money" icon="sprout" tone="deep" bg="bg-lime-soft" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:items-start">
        <Panel title="This week's payouts" link={["Reports", R.adminReports]}>
          <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
            <Donut parts={[[sum("Farmer"), "#024639"], [sum("Savings group"), "#BBEA70"], [sum("Driver"), "#FF7006"]]} size={170} label={`GH₵ ${Math.round((sum("Farmer") + sum("Savings group") + sum("Driver")) / 1000)}k`} sub="to pay out" />
            <div className="w-full"><Legend vertical items={[["#024639", "Farmers", ced(sum("Farmer"))], ["#BBEA70", "Savings groups", ced(sum("Savings group"))], ["#FF7006", "Drivers", ced(sum("Driver"))]]} /></div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold">{run ? "Sending payouts" : ready.length ? `${ready.length} ready to send` : "Everything is paid"}</span>
              <span className="tabular text-muted">{run ? `${pct}%` : ced(readySum)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <motion.div className="h-full rounded-full bg-leaf" initial={false} animate={{ width: run ? `${pct}%` : ready.length ? "0%" : "100%" }} transition={{ duration: 0.5, ease: EASE }} />
            </div>
            <p className="text-[13px] text-muted">Kumbungu Pepper Farm is held until their spray gap clears on 18 Oct.</p>
          </div>
        </Panel>

        <Panel>
          <A1Under items={["Payouts", "Payments in"]} value={tab} onChange={setTab} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {tab === "Payouts" ? (
                <A1Table sel={sel} onSel={setSel}
                  cols={[["Payee", "2fr"], ["Type", "1fr"], ["Method", "1.2fr"], ["Amount", "1fr"], ["Status", "0.9fr"]]}
                  rows={rows.map((r) => ({ key: r.name, cells: [
                    <span key="n" className="flex items-center gap-2.5"><Avatar initials={r.init} size={32} className={cx(r.kind === "Farmer" ? "bg-mist text-deep" : r.kind === "Driver" ? "bg-orange-soft text-orange" : "bg-lime-soft text-deep")} /><span className="truncate">{r.name}</span></span>,
                    r.kind, r.method, ced(r.amount),
                    <Status key="s" tone={tone(r)}>{r.live ?? r.status}</Status>,
                  ] }))} />
              ) : (
                <DataTable cols={[["From"], ["Ref", "14%"], ["Amount", "16%"], ["How", "16%"], ["When", "16%"], ["Status", "14%"]]}
                  rows={PAYMENTS_IN.map((p) => [
                    p.who, p.ref, ced(p.amount), p.how, p.when,
                    p.status === "Late"
                      ? <button key="s" onClick={() => { setReminded((m) => ({ ...m, [p.ref]: true })); toast(`Reminder sent to ${p.who} for ${p.ref}`); }} className="inline-flex">{reminded[p.ref] ? <Status tone="info">Reminded</Status> : <Status tone="danger">Late · remind</Status>}</button>
                      : <Status key="s" tone={p.tone}>{p.status}</Status>,
                  ])} />
              )}
            </motion.div>
          </AnimatePresence>
          <Link href={R.adminReports} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-leaf hover:text-deep">Monthly money report<Icon name="arrow-up-right" size={16} /></Link>
        </Panel>
      </div>
    </PortalShell>
  );
}
