import type { Metadata } from "next";
import { A1Dashboard } from "@/components/admin/a1-dashboard";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminDashboard() {
  return <A1Dashboard />;
}
