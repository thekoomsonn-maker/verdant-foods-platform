import type { Metadata } from "next";
import { A2Pricing } from "@/components/admin/a2-pricing";

export const metadata: Metadata = { title: "Pricing · Admin" };

export default function AdminPricingPage() {
  return <A2Pricing />;
}
