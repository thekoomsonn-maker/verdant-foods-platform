import type { Metadata } from "next";
import { AdminBatches } from "@/components/admin/batches";

export const metadata: Metadata = { title: "Batches and handovers · Admin" };

export default function AdminBatchesPage() {
  return <AdminBatches />;
}
