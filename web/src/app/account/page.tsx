import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { USER } from "@/lib/data-account";
import { BoxCard, Farms, FreshBanner, NextDelivery, RecentOrders } from "./overview-client";

export const metadata: Metadata = { title: "Your account" };

export default function Overview() {
  return (
    <AccountShell active="Overview" title={`Hello, ${USER.first}`} sub={`Member since ${USER.since} · ${USER.area}`}>
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <NextDelivery />
        <BoxCard />
      </div>
      <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
        <RecentOrders />
        <Farms />
      </div>
      <FreshBanner />
    </AccountShell>
  );
}
