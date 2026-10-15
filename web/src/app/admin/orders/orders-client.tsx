"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { SwapIn, AdminTable, AdminTabs } from "@/components/admin/table-kit";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { ADM, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Button, KV, ProofChip, Status } from "@/components/ui";
import { TINT } from "@/lib/data";
import { ADMIN_ORDERS, ORDER_TONE, type AdminOrder, type OrderStatus } from "@/lib/data-admin";
import { R } from "@/lib/routes";

const TABS: [string, number?][] = [["All"], ["To pack", 12], ["On the way", 31], ["Delivered"], ["Problems", 3]];
const MATCH: Record<string, OrderStatus[] | null> = { All: null, "To pack": ["To pack", "Packing"], "On the way": ["On the way"], Delivered: ["Delivered"], Problems: ["Unpaid", "Refund asked"] };
const STEP: Record<OrderStatus, number> = { "To pack": 1, Packing: 2, "On the way": 3, Delivered: 4, Unpaid: 4, "Refund asked": 4 };
const STEPS = ["Confirmed", "Packing", "On the way", "Delivered"];

function Stepper({ at }: { at: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const n = i + 1, done = n < at, on = n === at;
        return (
          <div key={s} className={cx("flex items-center gap-2", i < STEPS.length - 1 && "flex-1")}>
            <motion.span layout className={cx("relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-300", done ? "bg-leaf text-white" : on ? "bg-deep text-white" : "bg-paper text-muted")}>
              {done ? <Icon name="check" size={14} /> : n}
            </motion.span>
            {on && <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="whitespace-nowrap text-[14px] font-semibold">{s}</motion.span>}
            {i < STEPS.length - 1 && (
              <span className="relative h-[2px] min-w-4 flex-1 overflow-hidden rounded-full bg-line">
                <motion.span className="absolute inset-0 origin-left bg-leaf" initial={false} animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE }} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrdersClient() {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>(ADMIN_ORDERS);
  const [tab, setTab] = useState("All");
  const [sel, setSel] = useState("2040");
  const rows = useMemo(() => orders.filter((o) => !MATCH[tab] || MATCH[tab]!.includes(o.status)), [orders, tab]);
  const o = orders.find((x) => x.id === sel) ?? orders[0];
  const packable = o.status === "To pack" || o.status === "Packing";

  const pick = (t: string) => {
    setTab(t);
    const first = orders.find((x) => !MATCH[t] || MATCH[t]!.includes(x.status));
    if (first && !(MATCH[t] ?? [o.status]).includes(o.status)) setSel(first.id);
  };
  const markPacked = () => {
    setOrders((all) => all.map((x) => (x.id === o.id ? { ...x, status: "On the way" } : x)));
    toast(`Order #${o.id} packed and handed to deliveries`);
  };

  return (
    <PortalShell cfg={ADM} active="Orders" title="Orders" sub="146 today · 12 waiting to pack"
      actions={<>
        <Button variant="light" size="M" onClick={() => toast("Today's orders exported as CSV")}>Export</Button>
        <Button size="M" arrow onClick={() => toast("Draft order #2042 started", "info")}>New order</Button>
      </>}>
      <AdminTabs items={TABS} value={tab} onChange={pick} />
      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
        <Panel className="!p-3 md:!p-4">
          <AdminTable sel={sel} onSel={setSel} empty="No orders in this view"
            cols={[["Order", "0.9fr"], ["Customer", "2fr"], ["Items", "0.7fr"], ["Total", "1.1fr"], ["Status", "1.3fr"]]}
            rows={rows.map((x) => ({ key: x.id, cells: [`#${x.id}`, x.customer, x.items, `GH₵ ${x.total.toLocaleString("en-GH")}`, <Status key="s" tone={ORDER_TONE[x.status]}>{x.status}</Status>] }))} />
        </Panel>

        <Panel className="lg:sticky lg:top-24">
          <SwapIn k={o.id} className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold">#{o.id} · {o.customer}</h2>
              <Link href={R.adminDeliveries} className="shrink-0 text-[14px] font-semibold text-leaf hover:text-deep">Open</Link>
            </div>
            <Stepper at={STEP[o.status]} />
            <div className="flex flex-col gap-4">
              {o.lines.map((l, i) => (
                <motion.div key={l.code + i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: TINT[l.img] }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/products/${l.img}.jpg`} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">{l.name} · {l.qty}</div>
                    <Link href={R.trace(l.code)} className="text-[13px] font-medium text-leaf hover:text-deep">{l.code}</Link>
                  </div>
                  <span className="hidden sm:inline-flex"><ProofChip level={l.proof} /></span>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 border-t border-line pt-4"><KV k="Delivery" v={o.delivery} /><KV k="Payment" v={o.payment} /></div>
            <div className="flex flex-wrap items-center gap-2">
              {packable
                ? <Button size="M" arrow onClick={markPacked} className="flex-1">Mark packed</Button>
                : <Button size="M" variant="secondary" href={R.adminDeliveries} arrow className="flex-1">Track delivery</Button>}
              <Button size="M" variant="ghost" icon="printer" onClick={() => toast(`${o.lines.length} labels sent to the packhouse printer`)}>Print labels</Button>
            </div>
          </SwapIn>
        </Panel>
      </div>
    </PortalShell>
  );
}
