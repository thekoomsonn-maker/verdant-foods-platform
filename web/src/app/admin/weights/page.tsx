import type { Metadata } from "next";
import { AdminWeights } from "@/components/admin/weights";

export const metadata: Metadata = { title: "Weight checks · Admin" };

export default function AdminWeightsPage() {
  return <AdminWeights />;
}
