import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { ORDERS } from "@/lib/data-account";
import { OrdersList } from "./orders-client";

export const metadata: Metadata = { title: "Your orders" };

export default function Orders() {
  return (
    <AccountShell active="Orders" title="Your orders" sub={`${ORDERS.length} orders since March · every one traced to the farm`}>
      <OrdersList />
    </AccountShell>
  );
}
