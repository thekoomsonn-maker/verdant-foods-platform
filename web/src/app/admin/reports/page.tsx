import type { Metadata } from "next";
import { A2Reports } from "@/components/admin/a2-reports";

export const metadata: Metadata = { title: "Reports · Admin" };

export default function AdminReportsPage() {
  return <A2Reports />;
}
