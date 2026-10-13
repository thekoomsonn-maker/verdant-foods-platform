import type { Metadata } from "next";
import { A2Recalls } from "@/components/admin/a2-recalls";

export const metadata: Metadata = { title: "Recalls · Admin" };

export default function AdminRecallsPage() {
  return <A2Recalls />;
}
