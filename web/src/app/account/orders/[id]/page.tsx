import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/site/account";
import { farmCount, itemCount, orderById } from "@/lib/data-account";
import { Tracking } from "./tracking-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${decodeURIComponent(id).toUpperCase()}` };
}

export default async function OrderTracking({ params }: Props) {
  const { id } = await params;
  const o = orderById(decodeURIComponent(id));
  if (!o) notFound();
  const live = o.status === "On the way";
  return (
    <AccountShell active="Orders" title={`Order ${o.id}`} sub={`${live ? `Arriving ${o.when.replace("Today", "today")}` : `${o.status} ${o.when}`} · ${itemCount(o)} items from ${farmCount(o)} ${farmCount(o) === 1 ? "farm" : "farms"} · paid with MTN MoMo`}>
      <Tracking id={o.id} />
    </AccountShell>
  );
}
