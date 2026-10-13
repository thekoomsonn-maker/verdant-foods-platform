import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { AddressesSection, PaymentsSection } from "./addresses-client";

export const metadata: Metadata = { title: "Addresses and payment" };

export default function Addresses() {
  return (
    <AccountShell active="Addresses and payment" title="Addresses and payment" sub="Where we deliver and how you pay">
      <AddressesSection />
      <PaymentsSection />
    </AccountShell>
  );
}
