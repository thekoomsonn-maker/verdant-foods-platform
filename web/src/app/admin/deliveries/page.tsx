import type { Metadata } from "next";
import { A2Deliveries } from "@/components/admin/a2-deliveries";

export const metadata: Metadata = { title: "Deliveries · Admin" };

export default function AdminDeliveriesPage() {
  return <A2Deliveries />;
}
