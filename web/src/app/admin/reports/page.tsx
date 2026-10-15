import type { Metadata } from "next";
import { AdminReports } from "@/components/admin/reports";

export const metadata: Metadata = { title: "Reports · Admin" };

export default function AdminReportsPage() {
  return <AdminReports />;
}
