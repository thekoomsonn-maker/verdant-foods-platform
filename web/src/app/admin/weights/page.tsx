import type { Metadata } from "next";
import { A2Weights } from "@/components/admin/a2-weights";

export const metadata: Metadata = { title: "Weight checks · Admin" };

export default function AdminWeightsPage() {
  return <A2Weights />;
}
