"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Card } from "@/components/site/account";
import { useBag } from "@/components/site/bag";
import { CardHead, Thumb } from "@/components/account/bits";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { CountUp, Reveal, Stagger } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button, Status } from "@/components/ui";
import { cedi, farmBySlug, productImg, TINT, productBySlug } from "@/lib/data";
import { BOX, BUY_FROM, DELIVERY, farmCount, itemCount, ORDERS, orderProducts, STATUS_TONE } from "@/lib/data-account";
import { R } from "@/lib/routes";

const NEXT = ORDERS[0];
const LAST = ORDERS.find((o) => o.status === "Delivered")!;

export function NextDelivery() {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-deep p-4 text-white md:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-semibold text-lime">Next delivery</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-2.5 py-1 text-[13px] font-medium text-info"><span className="h-1.5 w-1.5 animate-breathe rounded-full bg-current" />On the way</span>
      </div>
      <div>
        <div className="text-[32px] font-medium leading-tight tracking-[-0.02em] md:text-[40px]">{NEXT.when}</div>
        <div className="mt-1 text-[14px] text-white/75">Order {NEXT.id} · {itemCount(NEXT)} items from {farmCount(NEXT)} farms</div>
      </div>
      <LiveMap height="h-[150px] md:h-[170px]" rounded="rounded-2xl" intro={false} controls={false} interactive={false}
        focus={{ lat: 5.596, lng: -0.146, zoom: 11.4 }}
        routes={[{ id: "r", coords: DELIVERY.route }]}
        pins={[{ id: "home", lat: DELIVERY.door.lat, lng: DELIVERY.door.lng, kind: "home" }]}
        vans={[{ id: "v", route: DELIVERY.route.slice(3), speed: 0.025 }]} />
      <div className="flex flex-wrap gap-3"><Button href={R.tracking(NEXT.id)} variant="lime" size="M" arrow>Track order</Button></div>
    </section>
  );
}

export function BoxCard() {
  const toast = useToast();
  const [skipped, setSkipped] = useState(false);
  const box = productBySlug("family-box");
  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-sun-soft p-4 md:p-6">
      <div><div className="text-[14px] text-muted">Weekly box</div><div className="mt-1 text-[20px] font-semibold">{BOX.name}</div></div>
      <div className="overflow-hidden rounded-2xl" style={{ background: TINT[box.img] }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={productImg(box)} alt="" className="h-[140px] w-full object-cover mix-blend-multiply transition-transform duration-700 hover:scale-105" />
      </div>
      <div className="flex flex-col gap-2 text-[14px]">
        <div className="flex justify-between"><span className="text-muted">Next box</span>
          <AnimatePresence mode="wait" initial={false}><motion.span key={String(skipped)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-semibold">{(skipped ? BOX.upcoming[2] : BOX.upcoming[0]).long}</motion.span></AnimatePresence>
        </div>
        <div className="flex justify-between"><span className="text-muted">Price</span><span className="font-semibold tabular">{cedi(BOX.sizes[1].price)} / week</span></div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button href={R.myBox} size="M">Change items</Button>
        <Button size="M" variant="light" onClick={() => { setSkipped(!skipped); toast(skipped ? `Your box is back on for ${BOX.upcoming[0].date}` : `Skipped. Your next box comes on ${BOX.upcoming[2].date}`); }}>{skipped ? "Undo skip" : "Skip a week"}</Button>
      </div>
    </section>
  );
}

function Reorder({ id }: { id: string }) {
  const { add } = useBag();
  const toast = useToast();
  const ref = useRef<HTMLButtonElement>(null);
  const o = ORDERS.find((x) => x.id === id)!;
  return (
    <button ref={ref} onClick={() => { orderProducts(o).forEach((p, i) => setTimeout(() => add(p, i === 0 ? ref.current : null), i * 60)); toast(`${o.lines.length} items from ${o.id} added to your bag`); }}
      className="text-[14px] font-semibold text-leaf transition-colors hover:text-deep">Reorder</button>
  );
}

export function RecentOrders() {
  return (
    <Card>
      <CardHead title="Recent orders" href={R.orders} link="All orders" />
      <Stagger className="flex flex-col" gap={0.05} y={10}>
        {ORDERS.filter((o) => o.status === "Delivered").slice(0, 3).map((o) => (
          <div key={o.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <Thumb p={orderProducts(o)[0]} size={44} />
            <Link href={R.tracking(o.id)} className="min-w-0 flex-1"><div className="truncate font-semibold hover:text-deep">Order {o.id}</div><div className="text-[13px] text-muted">{o.date} · {itemCount(o)} items</div></Link>
            <span className="hidden sm:inline-flex"><Status tone={STATUS_TONE[o.status]}>{o.status}</Status></span>
            <Reorder id={o.id} />
          </div>
        ))}
      </Stagger>
    </Card>
  );
}

export function Farms() {
  return (
    <Card>
      <CardHead title="Farms you buy from" href={R.saved} link="See all" />
      <Stagger className="flex flex-col gap-2.5" gap={0.05} y={10}>
        {BUY_FROM.map((f) => (
          <Link key={f.slug} href={R.farm(f.slug)} className={cx("group/f flex items-center gap-3 rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5", f.tint)}>
            <Icon name="sprout" size={20} className="text-deep" />
            <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{farmBySlug(f.slug).name}</span><span className="block text-[13px] text-muted">{f.grows} · {f.orders} orders</span></span>
            <Icon name="chevron-right" size={18} className="text-muted transition-transform group-hover/f:translate-x-0.5" />
          </Link>
        ))}
      </Stagger>
    </Card>
  );
}

export function FreshBanner() {
  return (
    <Reveal className="flex flex-col gap-4 rounded-[20px] bg-lime-soft p-5 md:flex-row md:items-center md:p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name="timer" size={22} /></span>
      <div className="flex-1">
        <div className="text-[16px] font-semibold text-deep md:text-[17px]">Your last order reached you <CountUp value={`${LAST.hoursFromHarvest} hours`} /> after harvest</div>
        <div className="text-[14px] text-muted">Faster than 80% of Verdant orders this month.</div>
      </div>
      <Button href={R.trace()} size="M" arrow className="w-fit">See the journey</Button>
    </Reveal>
  );
}
