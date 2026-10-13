import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { ORDERS, orderById } from "@/lib/data-account";
import { ReportForm } from "./report-client";

export const metadata: Metadata = { title: "Report a problem" };

export default async function Report({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const o = (order && orderById(order)?.status === "Delivered" ? orderById(order) : undefined) ?? ORDERS.find((x) => x.status === "Delivered")!;
  return (
    <AccountShell active="Orders" title="Report a problem" sub={`Order ${o.id} · delivered ${o.date}`}>
      <ReportForm orderId={o.id} />
    </AccountShell>
  );
}
