import type { Metadata } from "next";
import { PaymentsClient } from "./payments-client";

export const metadata: Metadata = { title: "Payments and payouts · Admin" };

export default function AdminPayments() {
  return <PaymentsClient />;
}
