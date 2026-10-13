"use client";
import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Donut, Legend } from "@/components/charts";
import { Icon } from "@/components/icon";
import { DataTable, Panel } from "@/components/portal/shell";
import { Button } from "@/components/ui";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { ghs, StatusFor, Tween } from "@/components/b2b/kit";
import { INVOICES, type Invoice } from "@/lib/data-b2b";

export function PayNowButton() {
  const toast = useToast();
  return <Button size="M" arrow onClick={() => { document.getElementById("pay")?.scrollIntoView({ behavior: "smooth", block: "center" }); toast("Choose how to pay, then confirm below", "info"); }}>Pay now</Button>;
}

const LIMIT = 60000;
const METHODS: [string, string, string][] = [["Bank", "Bank transfer", "GCB · Verdant Foods Ltd"], ["MoMo", "MTN Mobile Money", "Merchant 448 120"], ["Card", "Business card", "Visa ending 4421"]];

export function InvoicesClient() {
  const toast = useToast();
  const [inv, setInv] = useState<Invoice[]>(INVOICES);
  const [method, setMethod] = useState("Bank");
  const used = inv.filter((i) => i.status !== "Paid").reduce((a, i) => a + i.amount, 0);
  const pct = Math.round((used / LIMIT) * 100);
  const pay = (ids: string[]) => {
    const amt = inv.filter((i) => ids.includes(i.id)).reduce((a, i) => a + i.amount, 0);
    if (!amt) return toast("Nothing left to pay", "info");
    setInv((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, status: "Paid" } : x)));
    toast(`${ghs(amt)} paid by ${METHODS.find((m) => m[0] === method)![1].toLowerCase()}. Receipt sent to finance.`);
  };
  const open = inv.filter((i) => i.status !== "Paid").map((i) => i.id);

  return (
    <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_360px]">
      <Panel className="self-start">
        <DataTable cols={[["Invoice"], ["Deliveries"], ["Amount"], ["Due"], ["Status"], ["", "120px"]]}
          rows={inv.map((i) => [i.id, i.week, <span key="a" className="tabular">{ghs(i.amount)}</span>, i.due, <StatusFor key="s" s={i.status} />,
            <span key="x" className="flex justify-end gap-1">
              {i.status !== "Paid" && <button onClick={() => pay([i.id])} className="h-9 rounded-full bg-deep px-3.5 text-[13px] font-semibold text-white hover:bg-forest">Pay</button>}
              <button onClick={() => toast(`${i.id} PDF is downloading`)} aria-label={`Download ${i.id}`} className="flex h-9 w-9 items-center justify-center rounded-full text-deep hover:bg-mist"><Icon name="download" size={17} /></button>
            </span>])} />
      </Panel>

      <Panel title="Credit limit" className="self-start">
        <div className="flex justify-center py-2">
          <div className="relative">
            <Donut key={pct} parts={[[used || 0.0001, "#F7C33C"], [LIMIT - used, "#F2F7F4"]]} size={180} />
            <div className="absolute inset-0 flex flex-col items-center justify-center"><Tween value={pct} fmt={(n) => `${Math.round(n)}%`} className="text-[28px] font-semibold" /><span className="text-[13px] text-muted">used</span></div>
          </div>
        </div>
        <Legend vertical items={[["#F7C33C", "Used", ghs(used)], ["#E2E8E4", "Available", ghs(LIMIT - used)]]} />
        <LayoutGroup id="pay-method">
          <div id="pay" className="flex flex-col gap-2">
            {METHODS.map(([k, t, s]) => {
              const on = k === method;
              return (
                <button key={k} onClick={() => setMethod(k)} aria-pressed={on} className="relative flex items-center gap-3 rounded-2xl p-3 text-left">
                  {on && <motion.span layoutId="pm" className="absolute inset-0 rounded-2xl bg-mist ring-2 ring-deep" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  <span className={cx("relative flex h-11 w-11 items-center justify-center rounded-xl text-[12px] font-semibold", on ? "bg-deep text-white" : "bg-paper text-deep")}>{k}</span>
                  <span className="relative flex-1"><span className="block text-[15px] font-semibold">{t}</span><span className="block text-[13px] text-muted">{s}</span></span>
                  <span className={cx("relative flex h-5 w-5 items-center justify-center rounded-full", on ? "bg-deep" : "bg-paper ring-1 ring-line-strong")}>{on && <span className="h-2 w-2 rounded-full bg-white" />}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <Button full onClick={() => pay(open)} arrow>{open.length ? `Pay ${ghs(used)}` : "All paid"}</Button>
      </Panel>
    </div>
  );
}
