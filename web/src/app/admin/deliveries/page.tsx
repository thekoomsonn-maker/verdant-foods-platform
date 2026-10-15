import type { Metadata } from "next";
import { AdminDeliveries } from "@/components/admin/deliveries";

export const metadata: Metadata = { title: "Deliveries · Admin" };

export default function AdminDeliveriesPage() {
  return <AdminDeliveries />;
}
