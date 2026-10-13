import type { Metadata } from "next";
import { A2Batches } from "@/components/admin/a2-batches";

export const metadata: Metadata = { title: "Batches and handovers · Admin" };

export default function AdminBatchesPage() {
  return <A2Batches />;
}
