"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useBag } from "@/components/site/bag";
import { Thumb } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { Button, Status, Tabs } from "@/components/ui";
import { cedi } from "@/lib/data";
import { itemCount, ORDERS, orderProducts, STATUS_TONE, type Order } from "@/lib/data-account";
import { R } from "@/lib/routes";

const FILTERS: Record<string, (o: Order) => boolean> = {
  All: () => true,
  "On the way": (o) => o.status === "On the way",
  Delivered: (o) => o.status === "Delivered",
  Problems: (o) => o.status === "Refunded",
};

export function OrdersList() {
  const [f, setF] = useState("All");
  const list = ORDERS.filter(FILTERS[f]);
  return (
    <>
      <Tabs items={Object.keys(FILTERS)} value={f} onChange={setF} />
      <div className="flex flex-col gap-3 md:gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((o, i) => (
            <motion.div key={o.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.04 } }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}>
              <OrderCard o={o} />
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-[20px] bg-white py-12 text-center">
            <Icon name="circle-check" size={28} className="text-leaf" />
            <div className="font-semibold">No problems reported</div>
            <div className="text-[14px] text-muted">If something is wrong with an order, <Link href={R.report} className="font-semibold text-deep">tell us here</Link>.</div>
          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({ o }: { o: Order }) {
  const { add } = useBag();
  const toast = useToast();
  const ref = useRef<HTMLSpanElement>(null);
  const ps = orderProducts(o);
  const live = o.status === "On the way";
  const trace = ps.find((p) => p.trace)?.trace;
  const shown = ps.length > 4 ? ps.slice(0, 3) : ps;
  const more = itemCount(o) - shown.reduce((a, p) => a + p.qty, 0);
  return (
    <section className="group/o flex flex-col gap-4 rounded-[20px] bg-white p-4 transition-shadow duration-300 hover:shadow-[var(--shadow-1)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={R.tracking(o.id)} className="min-w-0">
          <div className="font-semibold transition-colors group-hover/o:text-deep">Order {o.id}</div>
          <div className="text-[13px] text-muted">{live ? "Today" : o.date} · {itemCount(o)} items</div>
        </Link>
        <Status tone={STATUS_TONE[o.status]}>{o.status}</Status>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Link href={R.tracking(o.id)} className="flex gap-2" aria-label={`Open order ${o.id}`}>
          {shown.map((p) => <Thumb key={p.slug} p={p} size={48} className="transition-transform duration-300 group-hover/o:-translate-y-0.5" />)}
          {more > 0 && <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist text-[13px] font-semibold text-deep">+{more}</span>}
        </Link>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-[17px] font-semibold tabular">{cedi(o.total)}</span>
          <span className="flex items-center gap-1" ref={ref}>
            {live && <Button href={R.tracking(o.id)} size="M" arrow>Track</Button>}
            {o.status === "Delivered" && (
              <>
                <Button size="M" variant="secondary" onClick={() => { ps.forEach((p, i) => add(p, i === 0 ? ref.current : null)); toast(`${ps.length} ${ps.length === 1 ? "item" : "items"} from ${o.id} added to your bag`); }}>Reorder</Button>
                <Button size="M" variant="ghost" href={trace ? R.trace(trace) : R.tracking(o.id)}>Trace</Button>
              </>
            )}
            {o.status === "Refunded" && <Button size="M" variant="ghost" href={R.tracking(o.id)}>See details</Button>}
          </span>
        </div>
      </div>
    </section>
  );
}
