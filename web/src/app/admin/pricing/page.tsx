import type { Metadata } from "next";
import { AdminPricing } from "@/components/admin/pricing";

export const metadata: Metadata = { title: "Pricing · Admin" };

export default function AdminPricingPage() {
  return <AdminPricing />;
}
